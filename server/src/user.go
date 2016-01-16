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

func signup(w http.ResponseWriter, r *http.Request) {
	// Make sure the request method is a POST request.
	if r.Method != "POST" {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// Declare a variable for the user to sign up.
	user := User{}

	// Parse/decode the JSON object in the request body.
	// If the JSON object could not be parsed,
	//   the problem most likely is a mismatch
	//   between the User type and the JSON object.
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&user)
	if err != nil {
		fmt.Printf("Failed to decode JSON object in the request\n%v\n", err)
		http.Error(w, "Invalid JSON object", http.StatusBadRequest)
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

	// Set default values.
	if user.Lastname == "" {
		user.Lastname = "StoryTeller"
	}

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

type UserDataResponse struct {
	Id        bson.ObjectId `bson:"_id,omitempty"`
	Username  string
	Firstname string
	Lastname  string
	Stories   []string
	Token     string
}

func signin(w http.ResponseWriter, r *http.Request) {
	// Make sure the request method is a POST request.
	if r.Method != "POST" {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// Declare a variable for the user to sign in.
	user := User{}

	// Parse/decode the JSON object in the request body.
	// If the JSON object could not be parsed,
	//   the problem most likely is a mismatch
	//   between the User type and the JSON object.
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&user)
	if err != nil {
		fmt.Printf("Failed to decode JSON object in the request\n%v\n", err)
		http.Error(w, "Invalid JSON object", http.StatusBadRequest)
	}

	// fmt.Printf("%#v\n", user)
	fmt.Printf("Signing in %v...\n", user.Username)

	// Make sure required fields are filled out.
	if len(user.Password) <= 0 {
		http.Error(w, "Password required", http.StatusMethodNotAllowed)
		return
	}
	if len(user.Username) <= 0 {
		http.Error(w, "Username required", http.StatusMethodNotAllowed)
		return
	}

	// Remember the password sent in the request.
	// It will be overwritten when querying the database.
	attemptedPassword := []byte(user.Password)

	// Grab the user from the database
	collection := db.C("users")
	q := bson.M{"username": user.Username}
	err = collection.Find(q).One(&user)
	if err != nil {
		fmt.Printf("Failed to retrieve %v from the database\n", user.Username)
		fmt.Println(err)
		http.Error(w, "Invalid username", http.StatusUnauthorized)
		return
	}

	// Compare the password.
	realPassword := []byte(user.Password)
	err = bcrypt.CompareHashAndPassword(realPassword, attemptedPassword)
	if err != nil {
		fmt.Printf("%v sent the wrong password\n", user.Username)
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// Make a response object to send to the client.
	token := user.genToken()
	if len(token) <= 0 {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
	userData := UserDataResponse{
		Id:        user.Id,
		Username:  user.Username,
		Firstname: user.Firstname,
		Lastname:  user.Lastname,
		Stories:   user.Stories,
		Token:     token,
	}
	// fmt.Printf("userData:\n%#v\n\n", userData)

	// Stringify the response object.
	js, err := json.Marshal(userData)
	if err != nil {
		fmt.Printf(
			"Failed to stringify signin response object:\n%#v\n",
			userData,
		)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Send the response object to the client.
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}

func (u *User) genToken() string {
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
		return ""
	}
	return tokenString
}
