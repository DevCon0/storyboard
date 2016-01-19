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
func verifyMethod(wanted string, w http.ResponseWriter, r *http.Request) (error, int) {
	if r.Method != wanted {
		return fmt.Errorf("Method Not Allowed\n"),
			http.StatusMethodNotAllowed
	}
	return nil, http.StatusOK
}

// Add a user to the database.
func signup(w http.ResponseWriter, r *http.Request) (error, int) {
	// Make sure the request method is a POST request.
	if err, status := verifyMethod("POST", w, r); err != nil {
		return err, status
	}

	// Create a User struct from the request body.
	user, err, status := parseBody(w, r)
	if err != nil {
		return err, status
	}

	// Make sure required fields are filled out.
	if len(user.Password) <= 0 {
		return fmt.Errorf("Password required\n"),
			http.StatusMethodNotAllowed
	}
	if len(user.Username) <= 0 {
		return fmt.Errorf("Username required\n"),
			http.StatusMethodNotAllowed
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
		return fmt.Errorf("Internal Server Error\n"),
			http.StatusInternalServerError
	}

	// Overwrite exposed password with encrypted password
	user.Password = string(newPassword)

	// Add the new user to the database.
	collection := db.C("users")
	err = collection.Insert(&user)
	if err != nil {
		fmt.Printf("Database insertion failed for user:\n%#v\n", user)
		return fmt.Errorf("Internal Server Error\n"),
			http.StatusInternalServerError
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Signed up!"))

	fmt.Printf("Signed up %v\n", user.Username)

	return nil, http.StatusCreated
}

// Verify password, create user token, update database, send token back
func signin(w http.ResponseWriter, r *http.Request) (error, int) {
	// Make sure the request method is a POST request.
	if err, status := verifyMethod("POST", w, r); err != nil {
		return err, status
	}

	// Create a User struct from the request body.
	user, err, status := parseBody(w, r)
	if err != nil {
		return err, status
	}

	fmt.Printf("Signing in %v...\n", user.Username)

	if err, status = user.verifyPassword(w, r); err != nil {
		return err, status
	}

	// Make a response object to send to the client.
	if err, status = user.genToken(w, r); err != nil {
		return err, status
	}

	// fmt.Printf("user:\n%#v\n\n", user)

	// Stringify the response object.
	js, err := json.Marshal(user)
	if err != nil {
		fmt.Printf("Failed to convert response data to JSON:\n%#v\n", user)
		return fmt.Errorf("Internal Server Error\n"),
			http.StatusInternalServerError
	}

	// Send the response object to the client.
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)

	fmt.Printf("Signed in %v\n", user.Username)

	return nil, http.StatusOK
}

// find owner of current token, and remove on signout
func signout(w http.ResponseWriter, r *http.Request) (error, int) {
	token := r.Header.Get("token")

	if token == "" {
		return fmt.Errorf("Empty Token in Header\n"),
			http.StatusBadRequest
	}

	// find user with current token
	user := User{}
	collection := db.C("users")
	q := bson.M{"token": token}
	err := collection.Find(q).One(&user)
	if err != nil {
		fmt.Printf("User token: %v\n", err)
		return fmt.Errorf("Bad Token in Header\n"),
			http.StatusBadRequest
	}

	err = collection.Update(
		bson.M{"token": user.Token},
		bson.M{"$set": bson.M{"token": ""}},
	)
	if err != nil {
		fmt.Printf("Can not set token to blank %v\n", err)
		return fmt.Errorf("Can't write Token to DB\n"),
			http.StatusInternalServerError
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Succesful Signout"))

	return nil, http.StatusOK
}

// Get user information from the response body and headers.
func parseBody(w http.ResponseWriter, r *http.Request) (User, error, int) {
	// Declare a variable for the user to sign in.
	user := User{}

	// Parse/decode JSON object in the request body.
	// If the JSON object could not be parsed,
	//   the problem most likely is a mismatch
	//   between the User type and the JSON object.
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&user); err != nil {
		fmt.Printf("Failed to decode JSON object in the request\n%v\n", err)
		return user, fmt.Errorf("Invalid JSON object\n"),
			http.StatusBadRequest
	}

	// Get the token from the header.
	user.Token = r.Header.Get("token")

	// fmt.Printf("user: %#v\n\n", user)

	return user, nil, http.StatusOK
}

// Return a bool whether a user's token is valid.
// If not, send an http error.
func (u *User) verifyToken(w http.ResponseWriter, r *http.Request) (error, int) {
	// Parse the token with the tokenSecret.
	token, err := jwt.Parse(u.Token, func(token *jwt.Token) (interface{}, error) {
		return tokenSecret, nil
	})
	if err != nil || !token.Valid {
		if err != nil {
			fmt.Printf("What? %v\n", err)
		}
		return fmt.Errorf("Invalid Token\n"),
			http.StatusUnauthorized
	}

	return nil, http.StatusOK
}

// Return a bool whether the password submitted for a user is correct.
func (u *User) verifyPassword(w http.ResponseWriter, r *http.Request) (error, int) {
	// Make sure required fields are filled out.
	if len(u.Password) <= 0 {
		return fmt.Errorf("Password required"),
			http.StatusMethodNotAllowed
	}
	if len(u.Username) <= 0 {
		return fmt.Errorf("Username required"),
			http.StatusMethodNotAllowed
	}

	// Remember user sent password
	attemptedPassword := []byte(u.Password)

	// Grab the user from the database
	err := usersCollection.Find(bson.M{"username": u.Username}).One(&u)
	if err != nil {
		fmt.Printf("Failed to retrieve %v from the database\n", u.Username)
		return fmt.Errorf("Invalid username"),
			http.StatusUnauthorized
	}

	// Compare the password.
	realPassword := []byte(u.Password)

	err = bcrypt.CompareHashAndPassword(realPassword, attemptedPassword)
	if err != nil {
		fmt.Printf("%v sent the wrong password\n", u.Username)
		return fmt.Errorf("Invalid password"),
			http.StatusUnauthorized
	}

	// Return true if no errors occurred.
	return nil, http.StatusOK
}

// Create a token for a user,
//   store it in the *User struct,
//   update the token in the database,
//   remove the password from the *User struct.
// Return a bool indicating whether an error occurred.
func (u *User) genToken(w http.ResponseWriter, r *http.Request) (error, int) {
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
		return fmt.Errorf("Internal Server Error"),
			http.StatusInternalServerError
	}

	// Add the signed token to the User struct.
	u.Token = tokenString
	// fmt.Printf("tokenString:\n%v\n", tokenString)

	// Update the token in the database.
	if err = usersCollection.Update(
		bson.M{"username": u.Username},
		bson.M{"$set": bson.M{"token": u.Token}},
	); err != nil {
		fmt.Printf("Failed to update token in the database\n%v\n", err)
		return fmt.Errorf("Internal Server Error"),
			http.StatusInternalServerError
	}

	// Erase the password from the User struct for enhanced security.
	u.Password = ""

	return nil, http.StatusOK
}

// Yeah, this is basically just a test dummy
func loadProfile(w http.ResponseWriter, r *http.Request) (error, int) {
	return nil, http.StatusOK
}
