package sessions

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
)

type Session struct {
	nickname   string
	LastAccess *time.Time
}

// LoggedInSessions manages active sessions
type LoggedInSessions struct {
	Data map[string]Session // [sessionID] = session data
}

var (
	ActiveSessions = LoggedInSessions{
		Data: make(map[string]Session),
	}
)

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

// CreateSessionID generates a new session ID using github.com/gofrs/uuid
func CreateSessionID() (string, error) {
	sessionID, err := uuid.NewV4()
	if err != nil {
		return "", err
	}
	return sessionID.String(), nil
}

// CreateSession creates a new session and adds it to the active sessions map
func CreateSession(w http.ResponseWriter, nickname string) (string, error) {

	// Check if user already has an active session
	for sessionId, session := range ActiveSessions.Data {
		if session.nickname == nickname {
			// Remove existing session
			delete(ActiveSessions.Data, sessionId)
			http.SetCookie(w, &http.Cookie{
				Name:   "sessionID",
				Value:  sessionId,
				MaxAge: -1,
			})
			break
		}
	}
	sessionID, err := CreateSessionID()
	if err != nil {
		return "", err
	}
	currentTime := time.Now()
	session := Session{
		nickname:   nickname,
		LastAccess: &currentTime,
	}
	ActiveSessions.Data[sessionID] = session
	// Add session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "sessionID",
		Value:    sessionID,
		Path:     "/",
		MaxAge:   60,
		HttpOnly: true,
	})
	return sessionID, nil
}

// GetSession retrieves the session data for a given session ID
func GetSession(nickname string) (Session, bool) {
	for _, session := range ActiveSessions.Data {
		if session.nickname == nickname {
			return session, true
		}
	}
	return Session{}, false

}
func GetOnlineUsers() []string {
	var onlineUsers []string
	for _, session := range ActiveSessions.Data {
		onlineUsers = append(onlineUsers, session.nickname)
	}
	return onlineUsers
}

// GetNickname retrieves the nickname for a given session ID
func GetNickname(sessionID string) (string, bool) {
	session, ok := ActiveSessions.Data[sessionID]
	if ok {
		return session.nickname, true
	}
	return "", false
}
func Check(w http.ResponseWriter, r *http.Request) (string, bool) {
	cookie, err := r.Cookie("sessionID")
	fmt.Println("cookie:", cookie)
	if err != nil {
		return "", false // If cookie not found --> User not logged in
	} else {
		sessionID := cookie.Value
		for id, session := range ActiveSessions.Data {
			fmt.Println("id", id, "session:", session.nickname)
		}
		wtf, ok := ActiveSessions.Data[sessionID]
		fmt.Println("wtf:", wtf, "ok:", ok)
		if !ok {
			fmt.Println("session not found")
			http.SetCookie(w, &http.Cookie{
				Name:   "sessionID",
				Value:  "",
				Path:   "/",
				MaxAge: -1,
			})
			w.WriteHeader(http.StatusOK)
			fmt.Println("cookie deleted", w)
			//	DeleteSession(w, wtf.nickname)
			return "", false // If session not found --> User not logged in
		}
		return wtf.nickname, true
	}

}
func DeleteSession(w http.ResponseWriter, nickname string) error {
	for sessionId, session := range ActiveSessions.Data {
		if session.nickname == nickname {
			// Remove existing session
			delete(ActiveSessions.Data, sessionId)
			http.SetCookie(w, &http.Cookie{
				Name:   "sessionID",
				Value:  sessionId,
				MaxAge: -1,
			})
			return nil
		}
	}
	return fmt.Errorf("No session found for user %s", nickname)
}
func (s *LoggedInSessions) CleanUpInactiveSessions(maxIdleTime time.Duration) {
	now := time.Now()
	for sessionId, session := range s.Data {
		if now.Sub(*session.LastAccess) > maxIdleTime {
			delete(s.Data, sessionId)
		}
	}
}
