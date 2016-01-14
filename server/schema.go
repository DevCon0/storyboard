package main

// Create User Model
type User struct {
	Username  string
	Password  string
	Firstname string
	Lastname  string
	Stories   []string
}

// Story Model
type Story struct {
	Title     string
	UserId    string
	Start1url string
	Body2url  string
	End3url   string
}
