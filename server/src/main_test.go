package main

import (
	"bytes"
	"net/http"
	"testing"

	"gopkg.in/mgo.v2/bson"
)

var ()

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
			Firstname: "Bob",
			Lastname:  "Sue",
			Stories:   []string{},
		},
		&User{
			Id:        bson.NewObjectId(),
			CreatedAt: bson.Now(),
			Username:  "AliceRex",
			Password:  "Suepassaroo",
			Firstname: "Alice",
			Lastname:  "Dino",
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

	var jsonStr = []byte(`{"username":"Bob","firstname": "Bob","password": "Sue"}`)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("X-Custom-Header", "myvalue")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		t.Errorf("Failed to signup Bob\n%v\n", err)
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
	t.Log("Testing signin")
	url := "http://localhost:8020/api/users/signin"

	jsonStr := []byte(`{"username":"Bob","password": "Sue"}`)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("X-Custom-Header", "signinvalue")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		t.Errorf("Failed to signin Bob\n%v\n", err)
	} else if res.StatusCode != 200 {
		t.Errorf("Expected status code 200, got %v\n", res.StatusCode)
	} else {
		t.Log("Bob totally signed in!!!")
	}
	defer res.Body.Close()

	jsonStr = []byte(`{"username":"Bob","password": "George"}`)

	req, err = http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("X-Custom-Header", "signinvalue")
	req.Header.Set("Content-Type", "application/json")

	client = &http.Client{}
	res, err = client.Do(req)
	defer res.Body.Close()
	if err != nil {
		t.Errorf("Failed to signin Bob\n%v\n", err)
	} else if res.StatusCode != 401 {
		t.Errorf("Expected status code 401, got %v\n", res.StatusCode)
	} else {
		t.Logf("Bad password, sign in response status: %v\n", res.StatusCode)
	}

	// check database for user Bob
	t.Log("Testing database connection...")
	session, err := initDb()
	if err != nil {
		t.Errorf("Failed to connect to the database\n%v\n", err)
	}

	defer session.Close()
	collection := db.C("users")

	q := bson.M{"username": "Bob"}

	// remove Bob after earlier tests
	_, err = collection.RemoveAll(q)
	if err != nil {
		t.Errorf("Failed to remove test users from the database\n%v\n", err)
	}
}
