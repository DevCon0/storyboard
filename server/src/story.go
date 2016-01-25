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
		return editStory(w, r)
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
	storyObjectId := bson.ObjectIdHex(storyId)

	// Update the views in the database.
	err := storiesCollection.Update(bson.M{
		"_id": storyObjectId,
	}, bson.M{
		"$inc": bson.M{
			"views": 1,
		},
	})
	if err != nil {
		return fmt.Errorf("Failed to update story views in the database\n"),
			http.StatusNotFound
	}

	// Fetch story data from the database.
	story := Story{}
	err = storiesCollection.Find(bson.M{
		"_id": storyObjectId,
	}).One(&story)
	if err != nil {
		return fmt.Errorf("Story not found in the database\n"),
			http.StatusNotFound
	}

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
	user := User{}
	var err error
	status := http.StatusOK

	chanErrGetUserInfoFromHeader := make(chan error, 1)
	chanHttpStatus := make(chan int, 1)

	// Spawn a new thread to find user info from the header.
	go func() {
		// Get user info from the token in the header.
		user, err, status = getUserInfoFromHeader(r)
		chanErrGetUserInfoFromHeader <- err
		chanHttpStatus <- status
	}()

	// Concurrently, decode the JSON object in the request body.
	story := Story{}
	err = json.NewDecoder(r.Body).Decode(&story)
	if err != nil {
		return fmt.Errorf("Invalid JSON object in request body \n%v\n", err),
			http.StatusBadRequest
	}

	if len(story.Frames) == 0 {
		return fmt.Errorf("Incomplete JSON data\n"),
			http.StatusBadRequest
	}

	// Set mongo values "_id" and "created_at" (cf. 'schema.go').
	story.Id = bson.NewObjectId()
	story.CreatedAt = time.Now()

	// Set defaults for 'story.Frames'.
	for i := 0; i < 3; i++ {
		frame := &story.Frames[i]
		// Skip if the previewUrl is already set.
		if frame.PreviewUrl != "" {
			continue
		}

		if frame.MediaType == 1 {
			// If the frame is an image,
			//   set the PreviewUrl to the ImageUrl.
			frame.PreviewUrl = frame.ImageUrl
		} else {
			// If the frame is a video,
			//   set the thumbnail to the first frame in the YouTube video.
			videoId := frame.VideoId
			previewUrl := concat("https://img.youtube.com/vi/", videoId, "/1.jpg")
			frame.PreviewUrl = previewUrl
		}
	}

	// Wait for both threads to complete.
	// Return an error if one was found.
	if err = <-chanErrGetUserInfoFromHeader; err != nil {
		return err, <-chanHttpStatus
	}

	// Set default values.
	story.Views = 0
	if story.Author == "" {
		story.Author = user.Username
	}

	// Spawn a new thread to add the storyId
	//   to the current user's array of stories.
	chanErrUserStoriesUpdate := make(chan error, 1)
	go func() {
		chanErrUserStoriesUpdate <- usersCollection.Update(
			bson.M{"username": user.Username},
			bson.M{"$push": bson.M{"stories": story.Id.Hex()}},
		)
	}()

	// Add the new story to the database.
	err = storiesCollection.Insert(&story)
	if err != nil {
		return fmt.Errorf("Error adding story to Mongo: \n%v\n", err),
			http.StatusInternalServerError
	}

	// Start building the http response data.
	// Stringify the story data into JSON format.
	jsonStoryResponseData, err := json.Marshal(story)
	if err != nil {
		return err,
			http.StatusInternalServerError
	}

	// Wait for both threads to complete.
	// Return an error if one was found.
	if err = <-chanErrUserStoriesUpdate; err != nil {
		return fmt.Errorf("Failed to add story to user's stories\n%v\n", err),
			http.StatusInternalServerError
	}

	// Send the new story JSON object with status 201.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(jsonStoryResponseData)

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
	// Get all stories from the database.
	stories := []Story{}
	err := storiesCollection.Find(nil).All(&stories)
	if err != nil {
		return err, http.StatusNotFound
	}

	// Randomize the stories.
	numberOfStories := len(stories)
	// Declare a slice which will contain the random numbers used.
	randomNumbers := []int{}
	// Make an array which will serve as a randomized copy of 'stories'.
	limit := 15
	randomStories := make([]Story, limit)

	i := 0
	for {
		// Get a random number between 0 and the number of stories.
		randomIndex := rand.Intn(numberOfStories)
		if intSlcContains(randomNumbers, randomIndex) {
			continue
		}
		randomNumbers = append(randomNumbers, randomIndex)
		randomStories[i] = stories[randomIndex]

		i++
		if i == limit || i == numberOfStories {
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

// PUT request to 'api/stories/story'.
// Update a story's information in the database.
func editStory(w http.ResponseWriter, r *http.Request) (error, int) {
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

	// Get user info from the token in the header.
	user, err, status := getUserInfoFromHeader(r)
	if err != nil {
		return err, status
	}

	// Make sure that the token owner is the
	//   autor of this story.
	err, status = user.verifyAuthorship(story.Id.Hex())
	if err != nil {
		return err, status
	}

	// Fetch story data from the database.
	err = storiesCollection.Update(
		bson.M{"_id": story.Id},
		bson.M{"$set": bson.M{
			"title":       story.Title,
			"description": story.Description,
			"thumbnail":   story.Thumbnail,
			"tags":        story.Tags,
			"frames":      story.Frames,
		}})
	if err != nil {
		return fmt.Errorf("Failed to update story in the database\n"),
			http.StatusInternalServerError
	}

	// Stringify story data into JSON string format.
	js, err := json.Marshal(story)
	if err != nil {
		return fmt.Errorf(
				"Failed to stringify %v: %v\n", story.Id.Hex(), err,
			),
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
// Respond with status 200.
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
	user, err, status := getUserInfoFromHeader(r)
	if err != nil {
		return err, status
	}

	// Make sure that the token owner is the
	//   autor of this story.
	err, status = user.verifyAuthorship(storyId)
	if err != nil {
		return err, status
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

// GET request to 'api/stories/search/<search_tag>'.
// Respond with an array of stories which contain the search tag.
func searchStories(w http.ResponseWriter, r *http.Request, searchTag string) (error, int) {
	// Make sure a story id was given in the url.
	if len(searchTag) <= 0 {
		return fmt.Errorf("Search tag not specified in the url\n"),
			http.StatusBadRequest
	}

	// Search the stories collection for stories which contain the search tag.
	stories := []Story{}
	err := storiesCollection.Find(bson.M{"tags": searchTag}).All(&stories)
	if err != nil {
		return fmt.Errorf("Failed to find matching stories\n%v\n", err),
			http.StatusNotFound
	}

	// Prepare JSON response data by stringify the data for 'stories'
	//   into JSON string format.
	js, err := json.Marshal(stories)
	if err != nil {
		return fmt.Errorf("Failed to stringify stories\n%v\n", err),
			http.StatusInternalServerError
	}

	// Send the story with status 200;
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(js)

	return nil, http.StatusOK
}

// POST request to 'api/stories/votes'.
func postVote(w http.ResponseWriter, r *http.Request) (error, int) {
	// Get user info from the token in the request header.
	user := User{}
	var err error
	status := http.StatusCreated

	chanErrGetUserInfoFromHeader := make(chan error, 1)
	chanHttpStatus := make(chan int, 1)

	// Spawn a new thread to find user info from the header.
	go func() {
		// Get user info from the token in the header.
		user, err, status = getUserInfoFromHeader(r)
		chanErrGetUserInfoFromHeader <- err
		chanHttpStatus <- status
	}()

	// Concurrently, decode the JSON object in the request body.
	vote := Vote{}
	err = json.NewDecoder(r.Body).Decode(&vote)
	if err != nil {
		return fmt.Errorf("Invalid JSON object in request body \n%v\n", err),
			http.StatusBadRequest
	}

	// Verify that the request provided required fields.
	if vote.StoryId == "" {
		return fmt.Errorf("'storyId' field required in request body\n"),
			http.StatusBadRequest
	}
	switch vote.Direction {
	case "up", "down":
		// Good
	default:
		return fmt.Errorf("'direction' field required in request body\n"),
			http.StatusBadRequest
	}

	// Search the stories collection for stories which contain the search tag.
	story := Story{}
	storyObjectId := bson.ObjectIdHex(vote.StoryId)

	err = storiesCollection.Find(bson.M{"_id": storyObjectId}).One(&story)
	if err != nil {
		return fmt.Errorf("Failed to find matching story\n%v\n", err),
			http.StatusNotFound
	}

	// Wait for both threads to complete.
	// Return an error if one was found.
	if err = <-chanErrGetUserInfoFromHeader; err != nil {
		return err, <-chanHttpStatus
	}

	vote.Username = user.Username

	userAlreadyVoted := false
	totalVotes := len(story.Votes)

	for i := totalVotes - 1; i >= 0; i-- {
		currVote := &story.Votes[i]

		if currVote.Username != user.Username {
			continue
		}

		userAlreadyVoted = true

		if currVote.Direction == vote.Direction {
			return fmt.Errorf("%v has already %vvoted %v\n",
					user.Username, vote.Direction, story.Title),
				http.StatusUnauthorized
		} else {
			(*currVote).Direction = vote.Direction
			break
		}

	}

	switch vote.Direction {
	case "up":
		if userAlreadyVoted {
			story.VoteCount += 2
		} else {
			story.VoteCount++
		}
	case "down":
		if userAlreadyVoted {
			story.VoteCount -= 2
		} else {
			story.VoteCount--
		}
	}

	switch userAlreadyVoted {
	case true:
		err = storiesCollection.Update(bson.M{
			"_id":            storyObjectId,
			"votes.username": user.Username,
		}, bson.M{
			"$set": bson.M{
				"votes.$.direction": vote.Direction,
				"voteCount":         story.VoteCount,
			},
		})
	default:
		err = storiesCollection.Update(bson.M{
			"_id": storyObjectId,
		}, bson.M{
			"$set": bson.M{
				"votes":     story.Votes,
				"voteCount": story.VoteCount,
			},
		})
	}

	if err != nil {
		return fmt.Errorf(
				"Failed to update story votes in the database\n%v\n", err,
			),
			http.StatusNotFound
	}

	// Prepare JSON response data by stringify the data for 'story'
	//   into JSON string format.
	js, err := json.Marshal(story)
	if err != nil {
		return fmt.Errorf("Failed to stringify story\n%v\n", err),
			http.StatusInternalServerError
	}

	// Send the story with status 201;
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(js)

	return nil, http.StatusCreated
}
