package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"

	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2/bson"
)

var (
	tokenSecret []byte = []byte("Chuck Norris")
)

// Return a bool indicating whether the request method is correct.
// If it is not, send an error response.
func verifyMethod(wanted string, w http.ResponseWriter, r *http.Request) bool {
	if r.Method != wanted {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return false
	}
	return true
}

// Add a user to the database.
func signup(w http.ResponseWriter, r *http.Request) {
	// Make sure the request method is a POST request.
	if ok := verifyMethod("POST", w, r); !ok {
		return
	}

	// Create a User struct from the request body.
	user, ok := parseBody(w, r)
	if !ok {
		return
	}

	// Make sure required fields are filled out.
	if len(user.Password) <= 0 {
		http.Error(w, "Password required", http.StatusMethodNotAllowed)
		return
	}
	if len(user.Username) <= 0 {
		http.Error(w, "Username required", http.StatusMethodNotAllowed)
		return
	}

	// fmt.Printf("%#v\n", user)
	fmt.Printf("Signing up %v...\n", user.Username)

	// Create a new ObjectId and creation time
	//   which will be stored in the database.
	user.Id = bson.NewObjectId()
	user.CreatedAt = time.Now()

	// Encrypt the password.
	password := []byte(user.Password)
	newPassword, err := bcrypt.GenerateFromPassword(password, 10)
	if err != nil {
		fmt.Printf("bcrypt encryption failed for some reason\n")
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Overwrite the exposed password with the encrypted password
	//   within the user struct.
	user.Password = string(newPassword)

	// Add the new user to the database.
	collection := db.C("users")
	err = collection.Insert(&user)
	if err != nil {
		fmt.Printf("Database insertion failed for user:\n%#v\n", user)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Signed up!"))
}

// Verify the submitted password for a user,
//   create a token for the user,
//   update the token in the database,
//   and send the token back to the client.
func signin(w http.ResponseWriter, r *http.Request) {
	// Make sure the request method is a POST request.
	if ok := verifyMethod("POST", w, r); !ok {
		return
	}

	// Create a User struct from the request body.
	user, ok := parseBody(w, r)
	if !ok {
		return
	}

	// fmt.Printf("%#v\n", user)
	fmt.Printf("Signing in %v...\n", user.Username)

	if ok = user.verifyPassword(w, r); !ok {
		return
	}

	// Make a response object to send to the client.
	if ok = user.genToken(w, r); !ok {
		return
	}

	fmt.Printf("user:\n%#v\n\n", user)
	// 'user' example:
	// main.User{
	// 	Id:"V\x99^K\f;v\x12aj\x87.",
	// 	CreatedAt:time.Time{
	//   		sec:63588488523,
	//   		nsec:738000000,
	//   		loc:(*time.Location)(0x991c00)
	//   	},
	// 	Username:"meme",
	// 	Password:"",
	// 	Fullname:"",
	// 	Stories:[]string{},
	// 	Token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE0NTMxNTgyNjQsInVzZXIiOnsidXNlcklkIjoiNTY5OTVlNGIwYzNiNzYxMjYxNmE4NzJlIiwiY3JlYXRlZEF0IjoiMjAxNi0wMS0xNVQxNTowMjowMy43MzgtMDY6MDAiLCJ1c2VybmFtZSI6Im1lbWUiLCJwYXNzd29yZCI6IiQyYSQxMCRPTWVKZ1owOVN0d2t2WkQ2My9TeWdlbGJDOTlLdUJVd1Y1Mk45My9yVE83eC5VVExEdVl4LiIsImZ1bGxuYW1lIjoiIiwic3RvcmllcyI6W10sInRva2VuIjoiIn19.ISBygDI3ZGoIwyMwrYhEwYGJZrKtBmfzKAQhNmKlZYE"
	// }

	// Stringify the response object.
	js, err := json.Marshal(user)
	if err != nil {
		fmt.Printf("Failed to convert response data to JSON:\n%#v\n", user)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Send the response object to the client.
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}

// Get user information from the response body and headers.
func parseBody(w http.ResponseWriter, r *http.Request) (User, bool) {
	// Declare a variable for the user to sign in.
	user := User{}

	u, p, _ := r.BasicAuth()
	fmt.Printf("username: %#v\npassword: %#v\n\n", u, p)

	// Parse/decode the JSON object in the request body.
	// If the JSON object could not be parsed,
	//   the problem most likely is a mismatch
	//   between the User type and the JSON object.
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&user); err != nil {
		fmt.Printf("Failed to decode JSON object in the request\n%v\n", err)
		http.Error(w, "Invalid JSON object", http.StatusBadRequest)
		return user, false
	}

	// Get the token from the header.
	user.Token = r.Header.Get("token")

	fmt.Printf("user: %#v\n\n", user)

	return user, true
}

// Return a bool whether a user's token is valid.
// If not, send an http error.
func (u *User) verifyToken(w http.ResponseWriter, r *http.Request) bool {
	// Parse the token with the tokenSecret.
	token, err := jwt.Parse(u.Token, func(token *jwt.Token) (interface{}, error) {
		return tokenSecret, nil
	})
	if err != nil || !token.Valid {
		if err != nil {
			fmt.Printf("What? %v\n", err)
		}
		http.Error(w, "Invalid Token", http.StatusUnauthorized)
		return false
	}

	return true
}

// Return a bool whether the password submitted for a user is correct.
func (u *User) verifyPassword(w http.ResponseWriter, r *http.Request) bool {
	// Make sure required fields are filled out.
	if len(u.Password) <= 0 {
		http.Error(w, "Password required", http.StatusMethodNotAllowed)
		return false
	}
	if len(u.Username) <= 0 {
		http.Error(w, "Username required", http.StatusMethodNotAllowed)
		return false
	}

	// Remember the password sent in the request.
	// It will be overwritten when querying the database.
	attemptedPassword := []byte(u.Password)

	// Grab the user from the database
	collection := db.C("users")
	q := bson.M{"username": u.Username}
	err := collection.Find(q).One(&u)
	if err != nil {
		fmt.Printf("Failed to retrieve %v from the database\n", u.Username)
		fmt.Println(err)
		http.Error(w, "Invalid username", http.StatusUnauthorized)
		return false
	}

	// Compare the password.
	realPassword := []byte(u.Password)
	err = bcrypt.CompareHashAndPassword(realPassword, attemptedPassword)
	if err != nil {
		fmt.Printf("%v sent the wrong password\n", u.Username)
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return false
	}

	// Return true if no errors occurred.
	return true
}

// Create a token for a user,
//   store it in the *User struct,
//   update the token in the database,
//   remove the password from the *User struct.
// Return a bool indicating whether an error occurred.
func (u *User) genToken(w http.ResponseWriter, r *http.Request) bool {
	// Create a new, empty token.
	token := jwt.New(jwt.SigningMethodHS256)

	// Insert claims inside the token.
	token.Claims["user"] = u
	token.Claims["iat"] = time.Now().Unix()
	// token.Claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	// Sign the token with the super secret password.
	tokenString, err := token.SignedString(tokenSecret)
	if err != nil {
		fmt.Printf("Failed to create token\n%v\n", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return false
	}

	// Add the signed token to the User struct.
	u.Token = tokenString
	fmt.Printf("tokenString:\n%v\n", tokenString)

	// Update the token in the database.
	if err = usersCollection.Update(
		bson.M{"username": u.Username},
		bson.M{"$set": bson.M{"token": u.Token}},
	); err != nil {
		fmt.Printf("Failed to update token in the database\n%v\n", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return false
	}

	// Erase the password from the User struct for enhanced security.
	u.Password = ""

	return true
}

// Yeah, this is basically just a test dummy
func loadProfile(w http.ResponseWriter, r *http.Request) {

}
