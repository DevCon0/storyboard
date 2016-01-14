package main

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// Create User Model
type User struct {
	Id        bson.ObjectId `bson:"_id,omitempty"`
	CreatedAt time.Time     `bson:"created_at"`
	Username  string
	Password  string
	Firstname string
	Lastname  string
	Stories   []string
}

// Story Model
type Story struct {
	Id        bson.ObjectId `bson:"_id,omitempty"`
	CreatedAt time.Time     `bson:"created_at"`
	Title     string
	UserId    string
	Start1url string
	Body2url  string
	End3url   string
}
