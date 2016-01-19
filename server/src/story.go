package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"gopkg.in/mgo.v2/bson"
)

func handleStory(w http.ResponseWriter, r *http.Request, storyId string) {
	if r.Method == "GET" {
		getStory(w, r, storyId)
	}
	if r.Method == "POST" {
		saveStory(w, r)
	}
}

// GET request to 'api/stories/story/<story_id>'.
// Respond with the full data for the story specified in the url.
func getStory(w http.ResponseWriter, r *http.Request, storyId string) {
	// Make sure a story id was given in the url.
	if len(storyId) <= 0 {
		fmt.Println("Story id not specified in the url")
		http.Error(
			w, "Story id not specified in the url", http.StatusBadRequest,
		)
		return
	}

	// Fetch story data from the database.
	story := Story{}
	err := storiesCollection.Find(bson.M{
		"_id": bson.ObjectIdHex(storyId),
	}).One(&story)
	if err != nil {
		fmt.Println("Story not found in the database")
		http.Error(
			w, "Story not found in the database", http.StatusNotFound,
		)
		return
	}

	// fmt.Printf("story response Data: \n%#v\n\n", story)

	// Stringify story data into JSON string format.
	js, err := json.Marshal(story)
	if err != nil {
		fmt.Printf("Failed to stringify:\n%#v\n%v\n", story, err)
		http.Error(
			w, err.Error(), http.StatusInternalServerError,
		)
		return
	}

	// Send the story with status 200;
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(js)
}

// POST request to 'api/stories/story'.
// Respond with the full data for the story specified in the url.
func saveStory(w http.ResponseWriter, r *http.Request) {
	// Grab the JSON object in the response body
	story := Story{}
	if err := json.NewDecoder(r.Body).Decode(&story); err != nil {
		fmt.Printf("Problem decoding story object: \n%v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// fmt.Printf("story from request: %v\n", story)

	// Set mongo values "_id" and "created_at" (cf. 'schema.go').
	story.Id = bson.NewObjectId()
	story.CreatedAt = time.Now()

	// Add the new story to the database.
	if err := storiesCollection.Insert(&story); err != nil {
		fmt.Printf("Error adding story to Mongo: \n%v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get user info from the token in the header.
	user := User{}
	user.Token = r.Header.Get("token")

	// Get user info from the database, using the token in the header.
	err := usersCollection.Find(bson.M{"token": user.Token}).One(&user)
	if err != nil {

		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// Save storyId to current users' array of stories
	err = usersCollection.Update(
		bson.M{"username": user.Username},
		bson.M{"$push": bson.M{"stories": story.Id.Hex()}},
	)
	if err != nil {
		fmt.Printf("Error adding story to user stories array : %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Stringify the story data into JSON format.
	js, err := json.Marshal(story)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the new story JSON object with status 201.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(js)

}

// GET request to 'api/stories/library'.
// Respond with the full data for all of the stories
//   created by a signed-in user.
//   Find the user's stories by using the token in the request header.
func library(w http.ResponseWriter, r *http.Request, userId string) {
	// Make sure that this is a GET request.
	if ok := verifyMethod("GET", w, r); !ok {
		return
	}

	// Get user info from the token in the header.
	user := User{}
	user.Token = r.Header.Get("token")

	// Get user info from the database, using the token in the header.
	err := usersCollection.Find(bson.M{"token": user.Token}).One(&user)
	if err != nil {
		fmt.Printf("Failed to find token in the database\n%v\n", err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// Convert the story id's from strings to bson object id's.
	storyIds := make([]bson.ObjectId, len(user.Stories))
	for i, storyId := range user.Stories {
		storyIds[i] = bson.ObjectIdHex(storyId)
	}

	// Find full story data for data for all of the user's stories.
	stories := []Story{}
	err = storiesCollection.Find(
		bson.M{"_id": bson.M{"$in": storyIds}},
	).All(&stories)
	if err != nil {
		fmt.Printf("Failed to find user's stories in the database\n%v\n", err)
		http.Error(w, "No user stories found", http.StatusNotFound)
		return
	}

	// fmt.Printf("%#v\n", stories)

	// Stringify the story data array into JSON format.
	js, err := json.Marshal(stories)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the JSON object with status 200.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(js)
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
// Respond with the full data for the top 3 stories.
func showCase2(w http.ResponseWriter, r *http.Request) {
	stories := []Story{}

	err := storiesCollection.Find(nil).Limit(3).Sort("rating").All(&stories)
	if err != nil {
		fmt.Printf(
			"Failed to find showcase stories in the database\n%v\n", err,
		)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// fmt.Printf("Number of stories: %v\n%#v\n", len(stories), stories)

	// Stringify the story data into JSON format.
	js, err := json.Marshal(stories)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the JSON object with status 200.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(js)
}
