package main

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// Create User Model
type User struct {
	Id        bson.ObjectId `json:"userId" bson:"_id,omitempty"`
	CreatedAt time.Time     `json:"createdAt" bson:"created_at"`
	Username  string        `json:"username"`
	Password  string        `json:"password"`
	Fullname  string        `json:"fullname"`
	Stories   []string      `json:"stories"`
	Token     string        `json:"token"`
}

// Story Model
type Story struct {
	Id          bson.ObjectId `json:"storyId" bson:"_id,omitempty"`
	CreatedAt   time.Time     `json:"createdAt" bson:"created_at"`
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Username    string        `json:"username"`
	Author      string        `json:"author"`
	Frames      []Frame       `json:"frames"`
	FRAME1      int
	FRAME2      int
	FRAME3      int
}

// Frame model for Acts/Scenes
type Frame struct {
	Player    struct{} `json:"player"`
	PlayerDiv string   `json:"playerDiv"`
	VideoId   string   `json:"videoId"`
	Start     int      `json:"start"`
	End       int      `json:"end"`
}
