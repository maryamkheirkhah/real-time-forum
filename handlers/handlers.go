package handlers

import (
	"bytes"
	"encoding/json"
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

func Profile(w http.ResponseWriter, r *http.Request) {
	// Check for logged-in session cookie, renew / update if found, return username if found
	activeNickname, exist := sessions.Check(r)
	if !exist {
		fmt.Println("no fucking cookie")
		// Redirect to login page if CheckSessions returns an error
		//redirectHandler(w, r, "/login", err.Error()+": please try logging in or registering")
	} else if activeNickname == "" {
		activeNickname = "guest"
	}
	if r.Method == "POST" && activeNickname == "guest" {
		redirectHandler(w, r, "/", "You must be logged in to post")
		return
	}

	// Handle Logout POST request
	if r.Method == "POST" && r.PostFormValue("Logout") == "Logout" {
		// Perform cookies and sessions logout
		//sessions.Logout(w, r)
		// Redirect to landing page once logged out
		err := sessions.DeleteSession(w, activeNickname)
		if err != nil {
			fmt.Println("err in logout", err.Error())
		}
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
	profilePageData, err := GetProfileDataStruct(r, activeNickname, username)
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
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Failed to upgrade connection to WebSocket:", err)
		return
	}

	client := NewClient(SocketHub, conn)
	SocketHub.register <- client

	go client.Read()
	go client.Write()
}

func RegisterHandler(w http.ResponseWriter, r *http.Request, message []byte) {
	var rgData RegisterJsonData
	userName, err := sessions.Check(r)
	if !err {
		// Reload login page if CheckSessions returns an error
		//		renderTemplate(w, r, err.Error()+": please try logging in or registering",
		//			"./frontend/static/login.html")
		fmt.Println("error is : no cookie fuck")
	} else if userName != "" {
		fmt.Println("user is :", userName)
		// Redirect to main page if user is logged in
		//		redirectHandler(w, r, "/main", "You are already logged in")
	}

	buffer := bytes.NewBuffer(message)
	decoder := json.NewDecoder(buffer)
	if err := decoder.Decode(&rgData); err != nil {
		log.Println("Failed to unmarshal JSON:", err)
		http.Error(w, "Failed to unmarshal JSON", http.StatusBadRequest)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	dt := time.Now()
	password, errPwd := security.HashPwd([]byte(rgData.Password), 8)
	if errPwd != nil {
		fmt.Errorf(errPwd.Error())
	}
	_, inserterr := db.InsertData("users", rgData.NickName, rgData.FistName, rgData.LastName, rgData.Gender, rgData.Bd, rgData.Email, password, dt.Format("01-02-2006 15:04:05"))
	if inserterr != nil {
		fmt.Println("error reg", err)
	}
	// Redirect to the login page upon successful registration
	redirectHandler(w, r, "/login", "Your account has been created")

	//response success
	responseData := map[string]string{"status": "success"}
	json.NewEncoder(w).Encode(responseData)

}
func LoginHandler(w http.ResponseWriter, r *http.Request, message []byte) []byte {
	var data LoginData

	err := json.Unmarshal(message, &data)
	if err != nil {
		fmt.Println("login: error in unmarshaling", err.Error())
		return nil
	}

	user, err := db.SelectDataHandler("users", "NickName", data.NickName)
	var msg string
	if err != nil {
		msg = "User does not exist"
		fmt.Println("login: error:", msg)
		return nil
	} else if !security.MatchPasswords([]byte(data.Password), user.(db.User).Pass) {
		fmt.Println("login: error: password does not match")
	} else {
		sessionId, err := sessions.CreateSession(w, data.NickName)
		fmt.Println("w", w)
		if err != nil {
			fmt.Println("error in create session", err.Error())
			return nil
		}
		response := map[string]string{"nickname": data.NickName, "sessionId": sessionId}
		responseData, err := json.Marshal(response)
		if err != nil {
			fmt.Println("error in marshal", err.Error())
			return nil
		}
		redirectHandler(w, r, "/", "You are successfully logged in")
		return responseData
	}
	return nil
}
func MainDataHandler(w http.ResponseWriter, r *http.Request, message []byte, nickname string) []byte {
	if string(message) == "I want to get main data" {
		mainData, err := GetMainDataStruct(r, nickname)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}
		jsonData, err := json.Marshal(mainData)
		if err != nil {
			log.Println("MainData: Failed to marshal JSON:", err)
		}
		return jsonData
	} else {
		return nil
	}
}
func CreatePostHandler(w http.ResponseWriter, r *http.Request, message []byte, nickname string) {
	if nickname != "" {
		var post PostJsonData
		err := json.Unmarshal(message, &post)
		if err != nil {
			fmt.Println("create post: error in unmarshaling", err.Error())
			return
		}
		err = insertPostToDB(nickname, post.Title, post.Content, post.AllTopics)
		if err != nil {
			fmt.Println("error in insert post to db", err.Error())
			return
		}
		redirectHandler(w, r, "/", "Post created")
		responseData := map[string]string{"status": "success"}
		json.NewEncoder(w).Encode(responseData)
		return
	}
	return
}

/*
	 func CreateCommentHandler(w http.ResponseWriter, r *http.Request, message []byte, nickname string) []byte {
		if nickname != "" {
			return byte("comment created")
		}
		return nil
	}
*/
func DataRoute(w http.ResponseWriter, r *http.Request) {
	nickname, exist := sessions.Check(r)
	if !exist {

	} else if nickname != "" {

	}
	msg := ""
	messageCookie, err := r.Cookie(MESSAGE_COOKIE_NAME)
	if err == nil {
		msg = messageCookie.Value
		fmt.Println("msg", msg)

	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Failed to upgrade connection to WebSocket:", err)
		return
	}

	client := NewClient(SocketHub, conn)
	SocketHub.register <- client

	index := 0
	var goTo = ""
	for {
		fmt.Println("index is :", index, "goTo is :", goTo)
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Failed to read message from WebSocket:", err)
			break
		}
		if index == 0 {
			goTo = string(message)
		}
		if index == 1 {
			fmt.Println("what is goTo", goTo)
			switch goTo {
			case "login-start":
				client.SendMessage(LoginHandler(w, r, message))
			case "register-start":
				RegisterHandler(w, r, message)
			case "mainData-start":
				client.SendMessage(MainDataHandler(w, r, message, nickname))
			case "createPost-start":
				CreatePostHandler(w, r, message, nickname)
				/* case "createCommnet-start":
				CreateCommentHandler(w, r, message, nickname) */
			}
			break
		}
		index++

	}
}

