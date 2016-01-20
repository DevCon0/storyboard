package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"

	"gopkg.in/mgo.v2/bson"
)

var (
	BobTheTester User
)

func TestDatabase(t *testing.T) {
	t.Log("Testing database connection...")
	session, err := initDb()
	if err != nil {
		t.Errorf("Failed to connect to the database\n%v\n", err)
	}

	defer session.Close()

	t.Log("Testing database insertion...")

	collection := db.C("testUsers")

	testUsers := []interface{}{
		&User{
			Id:        bson.NewObjectId(),
			CreatedAt: bson.Now(),
			Username:  "Bobble",
			Password:  "Suepass",
			Fullname:  "Bob Sue",
			Stories:   []string{},
		},
		&User{
			Id:        bson.NewObjectId(),
			CreatedAt: bson.Now(),
			Username:  "AliceRex",
			Password:  "Suepassaroo",
			Fullname:  "Alice Dino",
			Stories:   []string{},
		},
	}
	err = collection.Insert(testUsers...)
	if err != nil {
		t.Errorf("Failed to insert test users into the database\n%v\n", err)
	}

	t.Log("Testing database retrieval...")

	result := []User{}
	q := bson.M{"firstname": "Alice"}
	err = collection.Find(q).All(&result)
	if err != nil {
		t.Errorf("Failed to find test user in the database\n%v\n", err)
	}

	q = bson.M{}
	err = collection.Find(q).All(&result)
	if err != nil {
		t.Errorf("Failed to find test users in the database\n%v\n", err)
	}
	// t.Log("  result:\n", result)

	info, err := collection.RemoveAll(q)
	if err != nil {
		t.Errorf("Failed to remove test users from the database\n%v\n", err)
	}

	if info.Removed < 2 {
		t.Error("Failed to either add or remove test users from the database")
	}
}

func TestBasicServer(t *testing.T) {
	t.Log("Testing basic server capabilities...")
	url := "http://localhost:8020/"
	res, err := http.Get(url)
	if err != nil {
		t.Errorf("Failed to get information from the server\n%v\n", err)
	} else if res.StatusCode != 200 {
		t.Errorf("Server returned status code %v\n", res.StatusCode)
	}
	defer res.Body.Close()

	t.Logf("Got OK response: %v\n", res.StatusCode)

}

func TestSignup(t *testing.T) {
	t.Log("Testing signup...")
	url := "http://localhost:8020/api/users/signup"

	jsonStr := `{
		"username":"BobTheTester",
		"fullname": "Bob",
		"password": "Sue"
	}`

	res, err := jsonPost(url, jsonStr)
	if err != nil {
		t.Errorf(
			"Failed to send request to %v\n%v\n",
			url, err,
		)
	} else if res.StatusCode != 201 {
		t.Errorf("Expected status code 201, got %v\n", res.StatusCode)
	}
	defer res.Body.Close()

	// check database for user Bob
	t.Log("Testing database connection...")
	session, err := initDb()
	if err != nil {
		t.Errorf("Failed to connect to the database\n%v\n", err)
	}

	defer session.Close()
	collection := db.C("users")

	result := User{}
	q := bson.M{"username": "BobTheTester"}
	err = collection.Find(q).One(&result)
	if err != nil {
		t.Errorf("Failed to find test user in the database\n%v\n", err)
	}
	t.Logf("Bob was found in database\n")
}

func TestSignin(t *testing.T) {
	t.Log("Testing signin...")
	url := "http://localhost:8020/api/users/signin"

	jsonStr := `{
		"username":"BobTheTester",
		"password": "Sue"
	}`

	res, err := jsonPost(url, jsonStr)
	if err != nil {
		t.Errorf(
			"Failed to send request to %v\n%v\n",
			url, err,
		)
	} else if res.StatusCode != 200 {
		t.Errorf("Expected status code 200, got %v\n", res.StatusCode)
	} else {
		t.Log("Bob totally signed in!!!")
	}

	// Remember BobTheTester for future tests.
	err = json.NewDecoder(res.Body).Decode(&BobTheTester)
	if err != nil {
		content, _ := ioutil.ReadAll(res.Body)
		t.Logf("res.Body/content:\n%#v\n", string(content))
		t.Errorf("Invalid JSON object in response body \n%v\n", err)
	}

	res.Body.Close()

	jsonStr = `{
		"username":"BobTheTester",
		"password": "George"
	}`

	res, err = jsonPost(url, jsonStr)
	if err != nil {
		t.Errorf(
			"Failed to send request to %v\n%v\n",
			url, err,
		)
	} else if res.StatusCode != 401 {
		t.Errorf("Expected status code 401, got %v\n", res.StatusCode)
	} else {
		t.Logf("Bad password, sign in response status: %v\n", res.StatusCode)
	}
	res.Body.Close()
}

