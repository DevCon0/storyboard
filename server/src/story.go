package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"path/filepath"
	"regexp"
	"time"

	"gopkg.in/mgo.v2/bson"
)

var (
	reGifUrlWithoutParams *regexp.Regexp
)

// GET request to 'api/stories/library'.
// Respond with the full data for all of the stories
//   created by a signed-in user.
//   Find the user's stories by using the token in the request header.
func getLibrary(w http.ResponseWriter, r *http.Request, userId string) (error, int) {
	// Get user info from the database, using the token in the header.
	user := User{}
	err, status := user.getInfoFromHeaderSync(r)
	if err != nil {
		return err, status
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
// Respond with the full data for 16 random stories.
func getShowCaseRandom(w http.ResponseWriter, r *http.Request) (error, int) {
	// Get all stories from the database.
	stories := []Story{}
	err := storiesCollection.Find(nil).All(&stories)
	if err != nil {
		return err, http.StatusNotFound
	}

	// Update any stories which are not structured correctly.
	// For each one, make sure it has 4 frames
	//   and that any GIF frames images have a non-animated thumbnail.
	go verifyStoryStructure(stories)

	// Randomize the stories.
	numberOfStories := len(stories)
	// Declare a slice which will contain the random numbers used.
	randomNumbers := IntSlice{}
	// Make an array which will serve as a randomized copy of 'stories'.
	limit := 16
	randomStories := make([]Story, limit)

	i := 0
	for {
		// Get a random number between 0 and the number of stories.
		randomIndex := rand.Intn(numberOfStories)
		if randomNumbers.contains(randomIndex) {
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

// Reset the structure of any stories which are misaligned.
// Make sure all:
//   stories have 4 frames,
//   stories' first frames are MediaType 3,
//   text-to-speech frames are MediaType 2, and
//   GIF images have a non-animated thumbnail.
func verifyStoryStructure(stories []Story) {
	numberOfStories := len(stories)
	for i := 0; i < numberOfStories; i++ {
		story := &stories[i]
		go func(story *Story) {
			storyChanged := false

			numberOfFrames := len(story.Frames)

			// If the story is missing a fourth frame,
			//   'unshift' a blank frame at index 0.
			if numberOfFrames == 3 {
				tmpFrames := make([]Frame, 4)
				for i := 0; i < 3; i++ {
					tmpFrames[i+1] = story.Frames[i]
				}
				story.Frames = tmpFrames

				numberOfFrames = len(story.Frames)
				storyChanged = true
			}

			// Make sure the first frame's MediaType is 3.
			if story.Frames[0].MediaType != 3 {
				story.Frames[0].MediaType = 3
				storyChanged = true
			}

			for i := 1; i < numberOfFrames; i++ {
				frame := &story.Frames[i]
				switch frame.MediaType {
				// Check if any GIF frames need a non-animated thumbnail.
				case 1:
					// Skip if not a GIF.
					if filepath.Ext(frame.ImageUrl) != ".gif" {
						continue
					}

					// Skip if the PreviewUrl is not a GIF.
					if filepath.Ext(frame.PreviewUrl) != ".gif" {
						continue
					}

					// Set the PreviewUrl to nothing to force creation
					//   of a new one.
					(*frame).PreviewUrl = ""
					storyChanged = true

				// Verify that text-to-speech frames
				//   have the correct PreviewUrl.
				case 2:
					textToSpeechPreviewUrl := "/api/images/text-to-speech.svg"
					if frame.PreviewUrl == textToSpeechPreviewUrl {
						continue
					}
					(*frame).PreviewUrl = textToSpeechPreviewUrl
					storyChanged = true
				}
			}

			// Check whether at least one frame has a volume above 0.
			hasVolume := false
			for i := 0; i < numberOfFrames; i++ {
				frame := &story.Frames[i]
				if frame.Volume != 0 {
					hasVolume = true
				}
			}

			// If no frame has a volume above 0, set them all to 100.
			if !hasVolume {
				// If an audio track exists, only set the audio track to 100.
				if story.Frames[0].VideoId != "" {
					story.Frames[0].Volume = 100
				} else {
					for i := numberOfFrames - 1; i >= 1; i-- {
						frame := &story.Frames[i]
						frame.Volume = 100
					}
				}
				storyChanged = true
			}

			// Check whether the story has a soundtrack.
			if !story.HasSoundtrack && story.Frames[0].VideoId != "" {
				story.HasSoundtrack = true
				storyChanged = true
			}

			// Skip editing if no edits were made.
			if !storyChanged {
				return
			}

			// Get user info for the author of the story.
			user := User{}
			err := usersCollection.Find(bson.M{
				"username": story.Username,
			}).One(&user)
			if err != nil {
				fmt.Printf(
					"Failed to find user %v: %v\n",
					story.Username, err,
				)
				return
			}

			// Convert the story struct to bytes.
			js, err := json.Marshal(story)
			if err != nil {
				fmt.Println(err)
				return
			}

			// Prepare an edit request to this server for the story.
			url := "http://localhost:8020/api/stories/story"
			req, err := http.NewRequest("PUT", url, bytes.NewBuffer(js))
			if err != nil {
				fmt.Println(err)
				return
			}

			// Set request options.
			req.Header.Set("token", user.Token)
			req.Header.Set("Content-Type", "application/json")

			// Send the request.
			client := &http.Client{}
			res, err := client.Do(req)
			if err != nil {
				fmt.Printf("Couldn't update %v: %v\n", story.Title, err)
				return
			}
			if res.StatusCode != http.StatusOK {
				fmt.Printf(
					"Couldn't update %v: %v\n", story.Title, story.Id.Hex(),
				)
			}
			defer res.Body.Close()

			fmt.Printf("Re-structured %v\n", story.Title)
		}(story)
	}
}

type IntSlice []int

func (slice IntSlice) contains(target int) bool {
	for _, integer := range slice {
		if integer == target {
			return true
		}
	}
	return false
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
	// Spawn a goroutine to find user info from the header.
	user := User{}
	wg, chanErrGetUserInfo, chanHttpStatus := user.getInfoFromHeader(r)

	// Concurrently, decode the JSON object in the request body.
	story := Story{}
	err := json.NewDecoder(r.Body).Decode(&story)
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

	// Wait for both threads to complete.
	// Return an error if one was found.
	wg.Wait()
	if err = <-chanErrGetUserInfo; err != nil {
		return err, <-chanHttpStatus
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

	// Set defaults for 'story.Frames'.
	numberOfFrames := len(story.Frames)

	// Prepare to watch multi-threaded goroutines.
	wg.Add(numberOfFrames)

	for i := 0; i < numberOfFrames; i++ {
		// Set each frame's PreviewUrl concurrently.
		go func(i int) {
			// At the end of this goroutine,
			//   tell 'wg' that another goroutine is done.
			defer wg.Done()
			frame := &story.Frames[i]

			// Skip if the previewUrl is already set.
			if frame.PreviewUrl != "" {
				return
			}

			// Set the frame's PreviewUrl (for the home/splash page).
			// Handle images and videos differently.
			switch frame.MediaType {

			// Set a video frame's PreviewUrl.
			case 0:
				// Set the PreviewUrl to the first frame in the YouTube video.
				frame.PreviewUrl = concat(
					"https://img.youtube.com/vi/", frame.VideoId, "/1.jpg",
				)

			// Set an image frame's PreviewUrl.
			case 1:

				imageUrl := reGifUrlWithoutParams.ReplaceAllString(
					frame.ImageUrl, "$1",
				)

				// Handle GIF images differently than other images.
				switch filepath.Ext(imageUrl) {
				case ".gif":
					// Save a non-animated version of the GIF in the database.
					previewUrl, err := saveNonAnimatedGif(frame.ImageUrl)
					if err != nil {
						fmt.Printf(
							"Failed to create motionless image for %v: %v\n",
							frame.ImageUrl, err,
						)
						// If an error occurred, just set the PreviewUrl
						//   to the animated GIF.
						frame.PreviewUrl = frame.ImageUrl
					} else {
						// If a non-animated copy of the GIF
						//   was saved successfully, use it as the PreviewUrl.
						frame.PreviewUrl = previewUrl
					}
				default:
					// For non-GIF images,
					//   just use the ImageUrl as the PreviewUrl.
					frame.PreviewUrl = frame.ImageUrl
				}

			// Set a text-to-speech frame's PreviewUrl.
			case 2:
				frame.PreviewUrl = "/api/images/text-to-speech.svg"

			// Set an audio frame's PreviewUrl.
			case 3:
				frame.PreviewUrl = ""
			}
		}(i)
	}

	// Check whether the story has a soundtrack.
	if story.Frames[0].VideoId != "" {
		story.HasSoundtrack = true
	}

	// Set default values.
	story.Views = 0
	if story.Author == "" {
		story.Author = user.Username
	}

	// Wait for goroutines to finish.
	wg.Wait()

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

	fmt.Printf("Created story %v\n", story.Title)

	return nil, http.StatusCreated
}

// PUT request to 'api/stories/story'.
// Update a story's information in the database.
func editStory(w http.ResponseWriter, r *http.Request) (error, int) {
	// Spawn a goroutine to find user info from the header.
	user := User{}
	wg, chanErrGetUserInfo, chanHttpStatus := user.getInfoFromHeader(r)

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

	// Wait for the goroutine which grabs user info from the token
	//   in the request header to finish.
	// Then return an error if one occurred.
	wg.Wait()
	if err = <-chanErrGetUserInfo; err != nil {
		return err, <-chanHttpStatus
	}

	// Make sure that the token owner is the
	//   autor of this story.
	err, status := user.verifyAuthorship(story.Id.Hex())
	if err != nil {
		return err, status
	}

	// Fetch the unedited story data from the database.
	originalStory := Story{}
	err = storiesCollection.Find(bson.M{
		"_id": story.Id,
	}).One(&originalStory)
	if err != nil {
		return fmt.Errorf("Original story not found in the database\n"),
			http.StatusNotFound
	}

	// If the story contains GIF's,
	//   remove the non-animated versions of them in the database.
	numberOfFrames := len(story.Frames)

	// Reset frames 0-2 to 1-3.
	// Eventually, we can get rid of this, once we know that all stories
	//   have four frames.
	if numberOfFrames == 3 {
		tmpFrames := make([]Frame, 4)
		for i := 0; i < 3; i++ {
			tmpFrames[i+1] = story.Frames[i]
		}
		story.Frames = tmpFrames
		numberOfFrames = len(story.Frames)
	}

	// Reset frames 0-2 to 1-3 for originalStory as well.
	if len(originalStory.Frames) == 3 {
		tmpFrames := make([]Frame, 4)
		for i := 0; i < 3; i++ {
			tmpFrames[i+1] = originalStory.Frames[i]
		}
		originalStory.Frames = tmpFrames
	}

	// Prepare to watch multi-threaded goroutines.
	wg.Add(numberOfFrames - 1)

	for i := 1; i < numberOfFrames; i++ {
		// Set each frame's PreviewUrl concurrently.
		go func(i int) {
			// At the end of this goroutine,
			//   tell 'wg' that another goroutine is done.
			defer wg.Done()

			editedFrame := &story.Frames[i]
			originalFrame := originalStory.Frames[i]

			// Set the editedFrame's PreviewUrl (for the home/splash page).
			// Handle images and videos differently.
			switch editedFrame.MediaType {

			// Set a video frame's PreviewUrl.
			case 0:
				// Set the PreviewUrl to the first frame in the YouTube video.
				videoId := editedFrame.VideoId
				previewUrl := concat(
					"https://img.youtube.com/vi/", videoId, "/1.jpg",
				)
				(*editedFrame).PreviewUrl = previewUrl

			// Set an image frame's PreviewUrl.
			case 1:
				editedImageUrl := reGifUrlWithoutParams.ReplaceAllString(
					editedFrame.ImageUrl, "$1",
				)

				// Handle GIF images differently than other images.
				switch filepath.Ext(editedImageUrl) {
				case ".gif":
					// Skip if the ImageUrl has not been edited.
					if editedFrame.ImageUrl == originalFrame.ImageUrl &&
						editedFrame.PreviewUrl != "" {
						return
					}

					// Save a non-animated version of the GIF in the database.
					nonAnimatedPreviewUrl, err := saveNonAnimatedGif(
						editedFrame.ImageUrl,
					)

					// Note the '==' here instead of the usual '!='.
					if err == nil {
						// If a non-animated copy of the GIF
						//   was saved successfully,
						//   remove the old image from the database.
						go deleteNonAnimatedGif(editedFrame.PreviewUrl)

						// Use the non-animated version of the GIF
						//   as the PreviewUrl.
						(*editedFrame).PreviewUrl = nonAnimatedPreviewUrl
						break
					}

					// If an error occurred, treat the GIF as a normal image.
					fmt.Printf(
						"Failed to create a non-animated version of %v: %v\n",
						editedFrame.ImageUrl, err,
					)
					fallthrough

				// For non-GIF images, set the PreviewUrl to the ImageUrl.
				default:
					(*editedFrame).PreviewUrl = editedFrame.ImageUrl
				}

			// Set a text-to-speech frame's PreviewUrl.
			case 2:
				editedFrame.PreviewUrl = "/api/images/text-to-speech.svg"

			// Set an audio frame's PreviewUrl.
			case 3:
				editedFrame.PreviewUrl = ""
			}

			// When switching media types,
			// 	 delete any motionless versions of GIF's from the database.
			if originalFrame.MediaType == 1 && editedFrame.MediaType != 1 {
				originalImageUrl := reGifUrlWithoutParams.ReplaceAllString(
					originalFrame.ImageUrl, "$1",
				)
				if filepath.Ext(originalImageUrl) == ".gif" {
					go deleteNonAnimatedGif(originalFrame.PreviewUrl)
				}
			}
		}(i)
	}

	// Check whether the story has a soundtrack.
	if story.Frames[0].VideoId != "" {
		story.HasSoundtrack = true
	}

	// Wait for goroutines to finish.
	wg.Wait()

	// Fetch story data from the database.
	err = storiesCollection.Update(
		bson.M{"_id": story.Id},
		bson.M{"$set": bson.M{
			"title":          story.Title,
			"description":    story.Description,
			"has_soundtrack": story.HasSoundtrack,
			"thumbnail":      story.Thumbnail,
			"tags":           story.Tags,
			"frames":         story.Frames,
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

	fmt.Printf("Edited story %v\n", story.Title)

	return nil, http.StatusOK
}

// DELETE request to 'api/stories/story/<story_id>'.
// Only the owner of the story can delete it.
// Respond with status 200.
func deleteStory(w http.ResponseWriter, r *http.Request, storyId string) (error, int) {
	// Spawn a goroutine to find user info from the header.
	user := User{}
	wg, chanErrGetUserInfo, chanHttpStatus := user.getInfoFromHeader(r)

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

	// Wait for the goroutine which grabs user info from the token
	//   in the request header to finish.
	// Then return an error if one occurred.
	wg.Wait()
	if err = <-chanErrGetUserInfo; err != nil {
		return err, <-chanHttpStatus
	}

	// Make sure that the token owner is the
	//   autor of this story.
	err, status := user.verifyAuthorship(storyId)
	if err != nil {
		return err, status
	}

	// If the story contains GIF's,
	//   remove the non-animated versions of them in the database.
	numberOfFrames := len(story.Frames)
	for i := 1; i < numberOfFrames; i++ {
		frame := &story.Frames[i]

		// Skip is the frame is not an image.
		if frame.MediaType != 1 {
			continue
		}

		// Skip is the frame is not a GIF.
		imageUrl := reGifUrlWithoutParams.ReplaceAllString(
			frame.ImageUrl, "$1",
		)
		if filepath.Ext(imageUrl) != ".gif" {
			continue
		}

		// Skip if the PreviewUrl does not point to an image in the database.
		if filepath.Dir(frame.PreviewUrl) != "/api/images" {
			continue
		}

		// Remove the file from the database.
		go deleteNonAnimatedGif(frame.PreviewUrl)
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

	fmt.Printf("Edited story %v\n", story.Title)

	return nil, http.StatusOK
}

// GET request to 'api/stories/tags/<search_tag>'.
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
	// Spawn a goroutine to find user info from the header.
	user := User{}
	wg, chanErrGetUserInfo, chanHttpStatus := user.getInfoFromHeader(r)

	// Concurrently, decode the JSON object in the request body.
	vote := Vote{}
	err := json.NewDecoder(r.Body).Decode(&vote)
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
	wg.Wait()
	if err = <-chanErrGetUserInfo; err != nil {
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
