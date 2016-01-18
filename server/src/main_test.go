package main

import (
	"bytes"
	"net/http"
	"testing"

	"gopkg.in/mgo.v2/bson"
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

func jsonPost(url, jsonStr string) (*http.Response, error) {
	jsonBytes := []byte(jsonStr)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	return client.Do(req)
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
	q := bson.M{"username": "Bob"}
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
			"Failed to remove test story in the database\n%v\n",
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
	t.Log(id)
	t.Log(id.Hex())

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

	// story := Story{}
	// decoder := json.NewDecoder(res.Body)
	// err = decoder.Decode(&story)
	// if err != nil {
	// 	fmt.Printf("Failed to decode JSON object in the request\n%v\n", err)
	// }
	// t.Logf("%#v\n", story)
	// t.Logf("%#v\n", story.Id.Hex())

	res.Body.Close()

	// // Remove the story which was created by the test.
	// t.Log("Removing test stories from the database...")
	// // t.Log("lastResult.Id", lastResult.Id)
	// q = bson.M{"_id": id}
	// err = collection.Remove(q)
	// if err != nil {
	// 	t.Errorf(
	// 		"Failed to remove test story from the database\n%v\n",
	// 		err,
	// 	)
	// }
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
	// t.Log("lastResult.Id", lastResult.Id)
	collection := db.C("stories")
	q := bson.M{"username": "BobTheTester"}
	_, err = collection.RemoveAll(q)
	if err != nil {
		t.Errorf(
			"Failed to remove test story from the database\n%v\n",
			err,
		)
	}

	t.Log("Killing BobTheTester...")
	collection = db.C("users")
	q = bson.M{"username": "BobTheTester"}

	// Remove BobTheTester from the database.
	_, err = collection.RemoveAll(q)
	if err != nil {
		t.Errorf("Failed to remove test users from the database\n%v\n", err)
	}
}