func TestStoryCreation(t *testing.T) {
	t.Log("Testing story creation...")

	url := "http://localhost:8020/api/stories/story"
	jsonStr := `{
    "title": "When Bob meets Alice",
    "username": "BobTheTester",
    "frame1": 0,
    "frame2": 1,
    "frame3": 2,
    "frames": [
        {
            "player": {},
            "playerdiv": "player1",
            "videoid": "-5x5OXfe9KY",
            "start": 0,
            "end": 3
        },
        {
            "player": {},
            "playerdiv": "player2",
            "videoid": "3GJOVPjhXMY",
            "start": 0,
            "end": 3
        },
        {
            "player": {},
            "playerdiv": "player3",
            "videoid": "8lXdyD2Yzls",
            "start": 0,
            "end": 3
        }
    ]
}`

	expectedStatus := http.StatusCreated
	res, err := jsonPost(url, jsonStr)
	if err != nil {
		t.Errorf(
			"Failed to send request to %v\n%v\n",
			url, err,
		)
	} else if res.StatusCode != expectedStatus {
		t.Errorf(
			"Expected status code %v, got %v\n",
			expectedStatus, res.StatusCode,
		)
	} else {
		t.Log("Successfully created story!")
	}
	res.Body.Close()

	jsonStr = `{
    "title": "When Bob meets Dwight",
    "username": "BobTheTester",
    "frame1": 0,
    "frame2": 1,
    "frame3": 2,
    "frames": [
        {
            "player": {},
            "playerdiv": "player1",
            "videoid": "lPLkMbGgjHM",
            "start": 0,
            "end": 9
        },
        {
            "player": {},
            "playerdiv": "player2",
            "videoid": "JmDheMx_bGA",
            "start": 0,
            "end": 4
        },
        {
            "player": {},
            "playerdiv": "player3",
            "videoid": "ulkAfiT3KxU",
            "start": 8,
            "end": 23
        }
    ]
}`

	res, err = jsonPost(url, jsonStr)
	if err != nil {
		t.Errorf(
			"Failed to send request to %v\n%v\n",
			url, err,
		)
	} else if res.StatusCode != expectedStatus {
		t.Errorf(
			"Expected status code %v, got %v\n",
			expectedStatus, res.StatusCode,
		)
	} else {
		t.Log("Successfully created story!")
	}
	res.Body.Close()

	t.Log("Testing story creation with missing properties...")

	jsonStr = `{
	    "title": "When Bob meets Alice",
	    "username": "BobTheTester",
	    "frame1": 0,
	    "frame2": 1,
	    "frame3": 2
    }`

	expectedStatus = http.StatusBadRequest
	res, err = jsonPost(url, jsonStr)
	if err != nil {
		t.Errorf(
			"Failed to send request to %v\n%v\n",
			url, err,
		)
	} else if res.StatusCode != expectedStatus {
		t.Errorf(
			"Expected status code %v, got %v\n",
			expectedStatus, res.StatusCode,
		)
	} else {
		t.Logf(
			"Successfully failed to create a bad story: %v\n",
			res.StatusCode,
		)
	}
	res.Body.Close()
}

