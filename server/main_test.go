package main

import (
	"fmt"
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
		&User{"Bob", 23},
		&User{"Alice", 46},
	}
	err = collection.Insert(testUsers...)
	if err != nil {
		t.Errorf("Failed to insert test users into the database\n%v\n", err)
	}

	t.Log("Testing database retrieval...")

	result := []User{}
	q := bson.M{"name": "Alice"}
	err = collection.Find(q).All(&result)
	if err != nil {
		t.Errorf("Failed to find test user in the database\n%v\n", err)
	}

	q = bson.M{}
	err = collection.Find(q).All(&result)
	if err != nil {
		t.Errorf("Failed to find test users in the database\n%v\n", err)
	}

	info, err := collection.RemoveAll(q)
	if err != nil {
		t.Errorf("Failed to remove test users from the database\n%v\n", err)
	}

	if info.Removed < 2 {
		t.Error("Failed to either add or remove test users from the database")
	}

	fmt.Println(info.Removed)
}
