package sessions

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
)

const (
	COOKIE_AGE              = 1800 // Seconds = 30 minutes
	COOKIE_NAME             = "forum_session_id"
	COOKIE_PATH             = "/"
	COOKIE_CLEANUP_INTERVAL = 120 // Seconds
)

var (
	ActiveSessions = &LoggedInSessions{}
	Colour         = Colours{
		Reset:     "\033[0m",
		Blue:      "\033[0;34m",
		LightBlue: "\033[1;34m",
	}
)

/*
Initialise is a method for the (s *LoggedInSessions) struct, which allows for
initialisation of the sessions map from the main file.
*/
func (s *LoggedInSessions) Initialise() {
	s.Data = make(map[string]*Session)
	// Must use the following in main file:
	// cookies.ActiveSessions.Initialise()
}

/*
ClearSession is a method for the (s *LoggedInSessions) struct. It takes in a session
ID as input, and deletes the key-value pair associated with the session ID from the
map in (s *LoggedInSessions) (regardless of whether the session ID exists or not).
*/
func (s *LoggedInSessions) ClearSession(sessionID string) {
	// A full-lock is used as the method modifies the map
	s.rwMutex.Lock()
	defer s.rwMutex.Unlock()
	userName := s.Data[sessionID].Username
	log.Printf("Session %s\"%s\"%s, associated with user %s\"%s\"%s has been deleted",
		Colour.Blue, sessionID, Colour.Reset, Colour.Blue, userName, Colour.Reset)
	delete(s.Data, sessionID)
}

/*
CleanExpiredSessions is a method for the (s *LoggedInSessions) struct. It loops
through the map and deletes any sessions that have expired (i.e. the duration of
time elapsed since the last access of the session, as stored in session.LastAccess,
is greater than the constant COOKIE_AGE (expressed in seconds)). It is intended to
be run as a goroutine in the main file.
*/
func (s *LoggedInSessions) CleanExpiredSessions() {
	// A read lock is used to prevent concurrent writes to the map
	// but multiple reads are allowed
	s.rwMutex.RLock()

	for sessionID, session := range s.Data {
		// Check if the duration of time elapsed since the last access of the session,
		// as stored in session.LastAccess, is greater than the constant COOKIE_AGE
		// (expressed in seconds).
		if time.Since(*session.LastAccess) > time.Duration(COOKIE_AGE)*time.Second {
			s.rwMutex.RUnlock()
			s.ClearSession(sessionID)
			s.rwMutex.RLock()
		}
	}
	s.rwMutex.RUnlock()
}

func (s *LoggedInSessions) RemoveDuplicateSessions(w http.ResponseWriter, r *http.Request, userName string) {
	// A read lock is used to prevent concurrent writes to the map
	// but multiple reads are allowed
	s.rwMutex.RLock()

	for id, session := range s.Data {
		fmt.Println(session.Username)
		fmt.Println(userName)
		if session.Username == userName {
			s.rwMutex.RUnlock()
			fmt.Println("4")
			s.ClearSession(id)
			s.rwMutex.RLock()
		}
	}
	s.rwMutex.RUnlock()
}

/*
Status is a method for the (s *LoggedInSessions) struct, that takes in a http.Request
as an input and retrieves a session cookie if it exists (it immediately returns false
if no session cookie is found). It then retrieves the session ID string from the cookie
value and checks the map in (s *LoggedInSessions) to verify if the user is logged in.
It returns a boolean value indicating the result (true if logged in, false otherwise).
It is called by the global CheckSessions function.
*/
func (s *LoggedInSessions) Status(w http.ResponseWriter, r *http.Request) bool {
	// Get the session ID cookie
	cookie, err := r.Cookie(COOKIE_NAME)

	if err != nil {
		return false // If cookie not found --> User not logged in
	} else {
		sessionID := cookie.Value

		// A read-lock is used to allow for concurrent read access to the map,
		// but only one write access
		s.rwMutex.RLock()
		// Check if sessionID is in the map
		session, exists := s.Data[sessionID]
		s.rwMutex.RUnlock()
		if exists {
			if session.Username != "" {
				return true // User logged in
			}
		} else {
			// Delete cookie as it exists client-side but not server-side
			// (e.g. due to a server restart)
			cookie.MaxAge = -1
			http.SetCookie(w, cookie)
		}
	}
	return false // User not logged in
}

