package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/dgrijalva/jwt-go"

	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2/bson"
)

var (
	tokenSecret []byte = []byte("Chuck Norris")
)

// GET request to 'api/users/profile/<username>'.
// Respond with the full data for all of the stories
//   created by the user.
//   Find the user's stories by using the username in the url.
func loadProfile(w http.ResponseWriter, r *http.Request, username string) (error, int) {

	// Get user info from the database, using the token in the header.
	user := User{}
	err := usersCollection.Find(bson.M{"username": username}).One(&user)
	if err != nil {
		return fmt.Errorf("Failed to find user in the database\n%v\n", err),
			http.StatusNotFound
	}

	// Convert the story id's from strings to bson object id's.
	storyIds := make([]bson.ObjectId, len(user.Stories))
	for i, storyId := range user.Stories {
		storyIds[i] = bson.ObjectIdHex(storyId)
	}

	// Find full story data for data for all of the user's stories.
	stories := []Story{}
	err = storiesCollection.Find(bson.M{
		"_id": bson.M{"$in": storyIds},
	}).All(&stories)
	if err != nil {
		return fmt.Errorf("Failed to find user's stories\n%v\n", err),
			http.StatusNotFound
	}

	// Stringify the story data array into JSON format.
	js, err := json.Marshal(stories)
	if err != nil {
		return err,
			http.StatusInternalServerError
	}

	// Send the JSON object with status 200.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(js)

	return nil, http.StatusOK
}

