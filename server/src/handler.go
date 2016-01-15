package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"

	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2/bson"
)

var (
	tokenSecret []byte = []byte("Chuck Norris")
)

// Basic file handling.
func clientHandler(w http.ResponseWriter, r *http.Request) {
	fileRequested := r.URL.Path[1:]

	// "/" => "/index.html"
	if fileRequested == "" {
		fileRequested = concat(fileRequested, "index.html")
	}

	//    "/bower_components/mithril/mithril.min.js"
	// => "/$PWD/client/bower_components/mithril/mithril.min.js"
	title := concat(rootDir, slash, "client", slash, fileRequested)

	fmt.Printf("Serving file:\n    %q\n", title)

	// writeSampleJson(w)

	http.ServeFile(w, r, title)
}

func usersHandler(w http.ResponseWriter, r *http.Request) {
	// Check the url extension for "signin", "signup", etc.
	// Check if GET or POST request.

	// fmt.Println(r.Method)

	baseLocation := "api/users/"

	location := r.URL.Path[1:]
	location = strings.TrimPrefix(location, baseLocation)

	fmt.Println("location", location)

	switch location {

	case "signup":
		signup(w, r)

	case "signin":
		signin(w, r)

	default:
		fmt.Printf("No idea what this is: %v\n", location)
	}
}

// type UserReq struct {
// 	Username  string
// 	Password  string
// 	Firstname string
// 	Lastname  string
// }

func signup(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Signup up...")

	// Get JSON object.
	decoder := json.NewDecoder(r.Body)
	user := User{}
	err := decoder.Decode(&user)
	chkerr(err)
	// fmt.Printf("%#v\n", user)
	fmt.Printf("Signing up %v...\n", user.Username)

	// Prepare to insert in the database.
	user.Id = bson.NewObjectId()
	user.CreatedAt = time.Now()

	if user.Lastname == "" {
		user.Lastname = "StoryTeller"
	}

	// Encrypt the password.
	password := []byte(user.Password)
	newPassword, err := bcrypt.GenerateFromPassword(password, 10)
	chkerr(err)
	user.Password = string(newPassword)

	// Add the new user to the database.
	collection := db.C("users")
	err = collection.Insert(&user)
	chkerr(err)

	// Send back user information.
	// js, err := json.Marshal(user)
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }

	// w.Header().Set("Content-Type", "application/json")
	// w.Write(js)

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
	// collection := db.C("testUsers")

	// fmt.Println("Signing in...")
	decoder := json.NewDecoder(r.Body)
	user := User{}
	err := decoder.Decode(&user)
	// chkerr(err)
	if err != nil {
		fmt.Printf("Error building user for signin %v\n", err)
	}
	chkerr(err)
	// fmt.Printf("%#v\n", user)
	attemptedPassword := []byte(user.Password)
	fmt.Printf("Signing in %v...\n", user.Username)

	// Grab the  user from the database
	q := bson.M{"username": user.Username}
	collection := db.C("users")
	err = collection.Find(q).One(&user)

	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// chkerr(err)
	fmt.Printf("%#v\n", user)
	chkerr(err)
	// fmt.Printf("%#v\n", user)

	// Compare the password.
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), attemptedPassword)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	userData := UserDataResponse{
		Id:        user.Id,
		Username:  user.Username,
		Firstname: user.Firstname,
		Lastname:  user.Lastname,
		Stories:   user.Stories,
		Token:     user.genToken(),
	}
	fmt.Printf("userData:\n%#v\n\n", userData)

	js, err := json.Marshal(userData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}

func (u *User) genToken() string {
	// Create the token
	token := jwt.New(jwt.SigningMethodHS256)
	// Set some claims
	token.Claims["user"] = u
	token.Claims["iat"] = time.Now().Unix()
	// token.Claims["exp"] = time.Now().Add(time.Hour * 72).Unix()
	// Sign and get the complete encoded token as a string
	tokenString, err := token.SignedString(tokenSecret)
	if err != nil {
		fmt.Println("Failed to create token")
		fmt.Println(err)
	}
	return tokenString
}

// func writeSampleJson(w http.ResponseWriter) {
// profile := User{bson.NewObjectId(), bson.Now(), "Bob", "Sue", "Bob", "Sue", []string{}}
// js, err := json.Marshal(profile)
// if err != nil {
// 	http.Error(w, err.Error(), http.StatusInternalServerError)
// 	return
// }

// w.Header().Set("Content-Type", "application/json")
// w.Write(js)
// }
