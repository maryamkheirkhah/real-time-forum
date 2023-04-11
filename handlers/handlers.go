package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/security"
	"real-time-forum/sessions"
	"time"

	"github.com/gorilla/websocket"
)

const (
	MESSAGE_COOKIE_NAME = "forum-message"
)

var (
	Status = StatusData{
		Code: 200,
		Msg:  "",
	}
)

/*
redirectHandler is a global http redirect handler function which in addition to the standard http.Responsewriter
and *http.Request variables, also takes a string for the target page name and a string for the message to be
displayed on the target page. The message is stored in a cookie with a 10 second lifespan, and the user is
redirected to the target page.
*/
func redirectHandler(w http.ResponseWriter, r *http.Request, pageName string, message string) {
	// Create a new cookie with the message value
	var messageCookie = http.Cookie{
		Name:    MESSAGE_COOKIE_NAME,
		Value:   message,
		MaxAge:  1, // The cookie will last 10 seconds
		Expires: time.Now().Add(1 * time.Second),
		Path:    "/",
	}
	// Set the cookie on the response writer
	http.SetCookie(w, &messageCookie)
	w.WriteHeader(http.StatusOK)

	// Redirect to the target page
	//http.Redirect(w, r, pageName, http.StatusMovedPermanently)
}

func Login(w http.ResponseWriter, r *http.Request) {

	// Check for logged-in session cookie, renew / update if found, return username if found

	/* 	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	} */

	var data LoginData
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	user, err := db.SelectDataHandler("users", "NickName", data.NickName)
	var msg string
	if err != nil {
		msg = "The user doesn't exist"
		fmt.Println("error:", msg)
		responseData := map[string]string{"nickname": "wrong"}
		json.NewEncoder(w).Encode(responseData)
	} else if !security.MatchPasswords([]byte(data.Password), user.(db.User).Pass) {
		fmt.Println("The password is incorrect")
		responseData := map[string]string{"nickname": ""}
		json.NewEncoder(w).Encode(responseData)
	} else {
		keys, err := sessions.Login(w, r, data.NickName) // Get userName from Login post method data
		if err != nil {
			msg = "The user doesn't exist"
			fmt.Println("err", err)
			//	renderTemplate(w, r, msg, "./frontend/static/login.html")
		} else {
			// Redirect to the main page upon successful login
			responseData := map[string]string{"nickname": keys[0]}
			json.NewEncoder(w).Encode(responseData)

			redirectHandler(w, r, "/", "You are successfully logged in")
		}
	}
}