// Verify password, create user token, update database, send token back
func signin(w http.ResponseWriter, r *http.Request) (error, int) {
	// Create a User struct from the request body.
	user, err, status := parseBody(w, r)
	if err != nil {
		return err, status
	}

	fmt.Printf("Signing in %v...\n", user.Username)

	if err, status = user.verifyPassword(); err != nil {
		return err, status
	}

	// Make a response object to send to the client.
	shouldUpdateInDb := true
	if err, status = user.genToken(shouldUpdateInDb); err != nil {
		return err, status
	}

	// Prepare to send response data.
	// Stringify the user into JSON string format.
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

// Add a user to the database.
func signup(w http.ResponseWriter, r *http.Request) (error, int) {
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

	fmt.Printf("Signing up %v...\n", user.Username)

	// Create a new ObjectId and creation time
	//   which will be stored in the database.
	user.Id = bson.NewObjectId()
	user.CreatedAt = time.Now()

	// Remeber the password submitted in the request.
	// (It will be removed from the 'user' struct insde the
	//   'user.genToken()' function)
	password := []byte(user.Password)

	// Generate a token for the user.
	shouldUpdateInDb := false
	if err, status = user.genToken(shouldUpdateInDb); err != nil {
		return err, status
	}

	// Encrypt the password.
	newPassword, err := bcrypt.GenerateFromPassword(password, 10)
	if err != nil {
		fmt.Printf("bcrypt encryption failed for some reason\n")
		return fmt.Errorf("Internal Server Error\n"),
			http.StatusInternalServerError
	}

	// Re-set the user's password to the newly encrypted one.
	user.Password = string(newPassword)

	// Add the new user to the database.
	err = usersCollection.Insert(&user)
	if err != nil {
		fmt.Printf("Database insertion failed for user:\n%#v\n", user)
		return fmt.Errorf("Internal Server Error\n"),
			http.StatusInternalServerError
	}

	// Prepare to send response data.
	// Stringify the user into JSON string format.
	js, err := json.Marshal(user)
	if err != nil {
		fmt.Printf("Failed to convert response data to JSON:\n%#v\n", user)
		return fmt.Errorf("Internal Server Error\n"),
			http.StatusInternalServerError
	}

	// Send the response object to the client.
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(http.StatusCreated)
	w.Write(js)

	fmt.Printf("Signed up %v\n", user.Username)

	return nil, http.StatusCreated
}

// Find owner of current token and remove on signout.
func signout(w http.ResponseWriter, r *http.Request) (error, int) {
	// Find user with current token.
	user := User{}
	err, status := user.getInfoFromHeaderSync(r)
	if err != nil {
		return err, status
	}

	err = usersCollection.Update(
		bson.M{"token": user.Token},
		bson.M{"$set": bson.M{"token": ""}},
	)
	if err != nil {
		return fmt.Errorf("Can't write Token to DB"),
			http.StatusInternalServerError
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Succesful Signout"))

	fmt.Printf("%v signed out\n", user.Username)

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
	var err error
	if err = decoder.Decode(&user); err != nil {
		fmt.Printf("Failed to decode JSON object in the request\n%v\n", err)
		return user, fmt.Errorf("Invalid JSON object\n"),
			http.StatusBadRequest
	}

	return user, err, http.StatusOK
}

// Return a bool whether a user's token is valid.
// If not, send an http error.
func verifyToken(userToken string) (error, int) {
	// Parse the token with the tokenSecret.
	token, err := jwt.Parse(userToken, func(token *jwt.Token) (interface{}, error) {
		return tokenSecret, nil
	})
	if err != nil || !token.Valid {
		if err != nil {
			fmt.Printf("Error verifying token: %v\n", err)
		}
		return fmt.Errorf("Invalid Token\n"),
			http.StatusUnauthorized
	}

	return nil, http.StatusOK
}

// Return a bool whether the password submitted for a user is correct.
func (u *User) verifyPassword() (error, int) {
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
func (u *User) genToken(shouldUpdateInDb bool) (error, int) {
	// Create a new, empty token.
	token := jwt.New(jwt.SigningMethodHS256)

	// Erase the password from the User struct for enhanced security.
	u.Password = ""

	// Insert claims inside the token.
	token.Claims["user"] = u
	token.Claims["iat"] = time.Now().Unix()
	// token.Claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	// Sign the token with the super secret password.
	tokenString, err := token.SignedString(tokenSecret)
	if err != nil {
		fmt.Printf("Failed to create token\n%v\n", err)
		return fmt.Errorf("Failed to create token\n%v\n", err),
			http.StatusInternalServerError
	}

	// Add the signed token to the User struct.
	u.Token = tokenString

	if !shouldUpdateInDb {
		return nil, http.StatusOK
	}

	// Update the token in the database.
	if err = usersCollection.Update(
		bson.M{"username": u.Username},
		bson.M{"$set": bson.M{"token": u.Token}},
	); err != nil {
		fmt.Printf("Failed to update token in the database\n%v\n", err)
		return fmt.Errorf("Internal Server Error"),
			http.StatusInternalServerError
	}

	return nil, http.StatusOK
}

func getUserToken(r * http.Request) (string, error, int) {
	token := r.Header.Get("token")
	err, status := verifyToken(token)
	return token, err, status
}

// Get user info from the token in the header.
// Query the database for the token,
//   and return the data received.
func (u *User) getInfoFromHeaderSync(r *http.Request) (error, int) {
	// Get user info from the token in the header.
	var err error
	var status int
	u.Token, err, status = getUserToken(r)
	if err != nil {
		return err, status
	}

	// Get user info from the database, using the token in the header.
	err = usersCollection.Find(bson.M{"token": u.Token}).One(&u)
	if err != nil {
		return fmt.Errorf("Failed to find token in the database\n%v\n", err),
			http.StatusUnauthorized
	}

	return nil, http.StatusOK
}

// Get user info from the token in the header.
// Query the database for the token,
//   and return the data received.
func (u *User) getInfoFromHeader(r *http.Request) (*sync.WaitGroup, chan error, chan int) {
	// Set goroutine variables.
	var wg sync.WaitGroup
	chanErr := make(chan error, 1)
	chanHttpStatus := make(chan int, 1)
	wg.Add(1)

	// Spawn a goroutine to find user info from the header.
	go func() {
		defer wg.Done()
		// Get user info from the database, using the token in the header.
		err, status := u.getInfoFromHeaderSync(r)
		chanErr <- err
		chanHttpStatus <- status
	}()

	return &wg, chanErr, chanHttpStatus
}

// Verify whether this user is the author of story
//   by using the string version of a story id.
// Return an error and an http status code if the user is not the author.
func (u *User) verifyAuthorship(storyId string) (error, int) {
	for _, userStoryId := range u.Stories {
		if userStoryId == storyId {
			return nil, http.StatusOK
		}
	}

	return fmt.Errorf("User is not a creator of this story"),
		http.StatusUnauthorized
}
