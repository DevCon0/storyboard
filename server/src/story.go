package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"gopkg.in/mgo.v2/bson"
)

func handleStory(w http.ResponseWriter, r *http.Request, storyId string) (error, int) {
	switch r.Method {
	case "GET":
		return getStory(w, r, storyId)
	case "POST":
		return saveStory(w, r)
	case "PUT":
		return editStory(w, r, storyId)
	case "DELETE":
		return deleteStory(w, r, storyId)
	default:
		return fmt.Errorf("Only GET and POST requests allowed\n"),
			http.StatusBadRequest
	}
}

// GET request to 'api/stories/story/<story_id>'.
// Respond with the full data for the story specified in the url.
func getStory(w http.ResponseWriter, r *http.Request, storyId string) (error, int) {
	// Make sure a story id was given in the url.
	if len(storyId) <= 0 {
		return fmt.Errorf("Story id not specified in the url\n"),
			http.StatusBadRequest
	}

	// Fetch story data from the database.
	story := Story{}
	err := storiesCollection.Find(bson.M{
		"_id": bson.ObjectIdHex(storyId),
	}).One(&story)
	if err != nil {
		return fmt.Errorf("Story not found in the database\n"),
			http.StatusNotFound
	}

	// fmt.Printf("story response Data: \n%#v\n\n", story)

	// Stringify story data into JSON string format.
	js, err := json.Marshal(story)
	if err != nil {
		return fmt.Errorf("Failed to stringify %v\n%v\n", storyId, err),
			http.StatusInternalServerError
	}

	// Send the story with status 200;
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(js)

	return nil, http.StatusOK
}

// POST request to 'api/stories/story'.
// Respond with the full data for the story specified in the url.
func saveStory(w http.ResponseWriter, r *http.Request) (error, int) {
	// Grab the JSON object in the response body
	story := Story{}

	err := json.NewDecoder(r.Body).Decode(&story)
	if err != nil {
		return fmt.Errorf("Invalid JSON object in request body \n%v\n", err),
			http.StatusBadRequest
	}

	if len(story.Frames) <= 0 {
		return fmt.Errorf("Incomplete JSON data\n"),
			http.StatusBadRequest
	}

	// fmt.Printf("story from request: %v\n", story)

	// Get user info from the token in the header.
	user := User{}
	user.Token = r.Header.Get("token")
	err, status := user.verifyToken()
	if err != nil {
		return err, status
	}

	// Get user info from the database, using the token in the header.
	err = usersCollection.Find(bson.M{"token": user.Token}).One(&user)
	if err != nil {
		return err,
			http.StatusNotFound
	}

	// Set mongo values "_id" and "created_at" (cf. 'schema.go').
	story.Id = bson.NewObjectId()
	story.CreatedAt = time.Now()
	// story.Author = user.Username

	// Add the new story to the database.
	err = storiesCollection.Insert(&story)
	if err != nil {
		return fmt.Errorf("Error adding story to Mongo: \n%v\n", err),
			http.StatusInternalServerError
	}

	// Save storyId to current users' array of stories
	err = usersCollection.Update(
		bson.M{"username": user.Username},
		bson.M{"$push": bson.M{"stories": story.Id.Hex()}},
	)
	if err != nil {
		return fmt.Errorf("Failed to add story to user's stories\n%v\n", err),
			http.StatusInternalServerError
	}

	// Stringify the story data into JSON format.
	js, err := json.Marshal(story)
	if err != nil {
		return err,
			http.StatusInternalServerError
	}

	// Send the new story JSON object with status 201.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(js)

	return nil, http.StatusCreated
}

