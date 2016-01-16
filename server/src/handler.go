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
	baseLocation := "api/users/"
	fullLocation := r.URL.Path[1:]

	location := strings.TrimPrefix(fullLocation, baseLocation)

	switch location {
	case "signup":
		signup(w, r)
	case "signin":
		signin(w, r)
	default:
		fmt.Printf("No idea what this is: %v\n", location)
	}
}
