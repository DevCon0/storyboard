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

func getStory(w http.ResponseWriter, r *http.Request, storyId string) {

	story := Story{}
	// Fetch story from Mongo
	q := bson.M{"_id": bson.ObjectIdHex(storyId)}
	fmt.Println("q", q)
	collection := db.C("stories")
	err := collection.Find(q).One(&story)

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	fmt.Printf("story response Data: \n%#v\n\n", story)

	js, err := json.Marshal(story)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)

}

func saveStory(w http.ResponseWriter, r *http.Request) {
	// Grab json object and prep for golang
	decoder := json.NewDecoder(r.Body)
	story := Story{}
	err := decoder.Decode(&story)

	if err != nil {
		fmt.Printf("Problem decoding story object: %v\n", err)
	}

	story.Id = bson.NewObjectId()
	story.CreatedAt = time.Now()

	// Add new story to the database
	collection := db.C("stories")
	err = collection.Insert(&story)
	if err != nil {
		fmt.Printf("Error adding story to Mongo: %v", err)
	}

	js, err := json.Marshal(story)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
	// w.WriteHeader(http.StatusCreated)
	// w.Write([]byte("Story saved!"))
	// Save storyId to current users' array of stories
}

func library(w http.ResponseWriter, r *http.Request, userId string) {
	// // Return based on user

	// if err != nil {
	//   fmt.Printf("Problem grabbing user object: %v\n", err)
	// }

	// Fetch username story array
	// Fetch all stories in that array
	// return array of json story objects for the dashboard

}
