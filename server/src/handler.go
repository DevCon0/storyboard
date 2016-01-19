package main

import (
	"fmt"
	"net/http"
	"strings"
)

// Handle requests to "/"
// In other words, send client files.
func clientHandler(w http.ResponseWriter, r *http.Request) {
	fileRequested := r.URL.Path[1:]

	// "/" => "/index.html"
	if fileRequested == "" {
		fileRequested = concat(fileRequested, "index.html")
	}

	//    "/bower_components/mithril/mithril.min.js"
	// => "/$PWD/client/bower_components/mithril/mithril.min.js"
	title := concat(rootDir, slash, "client", slash, fileRequested)

	fmt.Printf("Serving file:\n    %q\n", title)

	http.ServeFile(w, r, title)
}

// Handle requests to "/api/users/..."
func usersHandler(w http.ResponseWriter, r *http.Request) {
	location := strings.Split(r.URL.Path, "/")[3]

	switch location {
	case "signup":
		signup(w, r)
	case "signin":
		signin(w, r)
	case "signout":
		signout(w, r)
	case "profile":
		loadProfile(w, r)
	default:
		fmt.Printf("Endpoint not defined: %v\n", location)
	}
}

func storyHandler(w http.ResponseWriter, r *http.Request) {
	baseLocation := "/api/stories/"
	routeAndId := strings.TrimPrefix(r.URL.Path, baseLocation)
	split := strings.Split(routeAndId, "/")
	location := split[0]
	id := concat(split[1:]...)

	fmt.Println("storyHandler location", location)

	switch location {

	case "story":
		handleStory(w, r, id)

	case "library":
		library(w, r, id)

	case "showcase":
		showCase(w, r)

	default:
		fmt.Printf("Unknown stories api location: %v\n", location)
	}
}
