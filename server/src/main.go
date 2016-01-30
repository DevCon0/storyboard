package main

import (
	"bytes"
	"fmt"
	"time"

	"net/http"
	"os"
	"path/filepath"

	"gopkg.in/mgo.v2"
)

var (
	rootDir           string
	slash             string = string(filepath.Separator)
	session           *mgo.Session
	db                *mgo.Database
	usersCollection   *mgo.Collection
	storiesCollection *mgo.Collection
	dbFs              *mgo.GridFS
	connectedToDb     bool
)

func main() {
	initDb()

	fmt.Println("Database connection established.")
	defer session.Close()

	// Restart the database connection every hour.
	ticker := time.NewTicker(1 * time.Hour)
	quit := make(chan struct{})
	go func() {
		for {
			select {
			case <-ticker.C:
				restartDbConnection()
			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()

	setRootDir()

	http.HandleFunc("/", clientHandler)
	http.HandleFunc("/api/users/", usersHandler)
	http.HandleFunc("/api/stories/", storyHandler)
	http.HandleFunc("/api/images/", imageHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8020"
	}
	fmt.Printf("Listening on port %s\n", port)

	port = concat(":", port)
	http.ListenAndServe(port, nil)
}

// Connect to the mongo database.
func initDb() {
	// dbpath="db"; ! [ -d "${dbpath}" ] && mkdir -p "${dbpath}"; mongod --port 27018 --dbpath "${dbpath}" --wiredTigerJournalCompressor snappy --wiredTigerCollectionBlockCompressor snappy --cpu

	connectedToDb = false

	var err error
	url := "mongodb://devcon0:devcon0@ds037415.mongolab.com:37415/devcon0"
	session, err = mgo.Dial(url)
	if err != nil {
		fmt.Printf("Error: Failed to connect to mongodb: %v\n", err)
		for second := 5; second > 0; second-- {
			fmt.Printf("\rRetrying in %d...", second)
			time.Sleep(time.Second)
		}
		fmt.Println()
		initDb()
	}

	session.SetMode(mgo.Monotonic, true)
	session.SetSocketTimeout(15 * time.Second)

	db = session.DB("devcon0")
	usersCollection = db.C("users")
	storiesCollection = db.C("stories")
	dbFs = db.GridFS("fs")

	connectedToDb = true
}

// Restart the database if the connection has been lost.
func restartDbConnection() {
	if err := session.Ping(); err != nil {
		fmt.Println("Restarting database connection...")
		session.Close()
		initDb()
	}
}

// If not connected to the database,
//   wait to return until a connection is established.
func verifyDbConnection() {
	if !connectedToDb {
		verifyDbConnection()
	}
}

// Find out where this go file exists on the file system.
// When temporarily compiled, find the directory of the $PWD.
func setRootDir() {
	rootDir, _ = filepath.Abs(filepath.Dir(os.Args[0]))
	// If the file was run with `go run...`,
	//   set it to the parent directory of the $PWD.
	baseDir := filepath.Base(rootDir)

	switch baseDir {
	case "storyboard":
		// rootDir = rootDir
	case "server":
		rootDir = filepath.Dir(rootDir)
	case "src":
		parentDir := filepath.Dir(rootDir)
		rootDir = filepath.Dir(parentDir)
	default:
		// When using `go run`, grab the $PWD.
		pwd, _ := os.Getwd()
		parentDir := filepath.Dir(pwd)
		rootDir = filepath.Dir(parentDir)
	}

	fmt.Printf("rootDir: %q\n", rootDir)
}

// Basic error handling.
func chkerr(err error) {
	if err != nil {
		// log.Fatal(err)
		fmt.Println(err)
	}
}

// Concatenate strings together into one string.
func concat(slc ...string) string {
	b := bytes.NewBuffer(nil)
	defer b.Reset()
	for _, s := range slc {
		b.WriteString(s)
	}
	return b.String()
}

// Convert a string into a slice.
func slc(args ...string) []string {
	return args
}
