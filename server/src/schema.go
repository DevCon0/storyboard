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
	Favorites []string
}

// Story Model
type Story struct {
	Id        bson.ObjectId `bson:"_id,omitempty"`
	CreatedAt time.Time     `bson:"created_at"`
	Title     string
	UserId    string  // possibly redundant
	FRAME1    int
  FRAME2    int
  FRAME3    int
  Frames   []Frame
}

// Frame model for Acts/Scenes
type Frame struct {
	Player struct
	PlayerDiv  string
	Videoid    string
	start      int
	end        int
	}
}