/*
GenerateSessionID is a method for the (s *LoggedInSessions) struct, and checks the
existing keys of the *LoggedInSessions struct for which it is called. It returns a
UUID string that can be used as a unique session ID. The function is called locally:
e.g. "string = ActiveSessions.generateSessionID()".
*/
func (s *LoggedInSessions) GenerateSessionID() string {
	// A full-lock is used to prevent concurrent access to the map, ensuring that
	// only the same session ID is not generated twice
	s.rwMutex.Lock()
	defer s.rwMutex.Unlock()

	// Loop until a unique session ID is generated
	for {
		sessionID, _ := uuid.NewV4()
		if _, exists := s.Data[sessionID.String()]; !exists {
			return sessionID.String()
		}
	}
}

/*
CreateSession is a method for the (s *LoggedInSessions) struct, called by the global
Check function. It takes in a http.ResponseWriter and a string (the user's username)
as inputs. It calls the generateSessionID() method and sets a new cookie with the new
session ID. It creates a new session struct and adds it to the map in
(s *LoggedInSessions).
*/
func (s *LoggedInSessions) CreateSession(w http.ResponseWriter, userName string) {
	// Initialise / declare variables
	currentTime := time.Now()
	sessionID := s.GenerateSessionID()

	// A full-lock is used to prevent concurrent access to the map
	s.rwMutex.Lock()

	// Add the new session to the map
	s.Data[sessionID] = &Session{
		ID:         sessionID,
		Username:   userName,
		LastAccess: &currentTime,
	}
	s.rwMutex.Unlock()

	// Create and set a new cookie with the new session ID
	cookie := &http.Cookie{
		Name:     COOKIE_NAME,
		Value:    sessionID,
		Path:     COOKIE_PATH,
		MaxAge:   COOKIE_AGE,
		HttpOnly: true,
	}
	http.SetCookie(w, cookie)
}

/*
GetUsername is a method for the (s *LoggedInSessions) struct, called by the global Check()
function, which takes a http.Request as an input and returns a string representing the username
associated with an active session (if it exists). It retrieves a session cookie if it exists
(it immediately returns an empty string if no session cookie is found), and then retrieves the
session ID string from the cookie value and checks the map in (s *LoggedInSessions) to verify
if the user is logged in. It returns a string value indicating the result (the username if logged
in, an empty string otherwise).
*/
func (s *LoggedInSessions) GetUsername(r *http.Request) string {
	// Check for cookies, extract sessionID if cookie exists
	cookie, err := r.Cookie(COOKIE_NAME)
	if err != nil {
		return ""
	}
	sessionID := cookie.Value

	s.rwMutex.RLock()
	// Extract session (*Session type) from ActiveSessions map
	session, ok := s.Data[sessionID]
	if !ok {
		return ""
	}
	s.rwMutex.RUnlock()

	// Retrieve the value of the "Username" key in the session.Data map. If the key exists,
	// the value is assigned to data and the "ok" flag is set to true
	if userName := session.Username; userName != "" {
		return userName
	}
	return ""
}

/*
Renew is a method for the (s *LoggedInSessions) struct and conforms to the http Handler
interface, taking a http.Responsewriter and http.Request as inputs, and returning an
error value. It first attempts to retrieve a relevant cookie from the request, and if
a cookie is not found, the function returns a non-nil error. If a cookie is found, it
retrieves the session ID from the cookie value and checks if it exists in the s.Data
map. If it does, the function updates the MaxAge field of the cookie (expiration time),
as well as the LastAccess field of the session struct in the s.Data map server-side.
The updated cookie is then written to the response.
*/
func (s *LoggedInSessions) Renew(w http.ResponseWriter, r *http.Request) error {
	// Get the session ID cookie
	cookie, err := r.Cookie(COOKIE_NAME)
	if err != nil {
		return fmt.Errorf("session not found or expired: %v", err)
	}

	// Get the session ID from the cookie
	sessionID := cookie.Value

	// A full-lock is used to prevent concurrent access to the map
	s.rwMutex.Lock()

	// Check if the session ID exists in the struct for which the method is called
	session, exists := s.Data[sessionID]
	if !exists {
		// If session not found, return an error
		return errors.New("session not found or expired")
	}

	// Update the session server-side
	session.LastAccess = &time.Time{} // Reset pointer
	*session.LastAccess = time.Now()  // Update the time
	s.Data[sessionID] = session       // Update the map
	s.rwMutex.Unlock()

	// Update the session (cookie) client-side
	cookie.MaxAge = COOKIE_AGE
	http.SetCookie(w, cookie)
	return nil
}