func TestStoryFetch(t *testing.T) {
	t.Log("Testing single story fetching...")

	// Find the story which was created by the test.
	t.Log("Connecting to the database...")
	session, err := initDb()
	if err != nil {
		t.Errorf(
			"Failed to connect to the database\n%v\n",
			err,
		)
		return
	}

	defer session.Close()
	collection := db.C("stories")

	t.Log("Finding test stories from the database...")
	result := []Story{}
	q := bson.M{"username": "BobTheTester"}
	err = collection.Find(q).All(&result)
	if err != nil {
		t.Errorf(
			"Failed to find test story in the database\n%v\n",
			err,
		)
	}

	// t.Logf("%#v\n", result)
	// t.Logf("%#v\n", result[0])

	if len(result) <= 0 {
		t.Errorf(
			"Failed to find test story in the database\n",
		)
		return
	}

	lastResult := result[0]
	for _, r := range result {
		if lastResult.CreatedAt.Before(r.CreatedAt) {
			lastResult = r
		}
	}
	id := lastResult.Id

	url := concat("http://localhost:8020/api/stories/story/", id.Hex())
	t.Log(url)

	expectedStatus := http.StatusOK
	res, err := http.Get(url)
	if err != nil {
		t.Errorf(
			"Failed to send request to %v\n%v\n",
			url, err,
		)
	} else if res.StatusCode != expectedStatus {
		t.Errorf(
			"Expected status code %v, got %v\n",
			expectedStatus, res.StatusCode,
		)
	} else {
		t.Logf("Response received from %v\n", url)
	}

	res.Body.Close()
}

func TestLibraryFetch(t *testing.T) {
	t.Log("Testing user library fetching...")

	url := "http://localhost:8020/api/stories/library"

	// t.Logf("user.Id.Hex(): %v\n", user.Id.Hex())
	t.Logf("Sending GET request to\n%v...\n", url)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		t.Errorf(
			"Failed to send request to %v\n%v\n",
			url, err,
		)
	}
	// t.Logf("user.Token: %v\n", user.Token)
	req.Header.Set("token", BobTheTester.Token)
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		t.Errorf(
			"Failed to send request to %v\n%v\n",
			url, err,
		)
	}
	defer res.Body.Close()

	stories := []Story{}

	err = json.NewDecoder(res.Body).Decode(&stories)
	if err != nil {
		t.Errorf("Invalid JSON object in response body \n%v\n", err)
	}

	if len(stories) <= 1 {
		t.Errorf(
			"Failed to find test stories in the database\n",
		)
		return
	}

	for _, story := range stories {
		url := concat("http://localhost:8020/api/stories/story/", story.Id.Hex())

		expectedStatus := http.StatusOK
		res, err := http.Get(url)
		if err != nil {
			t.Errorf(
				"Failed to send request to %v\n%v\n",
				url, err,
			)
		} else if res.StatusCode != expectedStatus {
			t.Errorf(
				"Expected status code %v, got %v\n",
				expectedStatus, res.StatusCode,
			)
		} else {
			t.Logf("Response received from %v\n", url)
		}

	}
}

// Test GET requests to 'api/stories/showcase'.
func TestShowCase(t *testing.T) {
	t.Log("Testing showcase fetching...")

	// Send GET request to 'api/stories/showcase'.
	showCaseUrl := "http://localhost:8020/api/stories/showcase"
	t.Logf("Sending GET request to\n%v...\n", showCaseUrl)

	res, err := request("GET", showCaseUrl)
	if err != nil {
		t.Errorf("%v\n", err)
	}
	defer res.Body.Close()

	// Pull the JSON object out of the response body.
	stories := []Story{}
	err = json.NewDecoder(res.Body).Decode(&stories)
	if err != nil {
		t.Errorf("Invalid JSON object in response body \n%v\n", err)
	}

	// The response body should contain 3 stories.
	if len(stories) < 3 {
		t.Errorf("Received only %d stories\n", len(stories))
		return
	}

	// Make sure the received stories can be retrieved
	//   from a GET request to 'api/stories/story/<story_id>'
	for i, story := range stories {

		// Check whether 2 copies of the same story were received.
		for otherI, otherStory := range stories {
			if i == otherI {
				continue
			}
			if story.Id == otherStory.Id {
				t.Errorf(
					"Received duplicate stories:\n%v\n%v\n",
					story.Title, otherStory.Title,
				)
			}
		}

		// Send a GET request to 'api/stories/story/<story_id>'.
		url := concat(
			"http://localhost:8020/api/stories/story/", story.Id.Hex(),
		)

		expectedStatus := http.StatusOK
		res, err := http.Get(url)
		if err != nil {
			t.Errorf("Failed to send request to %v\n%v\n", url, err)
		} else if res.StatusCode != expectedStatus {
			t.Errorf(
				"Expected status code %v, got %v\n",
				expectedStatus, res.StatusCode,
			)
		} else {
			t.Logf("Response received from %v\n", url)
		}

		// Convert the JSON object in the response body to a story type.
		resStory := Story{}
		err = json.NewDecoder(res.Body).Decode(&resStory)
		if err != nil {
			t.Errorf("Invalid JSON object in response body \n%v\n", err)
		}
		res.Body.Close()

		// Make sure the Title property in the 'api/stories/story' response
		//   matches the one for the story in the
		//   'api/stories/showcase' response.
		if resStory.Title != story.Title {
			t.Errorf(
				"Data received from %v differs from data received from %v\n",
				showCaseUrl, url,
			)
		}

	}
}