// GET request to 'api/stories/library'.
// Respond with the full data for all of the stories
//   created by a signed-in user.
//   Find the user's stories by using the token in the request header.
func library(w http.ResponseWriter, r *http.Request, userId string) (error, int) {
	// Make sure that this is a GET request.
	if err, status := verifyMethod("GET", w, r); err != nil {
		return err, status
	}

	// Get user info from the token in the header.
	user := User{}
	user.Token = r.Header.Get("token")

	// Get user info from the database, using the token in the header.
	err := usersCollection.Find(bson.M{"token": user.Token}).One(&user)
	if err != nil {
		return fmt.Errorf("Failed to find token in the database\n%v\n", err),
			http.StatusUnauthorized
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

	// fmt.Printf("%#v\n", stories)

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

// GET request to 'api/stories/showcase'.
// Respond with the full data for the top 3 stories.
func showCase(w http.ResponseWriter, r *http.Request) (error, int) {
	stories := []Story{}

	err := storiesCollection.Find(nil).Limit(3).Sort("rating").All(
		&stories,
	)
	if err != nil {
		return err, http.StatusNotFound
	}

	// fmt.Printf("Number of stories: %v\n%#v\n", len(stories), stories)

	// Stringify the story data into JSON format.
	js, err := json.Marshal(stories)
	if err != nil {
		return err, http.StatusInternalServerError
	}

	// Send the JSON object with status 200.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(js)

	return nil, http.StatusOK
}

// GET request to 'api/stories/showcase'.
// Respond with the full data for 3 random stories.
func showCaseRandom(w http.ResponseWriter, r *http.Request) (error, int) {
	stories := []Story{}

	err := storiesCollection.Find(nil).All(&stories)
	if err != nil {
		return err, http.StatusNotFound
	}

	max := len(stories)
	randomNumbers := []int{}
	randomStories := make([]Story, 3)
	i := 0
	for {
		n := rand.Intn(max)
		if intSlcContains(randomNumbers, n) {
			continue
		}
		randomNumbers = append(randomNumbers, n)
		randomStories[i] = stories[n]

		i++
		if i >= 3 {
			break
		}
	}

	// Stringify the story data into JSON format.
	js, err := json.Marshal(randomStories)
	if err != nil {
		return err, http.StatusInternalServerError
	}

	// Send the JSON object with status 200.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(js)

	return nil, http.StatusOK
}

func intSlcContains(slc []int, q int) bool {
	for _, n := range slc {
		if n == q {
			return true
		}
	}
	return false
}

// PUT request to 'api/stories/story/<story_id>'.
// Respond with the full data for the story specified in the url.
func editStory(w http.ResponseWriter, r *http.Request, storyId string) (error, int) {
	// Make sure a story id was given in the url.
	if len(storyId) <= 0 {
		return fmt.Errorf("Story id not specified in the url\n"),
			http.StatusBadRequest
	}

	// Fetch story data from the database.
	story := Story{}
	err := storiesCollection.Find(bson.M{
		"_id": bson.ObjectIdHex(storyId),
	}).One(&story)
	if err != nil {
		return fmt.Errorf("Story not found in the database\n"),
			http.StatusNotFound
	}

	// fmt.Printf("story response Data: \n%#v\n\n", story)

	// Stringify story data into JSON string format.
	js, err := json.Marshal(story)
	if err != nil {
		return fmt.Errorf("Failed to stringify %v\n%v\n", storyId, err),
			http.StatusInternalServerError
	}

	// Send the story with status 200;
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(js)

	return nil, http.StatusOK
}

// DELETE request to 'api/stories/story/<story_id>'.
// Only the owner of the story can delete it.
// Respond with the full data for the story specified in the url.
func deleteStory(w http.ResponseWriter, r *http.Request, storyId string) (error, int) {
	// Make sure a story id was given in the url.
	if len(storyId) <= 0 {
		return fmt.Errorf("Story id not specified in the url\n"),
			http.StatusBadRequest
	}

	storyObjectId := bson.ObjectIdHex(storyId)

	// Fetch story data from the database.
	story := Story{}
	err := storiesCollection.Find(bson.M{
		"_id": storyObjectId,
	}).One(&story)
	if err != nil {
		return fmt.Errorf("Story not found in the database\n"),
			http.StatusNotFound
	}

	// Get user info from the token in the header.
	user := User{}
	user.Token = r.Header.Get("token")
	err, status := user.verifyToken()
	if err != nil {
		return err, status
	}

	// Get user info from the database, using the token in the header.
	err = usersCollection.Find(bson.M{"token": user.Token}).One(&user)
	if err != nil {
		return fmt.Errorf("Failed to find token in the database\n%v\n", err),
			http.StatusUnauthorized
	}

	fmt.Printf("User stories before:\n%#v\n", user.Stories)

	// Make sure that the user with this token is the creator of this story.
	userOwnsStory := false
	for i, userStoryId := range user.Stories {
		if userStoryId == storyId {
			userOwnsStory = true
			user.Stories = append(user.Stories[:i], user.Stories[i+1:]...)
			break
		}
	}
	fmt.Printf("User stories after:\n%#v\n", user.Stories)
	if userOwnsStory == false {
		return fmt.Errorf("User is not a creator of this story\n"),
			http.StatusUnauthorized
	}

	// Remove story data from the database.
	err = storiesCollection.Remove(
		bson.M{"_id": storyObjectId, "username": user.Username},
	)
	if err != nil {
		return fmt.Errorf("Failed to remove story in the database\n%v\n", err),
			http.StatusNotFound
	}

	// Update the list of user's stories in the database.
	err = usersCollection.Update(
		bson.M{"username": user.Username},
		bson.M{"$pull": bson.M{"stories": storyId}},
	)
	if err != nil {
		return fmt.Errorf("Failed to remove story in the database\n%v\n", err),
			http.StatusNotFound
	}

	// Send the story with status 200;
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Story deleted"))

	return nil, http.StatusOK
}
