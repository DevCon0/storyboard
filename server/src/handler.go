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
	err, status := func() (error, int) {
		location := strings.Split(r.URL.Path, "/")[3]

		switch location {
		case "signup":
			return signup(w, r)
		case "signin":
			return signin(w, r)
		case "signout":
			return signout(w, r)
		case "profile":
			return loadProfile(w, r)
		default:
			err := fmt.Errorf("Endpoint not defined: %v\n", location)
			return err, http.StatusInternalServerError
		}
	}()
	if err != nil {
		fmt.Printf("UserHandler error: %v\n", err)
		http.Error(w, err.Error(), status)
		return
	}
}

func storyHandler(w http.ResponseWriter, r *http.Request) {
	baseLocation := "/api/stories/"
	routeAndId := strings.TrimPrefix(r.URL.Path, baseLocation)
	split := strings.Split(routeAndId, "/")
	location := split[0]
	id := concat(split[1:]...)

	// fmt.Println("storyHandler location", location)

	err, status := func() (error, int) {
		switch location {
		case "story":
			return handleStory(w, r, id)
		case "library":
			return library(w, r, id)
		case "showcase":
			return showCase(w, r)
		default:
			return fmt.Errorf("Unknown stories api location: %v\n", location),
				http.StatusBadRequest
		}
	}()
	if err != nil {
		fmt.Println(err)
		http.Error(w, err.Error(), status)
		return
	}
}
