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
			bson.NewObjectId(), bson.Now(),
			"Bobble", "Suepass", "Bob", "Sue",
			[]string{},
		},
		&User{
			bson.NewObjectId(), bson.Now(),
			"AliceRex", "Suepassaroo", "Alice", "Dino",
			[]string{},
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
	t.Log("Testing basic server capabilities")
	url := "http://localhost:8020/"
	res, err := http.Get(url)
	defer res.Body.Close()
	if err != nil {
		t.Errorf("Failed to get information from the server\n%v\n", err)
	} else if res.StatusCode != 200 {
		t.Errorf("Server returned status code %v\n", res.StatusCode)
	}

	t.Logf("Got OK response: %v\n", res.StatusCode)

}

func TestSignup(t *testing.T) {
	t.Log("Testing signup")
	url := "http://localhost:8020/api/users/signup"

	var jsonStr = []byte(`{"username":"Bob","firstname": "Bob","password": "Sue"}`)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("X-Custom-Header", "myvalue")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	defer res.Body.Close()
	if err != nil {
		t.Errorf("Failed to signup Bob\n%v\n", err)
	} else if res.StatusCode != 201 {
		t.Errorf("Expected status code 201, got %v\n", res.StatusCode)
	}

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
	// remove Bob after test
	_, err = collection.RemoveAll(q)
	if err != nil {
		t.Errorf("Failed to remove test users from the database\n%v\n", err)
	}

}
