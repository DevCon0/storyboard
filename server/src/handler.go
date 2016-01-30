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

	// If no file is named, send the initial client file: "index.html".
	if fileRequested == "" {
		fileRequested = concat(fileRequested, "index.html")
	}

	// Append the present working directory to the filename.
	title := concat(rootDir, slash, "client", slash, fileRequested)

	http.ServeFile(w, r, title)
}

// Handle requests to "/api/users"
func usersHandler(w http.ResponseWriter, r *http.Request) {
	// If reconnecting to the database,
	//   wait until a connection is established.
	verifyDbConnection()

	err, status := func() (error, int) {
		pathNodes := strings.Split(r.URL.Path, "/")
		directory := pathNodes[3]
		file := concat(pathNodes[4:]...)

		errBadMethod := fmt.Errorf("Unsupported method: %v", r.Method)
		errBadLocation := fmt.Errorf("Unsupported location: %v", r.URL.Path)

		switch r.Method {
		case "GET":
			switch directory {
			case "profile":
				return loadProfile(w, r, file)
			default:
				return errBadLocation, http.StatusBadRequest
			}

		case "POST":
			switch directory {
			case "signup":
				return signup(w, r)
			case "signin":
				return signin(w, r)
			case "signout":
				return signout(w, r)
			default:
				return errBadLocation, http.StatusBadRequest
			}

		default:
			return errBadMethod, http.StatusBadRequest
		}
	}()

	if err != nil {
		fmt.Println(err)
		http.Error(w, err.Error(), status)
		return
	}
}

// Handle requests to '/api/stories'.
func storyHandler(w http.ResponseWriter, r *http.Request) {
	// If reconnecting to the database,
	//   wait until a connection is established.
	verifyDbConnection()

	err, status := func() (error, int) {
		pathNodes := strings.Split(r.URL.Path, "/")
		directory := pathNodes[3]
		file := concat(pathNodes[4:]...)

		errBadMethod := fmt.Errorf("Unsupported method: %v", r.Method)
		errBadLocation := fmt.Errorf("Unsupported location: %v", r.URL.Path)

		switch r.Method {
			case "GET":
				switch directory {
					case "story":
						return getStory(w, r, file)
					case "library":
						return getLibrary(w, r, file)
					case "showcase":
						// return showCase(w, r)
						return getShowCaseRandom(w, r)
					case "tags":
						return searchStories(w, r, file)
					default:
						return errBadLocation, http.StatusBadRequest
				}
			case "POST":
				switch directory {
					case "story":
						return saveStory(w, r)
					case "votes":
						return postVote(w, r)
					default:
						return errBadLocation,
							http.StatusBadRequest
				}
			case "PUT":
				switch directory {
					case "story":
						return editStory(w, r)
					default:
						return errBadLocation, http.StatusBadRequest
				}
			case "DELETE":
				switch directory {
					case "story":
						return deleteStory(w, r, file)
					default:
						return errBadLocation, http.StatusBadRequest
				}
			default:
				return errBadMethod, http.StatusBadRequest
			}
	}()
	if err != nil {
		fmt.Println(err)
		http.Error(w, err.Error(), status)
		return
	}
}

// Handle requests to "/api/images/..."
func imageHandler(w http.ResponseWriter, r *http.Request) {
	// If reconnecting to the database,
	//   wait until a connection is established.
	verifyDbConnection()

	err, status := func() (error, int) {
		// Get the unique part of the url (everything after '/api/images/').
		sharedPath := "/api/images/"
		file := strings.TrimPrefix(r.URL.Path, sharedPath)

		switch r.Method {
		case "GET":
			switch file {
			case "text-to-speech.svg":
				return getImageByName(w, r, file)
			default:
				return getImageById(w, r, file)
			}
		default:
			return fmt.Errorf("Unsupported method %v", r.Method),
				http.StatusBadRequest
		}
	}()

	if err != nil {
		fmt.Println(err)
		http.Error(w, err.Error(), status)
		return
	}
}
