package sessions

import (
	"sync"
	"time"
)

/*
Session struct is used to store the session ID and user ID of the logged in user,
as well as the last access time of each session. It is used to verify if the user is
logged in, and to clear the session ID when the user logs out or the session expires.
A different variable is assigned to this struct for each user and is added as a key-value
pair to the map in the LoggedInSessions struct (found in the backend/cookies/cookies.go).
It also has a boolean "Admin" field to indicate if the user is an admin or not (this is
for future use, when the admin page is implemented).
*/
type Session struct {
	ID         string
	Username   string
	Admin      bool
	LastAccess *time.Time
}

/*
LoggedInSessions struct is used to store the session ID and user ID of the logged in
user, as well as the last access time of each session. It is used to verify if the
user is logged in, and to clear the session ID when the user logs out or the session
expires. A variable of this type, with the name ActiveSessions, is declared in the
main file, and is used to access the methods of the struct (found in the
backend/cookies/cookies.go file).
*/
type LoggedInSessions struct {
	Data    map[string]*Session // [sessionID] = session data
	rwMutex sync.RWMutex
}

type Colours struct {
	Reset      string // Resets terminal colour to default after 'text colouring'
	Red        string
	LightRed   string
	Green      string
	LightGreen string
	Blue       string
	LightBlue  string
	Orange     string
	Yellow     string
}
