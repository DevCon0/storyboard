package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"gopkg.in/mgo.v2/bson"
)

func storyHandler(w http.ResponseWriter, r *http.Request) {
	baseLocation := "api/stories/"
	location := r.URL.Path[1:]
	location = strings.TrimPrefix(location, baseLocation)

	fmt.Println("stories location", location)

	switch location {

	case "get":
		getStory(w, r)

	case "save":
		saveStory(w, r)

	default:
		fmt.Printf("Unknown stories api location: %v\n", location)
	}
}

func saveStory(w http.ResponseWriter, r *http.Request) {
	// Grab json object and prep for golang
	decoder := json.NewDecoder(r.Body)
	story := Story{}
	err := decoder.Decode(&story)

	if err != nil {
		fmt.printf("Problem decoding story object: %v\n", err)
	}

	story.Id = bson.NewObjectId()
	story.CreatedAt = time.Now()

	// Add new story to the database
	collection := db.C("stories")
	err = collection.Insert(&story)
	if err != nil {
		printf("Error adding story to Mongo: %v", err)
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Story saved!"))
	// Save storyId to current users' array of stories
}

func getStory(w http.ResponseWriter, r *http.Request) {
	// Grab json object and prep for golang
	decoder := json.NewDecoder(r.Body)
	story := Story{}
	err := decoder.Decode(&story)

	if err != nil {
		fmt.printf("Problem grabbing story object: %v\n", err)
	}

	// Fetch story from Mongo
	q := bson.M{"title": story.Title}
	collection := db.C("stories")
	err = collection.Find(q).One(&story)

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

  storyData := make(map[string]inteface{}) {
  "Id":        story.Id,
  "CreatedAt": story.CreatedAt,
  "Title":     story.Title,
  "UserId":    story.UserId,
  "FRAME1":    story.FRAME1,
  "FRAME2":    story.FRAME2,
  "FRAME3":    story.FRAME3,
  "Frames":    story.Frames
}

  fmt.Printf("story response Data: \n%#v\n\n", storyData)

  js, err := json.Marshal(userData)
  if err !=nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }
  w.Header().Set("Content-Type", "application/json")
  w.Write(js)
}

func getLibrary(w http.ResponseWriter, r *http.Request) {
	// Grab json object and prep for golang
	decoder := json.NewDecoder(r.Body)
	user := User{}
	err := decoder.Decode(&user)

	if err != nil {
		fmt.printf("Problem grabbing user object: %v\n", err)
	}

	// Fetch username story array
	// Fetch all stories in that array
	// return array of json story objects for the dashboard

}