func TestRemoval(t *testing.T) {
	// Find the test user's info in the database.
	t.Log("Testing database connection...")
	session, err := initDb()
	if err != nil {
		t.Errorf("Failed to connect to the database\n%v\n", err)
	}

	defer session.Close()

	t.Log("Looking for BobTheTester...")
	err = usersCollection.Find(
		bson.M{"username": "BobTheTester"},
	).One(&BobTheTester)
	if err != nil {
		t.Errorf("BobTheTester is invisible\n%v\n", err)
	}

	if len(BobTheTester.Stories) <= 0 {
		t.Errorf("BobTheTester has not created any stories\n")
	}

	// Remove the story which was created by the test.
	t.Log("Removing BobTheTester's stories from the database...")
	// totalStories := len(BobTheTester.Stories)
	for _, storyId := range BobTheTester.Stories {
		url := concat("http://localhost:8020/api/stories/story/", storyId)
		expectedStatus := http.StatusOK

		t.Logf("Sending DELETE request to %v\n", url)
		res, err := request("DELETE", url)
		if err != nil {
			t.Errorf("%v\n", err)
		} else if res.StatusCode != expectedStatus {
			t.Errorf(
				"Expected status code %v, got %v\n",
				expectedStatus, res.StatusCode,
			)
		} else {
			t.Logf("Response received\n")
		}

		res.Body.Close()
	}

	t.Log("Looking for BobTheTester again...")
	err = usersCollection.Find(
		bson.M{"username": "BobTheTester"},
	).One(&BobTheTester)
	if err != nil {
		t.Errorf("BobTheTester is invisible\n%v\n", err)
	} else if len(BobTheTester.Stories) > 0 {
		t.Errorf("BobTheTester still has his deleted stories\n")
	}
}

func TestCleanup(t *testing.T) {
	t.Log("Cleaning up test collections in database...")
	// check database for user Bob
	t.Log("Testing database connection...")
	session, err := initDb()
	if err != nil {
		t.Errorf("Failed to connect to the database\n%v\n", err)
	}

	defer session.Close()

	// Remove the story which was created by the test.
	t.Log("Removing test stories from the database...")
	_, err = storiesCollection.RemoveAll(bson.M{"username": "BobTheTester"})
	if err != nil {
		t.Errorf("Failed to remove test story from the database\n%v\n", err)
	}

	// Remove BobTheTester from the database.
	t.Log("Killing BobTheTester...")

	_, err = usersCollection.RemoveAll(bson.M{"username": "BobTheTester"})
	if err != nil {
		t.Errorf("Failed to remove test users from the database\n%v\n", err)
	}

	_, err = db.C("testUsers").RemoveAll(bson.M{"username": "BobTheTester"})
	if err != nil {
		t.Errorf("Failed to remove test users from the database\n%v\n", err)
	}
}

func jsonPost(url, jsonStr string) (*http.Response, error) {
	jsonBytes := []byte(jsonStr)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Set("token", BobTheTester.Token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	return client.Do(req)
}

func request(method, url string) (*http.Response, error) {
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil,
			fmt.Errorf("Failed to send %v request to %v\n%v\n", method, url, err)
	}

	req.Header.Set("token", BobTheTester.Token)

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil,
			fmt.Errorf("Failed to send %v request to %v\n%v\n", method, url, err)
	}

	return res, err
}
