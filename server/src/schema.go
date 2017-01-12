package main

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// User Model - separate collection
type User struct {
	Id        bson.ObjectId `json:"userId" bson:"_id,omitempty"`
	CreatedAt time.Time     `json:"createdAt" bson:"created_at"`
	Username  string        `json:"username"`
	Password  string        `json:"password"`
	Fullname  string        `json:"fullname"`
	Stories   []string      `json:"stories"`
	Token     string        `json:"token"`
}

// Story Model - separate collection
type Story struct {
	Id            bson.ObjectId `json:"storyId" bson:"_id,omitempty"`
	CreatedAt     time.Time     `json:"createdAt" bson:"created_at"`
	Title         string        `json:"title"`
	Description   string        `json:"description"`
	HasSoundtrack bool          `json:"hasSoundtrack" bson:"has_soundtrack"`
	Thumbnail     string        `json:"thumbnail"`
	Username      string        `json:"username"`
	Author        string        `json:"author"`
	Views         int           `json:"views"`
	Tags          []string      `json:"tags"`
	Frames        []Frame       `json:"frames"`
	FRAME1        int
	FRAME2        int
	FRAME3        int
}

// Frame model for Acts/Scenes
type Frame struct {
	// 0 for video, 1 for image, 2 for txt2speech, 3 for audio track
	MediaType      int      `json:"mediaType"`
	Player         struct{} `json:"player"`
	PlayerDiv      string   `json:"playerDiv"`
	VideoId        string   `json:"videoId"`
	Start          float32  `json:"start"`
	End            float32  `json:"end"`
	Volume         int      `json:"volume"`
	PreviewUrl     string   `json:"previewUrl" bson:"previewurl"`
	ImageUrl       string   `json:"imageUrl" bson:"imageurl"`
	ImageDuration  int      `json:"imageDuration"`
	NarrationText  string   `json:"narrationText"`
	NarrationDelay float32  `json:"narrationDelay"`
	AudioId        string   `json:"audioId"`
	AudioStart     float32  `json:"audioStart"`
	AudioVolume    float32  `json:"audioVolume"`
}

// JSON object
type Object map[string]interface{}
