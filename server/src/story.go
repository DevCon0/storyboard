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

	fmt.Printf("story from request: %v\n", story)

	if err != nil {
		fmt.Printf("Problem decoding story object: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	story.Id = bson.NewObjectId()
	story.CreatedAt = time.Now()

	// Add new story to the database
	collection := db.C("stories")
	err = collection.Insert(&story)
	if err != nil {
		fmt.Printf("Error adding story to Mongo: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	user := User{}
	user.Token = r.Header.Get("token")

	q := bson.M{"token": user.Token}

	collection = db.C("users")
	err = collection.Find(q).One(&user)

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	err = collection.Update(
		bson.M{"username": user.Username},
		bson.M{"$push": bson.M{"stories": story.Id.Hex()}},
	)
	if err != nil {
		fmt.Printf("Error adding story to user stories array : %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	js, err := json.Marshal(story)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Save storyId to current users' array of stories

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(js)

}

func library(w http.ResponseWriter, r *http.Request, userId string) {
	user := User{}
	user.Token = r.Header.Get("token")

	q := bson.M{"token": user.Token}

	collection := db.C("users")
	err := collection.Find(q).One(&user)

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	js, err := json.Marshal(user.Stories)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}

func showCase(w http.ResponseWriter, r *http.Request) {
	stories := []Story{}

	err := storiesCollection.Find(
		bson.M{},
	).All(&stories)


	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	resData := stories[0:3]

	js, err := json.Marshal(resData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}