func WsDataHandler(w http.ResponseWriter, r *http.Request, conn *websocket.Conn) ([]byte, error) {
	// Upgrade the HTTP connection to a WebSocket connection
	nickname, exist := sessions.Check(r)
	if !exist {

	} else if nickname == "" {

	}

	// Read messages from the WebSocket connection
	data, err := readData(conn)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	/* 	defer func() {
		// Remove the WebSocket connection from the clients map
		delete(Clients, nickname)
		conn.Close()
	}() */
	return data, nil
}
func responseConn(response any, conn *websocket.Conn) error {
	responseBytes, err := json.Marshal("received")
	if err != nil {
		log.Println(err)
		return err
	}
	err = conn.WriteMessage(websocket.TextMessage, responseBytes)
	if err != nil {
		log.Println(err)
		return err
	}
	defer func() {
		// Remove the WebSocket connection from the clients map
		conn.Close()
	}()
	return nil
}
func readData(conn *websocket.Conn) ([]byte, error) {
	_, message, err := conn.ReadMessage()
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer func() {
		// Remove the WebSocket connection from the clients map
		conn.Close()
	}()
	return message, nil
}

/* func startConn(w http.ResponseWriter, r *http.Request, nickname string) (*websocket.Conn, error) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	// Add the WebSocket connection to the clients map
	Clients[nickname] = conn
	defer func() {
		// Remove the WebSocket connection from the clients map
		delete(Clients, nickname)
		conn.Close()
	}()
	return conn, nil
} */

// Adi Dont need

/* func Register(w http.ResponseWriter, r *http.Request) {
	userName, err := sessions.Check(r)
	if !err {
		// Reload login page if CheckSessions returns an error
		//		renderTemplate(w, r, err.Error()+": please try logging in or registering",
		//			"./frontend/static/login.html")
		fmt.Println("error is : no cookie fuck")
	} else if userName != "" {
		fmt.Println("user is :", userName)
		// Redirect to main page if user is logged in
		//		redirectHandler(w, r, "/main", "You are already logged in")
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

func Login(w http.ResponseWriter, r *http.Request) {
	var data LoginData
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Failed to upgrade connection to WebSocket:", err)
		return
	}

	// Create a new client for the WebSocket connection
	client := NewClient(SocketHub, conn)

	// Register the client with the hub
	SocketHub.register <- client

	// Start reading messages from the client

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Failed to read message from client:", err)
			break
		}
		err = json.Unmarshal(message, &data)
		if err != nil {
			fmt.Println("error:", err.Error())
			break
		}
		fmt.Println("data message:", data)

		user, err := db.SelectDataHandler("users", "NickName", data.NickName)
		var msg string
		if err != nil {
			msg = "The user doesn't exist"
			fmt.Println("error:", msg)
			break
			//	responseData := map[string]string{"nickname": "wrong"}
			 //  		json.NewEncoder(w).Encode(responseData)
					   } else if !security.MatchPasswords([]byte(data.Password), user.(db.User).Pass) {
						fmt.Println("The password is incorrect")
						//		responseData := map[string]string{"nickname": ""}
						//		   json.NewEncoder(w).Encode(responseData)
					} else {
						sessionId, err := sessions.CreateSession(w, data.NickName)
						fmt.Println("w", w)
						if err != nil {
							fmt.Println("error in create session", err.Error())
							break
						}
						response := map[string]string{"nickname": data.NickName, "sessionId": sessionId}
						responseData, err := json.Marshal(response)
						if err != nil {
							fmt.Println("error in marshal", err.Error())
							break
						}
						client.SendMessage(responseData)
						redirectHandler(w, r, "/", "You are successfully logged in")
						break
					}
				}
				// Unregister the client from the hub
				SocketHub.unregister <- client
			}

func Blamer(w http.ResponseWriter, r *http.Request) {
	nickname, exist := sessions.Check(r)
	if !exist {

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
*/