func Register(w http.ResponseWriter, r *http.Request) {
	userName, err := sessions.Check(w, r)
	if err != nil {
		// Reload login page if CheckSessions returns an error
		//		renderTemplate(w, r, err.Error()+": please try logging in or registering",
		//			"./frontend/static/login.html")
		fmt.Println("error is :", err.Error())
	} else if userName != "" {
		fmt.Println("user is :", userName)
		// Redirect to main page if user is logged in
		//		redirectHandler(w, r, "/main", "You are already logged in")
	}

	// Check if redirected from other pages or not
	messageCookie, err := r.Cookie(MESSAGE_COOKIE_NAME)
	if err == nil {
		fmt.Println("error is :", messageCookie.Value)
	}
	if r.Method == "POST" {
		var rgData RegisterJsonData
		err := json.NewDecoder(r.Body).Decode(&rgData)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		// Register the user in the database
		dt := time.Now()
		password, errPwd := security.HashPwd([]byte(rgData.Password), 8)
		if errPwd != nil {
			fmt.Errorf(errPwd.Error())
		}
		_, err = db.InsertData("users", rgData.NickName, rgData.FistName, rgData.LastName, rgData.Gender, rgData.Bd, rgData.Email, password, dt.Format("01-02-2006 15:04:05"))
		if err != nil {
			fmt.Println("error reg", err)
		}
		// Redirect to the login page upon successful registration
		redirectHandler(w, r, "/login", "Your account has been created")

		//response success
		responseData := map[string]string{"status": "success"}
		json.NewEncoder(w).Encode(responseData)

	}

}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func Blamer(w http.ResponseWriter, r *http.Request) {
	fmt.Println("blamer")
	nickname, err := sessions.Check(w, r)
	if err != nil {

	} else if nickname != "" {

	}
	msg := ""
	messageCookie, err := r.Cookie(MESSAGE_COOKIE_NAME)
	if err == nil {
		msg = messageCookie.Value
		fmt.Println("msg", msg)

	}

	if r.Method == "POST" {
		var post PostJsonData
		err := json.NewDecoder(r.Body).Decode(&post)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		// insert post into database
		err = insertPostToDB(nickname, post.Title, post.Content, post.AllTopics)
		if err != nil {
			fmt.Println("error reg", err)
		}
		// Redirect to the login page upon successful registration
		redirectHandler(w, r, "/login", "Your account has been created")

		//response success
		responseData := map[string]string{"status": "success"}
		json.NewEncoder(w).Encode(responseData)

	}

	// Call the GetMainDataStruct function to get the data
	mainData, err := GetMainDataStruct(r, nickname)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Marshal the MainData struct into a JSON string
	websocketEndpoint(w, r, mainData)
	/* 	jsonData, err := json.Marshal(mainData)
	   	if err != nil {
	   		http.Error(w, err.Error(), http.StatusInternalServerError)
	   		return
	   	}
	   	json.Unmarshal(jsonData, &mainData)

	   	// Set the content type of the response to JSON
	   	w.Header().Set("Content-Type", "application/json")
	   	// Send the JSON string in the response body
	   	w.Write(jsonData) */

}
func websocketEndpoint(w http.ResponseWriter, r *http.Request, mainData MainData) {
	fmt.Println("websocketEndpoint")
	// upgrade the connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	// encode the data as a JSON string
	jsonData, err := json.Marshal(mainData)
	if err != nil {
		log.Println(err)
		return
	}

	// send the JSON string to the client
	err = conn.WriteMessage(websocket.TextMessage, jsonData)
	if err != nil {
		log.Println(err)
		return
	}

}
func Profile(w http.ResponseWriter, r *http.Request) {
	// Check for logged-in session cookie, renew / update if found, return username if found
	activeUsername, err := sessions.Check(w, r)
	if err != nil {
		// Redirect to login page if CheckSessions returns an error
		redirectHandler(w, r, "/login", err.Error()+": please try logging in or registering")
	} else if activeUsername == "" {
		activeUsername = "guest"
	}
	if r.Method == "POST" && activeUsername == "guest" {
		redirectHandler(w, r, "/", "You must be logged in to post")
		return
	}

	// Handle Logout POST request
	if r.Method == "POST" && r.PostFormValue("Logout") == "Logout" {
		// Perform cookies and sessions logout
		sessions.Logout(w, r)
		// Redirect to landing page once logged out
		redirectHandler(w, r, "/", "You have been logged out")
	}

	// Handle GET request and render profile page
	//if r.Method == "GET" {
	//	url := r.URL.Query()
	//username := url.Get("Username")
	username := "testUser5"
	// Check if username is valid
	/* 	_, err := getUserId(username)
	if err != nil {
		redirectHandler(w, r, "/main", "User "+username+" does not exist")
		return
	} */
	// Retreive data for profile page
	profilePageData, err := GetProfileDataStruct(r, activeUsername, username)
	if err != nil {
		//SendError(w, r, http.StatusInternalServerError, "Internal Server Error:\n"+err.Error())
		return
	}

	// Marshal the MainData struct into a JSON string
	jsonData, err := json.Marshal(profilePageData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.Unmarshal(jsonData, &profilePageData)

	// Set the content type of the response to JSON
	w.Header().Set("Content-Type", "application/json")

	// Send the JSON string in the response body
	w.Write(jsonData)
	/* } else {
		SendError(w, r, http.StatusMethodNotAllowed, http.StatusText(http.StatusMethodNotAllowed))
		return
	} */

}

func WsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	nickname, err := sessions.Check(w, r)
	if err != nil {

	} else if nickname == "" {

	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Add the WebSocket connection to the clients map
	Clients[nickname] = conn

	defer func() {
		// Remove the WebSocket connection from the clients map
		delete(Clients, nickname)
		conn.Close()
	}()
	// Add new client to clients map
	Clients[nickname] = conn
	// Read messages from the WebSocket connection
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			break
		}
		var messageData MessageData
		fmt.Println("message", string(message), "from", nickname)
		err = json.Unmarshal(message, &messageData)
		if err != nil {
			log.Println(err)
			continue
		}
		messageData.Time = time.Now().Format("2006-01-02 15:04:05")

		// encode the data as a JSON string
		jsonData, err := json.Marshal(messageData)
		if err != nil {
			log.Println(err)
			return
		}

		err = SaveMessage(messageData)
		if err != nil {
			log.Println(errors.New("error saving message"), err)
			continue
		}

		// Broadcast message to receiver
		for cNickname, c := range Clients {
			if cNickname == messageData.Receiver || cNickname == messageData.Sender {
				err = c.WriteMessage(websocket.TextMessage, jsonData)
				if err != nil {
					log.Println(err)
				}
			}
		}
	}

}
