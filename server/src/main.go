package main

import (
	"bytes"
	"fmt"
	"log"

	"gopkg.in/mgo.v2"
	// "io/ioutil"
	"net/http"
	"os"
	"path/filepath"
)

var (
	rootDir string
	slash   string = string(filepath.Separator)
	db      *mgo.Database
)

func main() {
	session, err := initDb()
	chkerr(err)
	defer session.Close()

	setRootDir()

	http.HandleFunc("/", clientHandler)
	http.HandleFunc("/api/users/", usersHandler)
	http.HandleFunc("/api/stories/", storyHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8020"
	}
	fmt.Printf("Listening on port %s\n", port)

	port = concat(":", port)
	http.ListenAndServe(port, nil)
}

func initDb() (*mgo.Session, error) {
	// dbpath="db"; ! [ -d "${dbpath}" ] && mkdir -p "${dbpath}"; mongod --port 27018 --dbpath "${dbpath}" --wiredTigerJournalCompressor snappy --wiredTigerCollectionBlockCompressor snappy --cpu

	url := "mongodb://devcon0:devcon0@ds037415.mongolab.com:37415/devcon0"
	// url := "localhost:27018"

	session, err := mgo.Dial(url)
	if err != nil {
		return session, err
	}

	session.SetMode(mgo.Monotonic, true)
	db = session.DB("devcon0")

	return session, nil
}

// Find out where this go file exists on the file system.
// When temporarily compiled, find the directory of the $PWD.
func setRootDir() {
	rootDir, _ = filepath.Abs(filepath.Dir(os.Args[0]))
	// If the file was run with `go run...`,
	//   set it to the parent directory of the $PWD.
	// fmt.Printf("rootDir: %q\n", rootDir)

	baseDir := filepath.Base(rootDir)
	// fmt.Printf("baseDir: %q\n", baseDir)

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
		log.Fatal(err)
		// fmt.Println(err)
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

// Pass to fmt.Println().
func print(a ...interface{}) {
	fmt.Println(a...)
}

// Pass to fmt.Printf().
func printf(format string, a ...interface{}) {
	fmt.Printf(format, a...)
}

// func main() {
//     pwd, _ = os.Getwd()
//     http.HandleFunc("/", handler)
//     http.HandleFunc("/bower_components/", bowerHandler)
//     // http.HandleFunc("/models/", modelHandler)
//     // http.HandleFunc("/components/", componentHandler)
//     // http.HandleFunc("/style.css", styleHandler)
//     http.ListenAndServe(":8080", nil)
// }

// type Page struct {
//     Title string
//     Body  []byte
// }

// func loadPage(title string) (*Page, error) {
//     // filename := title + ".txt"
//     filename := concat("client", string(filepath.Separator), title)
//     fmt.Printf("filename:\n%q\n", filename)
//     body, err := ioutil.ReadFile(filename)
//     if err != nil {
//         return nil, err
//     }
//     return &Page{Title: title, Body: body}, nil
// }

// func handler(w http.ResponseWriter, r *http.Request) {
//     // body, err := ioutil.ReadFile("client/index.html")
//     // if err != nil {
//     //  fmt.Println(err)
//     // }
//     // fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])
//     // fmt.Fprintf(w, "Hi there, I love %s!", body)
//     // fmt.Fprintln(w, string(body))
//     // fmt.Printf("r.URL.Path %q...\n", r.URL.Path)

//     title := concat(pwd, slash, "client", slash, r.URL.Path[1:])
//     if len(title) == 1 {
//         title = concat(title, "index.html")
//     }
//     fmt.Printf("Serving home page file '%q'...\n", title)
//     http.ServeFile(w, r, title)
// }

// func bowerHandler(w http.ResponseWriter, r *http.Request) {
//     // fmt.Println("r.URL.Path", r.URL.Path)
//     // title := r.URL.Path[1:]
//     slash := string(filepath.Separator)
//     title := concat(pwd, slash, "client", slash, r.URL.Path[1:])
//     fmt.Printf("Serving bower library '%q'...\n", title)
//     // p, _ := loadPage(title)
//     // fmt.Fprintf(w, "<h1>%s</h1><div>%s</div>", p.Title, p.Body)
//     // fmt.Fprintf(w, string(p.Body))
//     http.ServeFile(w, r, title)
// }

// func modelHandler(w http.ResponseWriter, r *http.Request) {
//  // fmt.Println("r.URL.Path", r.URL.Path)
//  // title := r.URL.Path[1:]
//  title := concat(pwd, slash, "client", slash, r.URL.Path[1:])
//  fmt.Printf("Serving model '%q'...\n", title)
//  // p, _ := loadPage(title)
//  // fmt.Fprintf(w, "<h1>%s</h1><div>%s</div>", p.Title, p.Body)
//  // fmt.Fprintf(w, string(p.Body))
//  http.ServeFile(w, r, title)
// }

// func componentHandler(w http.ResponseWriter, r *http.Request) {
//  // fmt.Println("r.URL.Path", r.URL.Path)
//  // title := r.URL.Path[1:]
//  title := concat(pwd, slash, "client", slash, r.URL.Path[1:])
//  fmt.Printf("Serving component '%q'...\n", title)
//  // p, _ := loadPage(title)
//  // fmt.Fprintf(w, "<h1>%s</h1><div>%s</div>", p.Title, p.Body)
//  // fmt.Fprintf(w, string(p.Body))
//  http.ServeFile(w, r, title)
// }

// func styleHandler(w http.ResponseWriter, r *http.Request) {
//  // fmt.Println("r.URL.Path", r.URL.Path)
//  // title := r.URL.Path[1:]
//  title := concat(pwd, slash, "client", slash, r.URL.Path[1:])
//  fmt.Printf("Serving style %q...\n", title)
//  // p, _ := loadPage(title)
//  // fmt.Fprintf(w, "<h1>%s</h1><div>%s</div>", p.Title, p.Body)
//  // fmt.Fprintf(w, string(p.Body))
//  http.ServeFile(w, r, title)
// }