/*
Check() is a function that takes an http.ResponseWriter and an http.Request as inputs,
and returns a string value corresponding to the username, if the session corresponds
to that of a logged in user (otherwise a blank string), as well as an error value. It
calls the local method Status() to check if the user is logged in (i.e. if a cookie is
present in the request). If the user is not logged in, the function immediately returns
an empty string and a nil error value. If the user is logged in, the function calls the
local method Renew() to renew the session, and if it returns an error, the function
returns an empty string and the error value. Otherwise, the userID is extracted using
the GetUsername() method and is returned along with a nil error value.
*/
func Check(w http.ResponseWriter, r *http.Request) (string, error) {
	// Check login status
	userLoggedIn := ActiveSessions.Status(w, r)

	if !userLoggedIn {
		return "", nil
	} else {
		// Renew session
		err := ActiveSessions.Renew(w, r)
		if err != nil {
			// If Renew() returns an error, return an empty string and the error value
			return "", fmt.Errorf("error renewing session: %v", err)
		}
	}
	// If all is well, return the username and a nil error value
	return ActiveSessions.GetUsername(r), nil
}

/*
Login is a function that takes an http.ResponseWriter, an http.Request, and a string (username) as
inputs. It checks if a cookie is present in the request and if it is not, it creates a new session
for the user. If a cookie is present, it checks if the session exists by calling the local method
Status(). If the session does not exist server-side for whatever reason, it creates a new session.
Otherwise, it calls the local method Renew() to renew the session. If Renew() returns an error,
the function returns the error value. Otherwise, the function returns a nil error value.
*/
func Login(w http.ResponseWriter, r *http.Request, userName string) error {
	// Check if username has a session associated with it
	// If so remove the session
	ActiveSessions.RemoveDuplicateSessions(w, r, userName)

	// Check if cookie exists
	_, err := r.Cookie(COOKIE_NAME)
	if err == http.ErrNoCookie {
		// If cookie does not exist, create a new session
		ActiveSessions.CreateSession(w, userName)
		fmt.Println("1")
		// Log the login
		log.Printf("User "+Colour.LightBlue+"%s"+Colour.Reset+" has logged in", userName)
		return nil
	} else if err != nil {
		return fmt.Errorf("error reading cookie: %v", err)
	}

	// If cookie exists, check if session exists
	if isLoggedIn := ActiveSessions.Status(w, r); !isLoggedIn {
		// If session does not exist, create a new session
		ActiveSessions.CreateSession(w, userName)
		// Log the login
		log.Printf("User "+Colour.LightBlue+"%s"+Colour.Reset+" has logged in", userName)
		return nil
	}

	// If cookie exists and session exists, renew session
	err = ActiveSessions.Renew(w, r)
	if err != nil {
		return fmt.Errorf("error renewing session: %v", err)
	}
	return nil
}

/*
Logout is a function that takes an http.ResponseWriter and an http.Request as inputs.
It retrieves the session ID from the cookie in the request (if present), and uses it
to remove the corresponding session from the ActiveSessions map, effectively logging
out the user.
*/
func Logout(w http.ResponseWriter, r *http.Request) {
	// Get session ID from cookie
	cookie, err := r.Cookie(COOKIE_NAME)
	if err != nil {
		// If a cookie does not exist, the user is not logged in and there is nothing to do
		// This handles the case where a user is logged in and then clears their cookies
		// or if a user is not logged in and tries to log out.
		log.Println(err)
		return
	}
	sessionID := cookie.Value
	userName := ActiveSessions.GetUsername(r)

	// Delete session ID from ActiveSessions map
	ActiveSessions.ClearSession(sessionID)

	// Set cookie to expire immediately, and send it to the client
	cookie.MaxAge = -1
	http.SetCookie(w, cookie)

	// Log the logout
	log.Printf("User "+Colour.Blue+"%s"+Colour.Reset+" has logged out", userName)
}

// CleanUpRoutine is a function that runs in the background and cleans up expired sessions
// every COOKIE_CLEANUP_INTERVAL seconds. The function is called in main.go as a goroutine.
func CleanUpRoutine() {
	go func() {
		for {
			ActiveSessions.CleanExpiredSessions()
			time.Sleep(time.Duration(COOKIE_CLEANUP_INTERVAL) * time.Second)
		}
	}()
}
