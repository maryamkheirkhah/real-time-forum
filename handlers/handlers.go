package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/security"
	"real-time-forum/sessions"
	"strconv"
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
}

func RegisterHandler(w http.ResponseWriter, r *http.Request, message map[string]interface{}) {
	var rgData RegisterJsonData
	userName, exist := sessions.Check(r)
	if !exist {
		// Reload login page if CheckSessions returns an error
		//		renderTemplate(w, r, err.Error()+": please try logging in or registering",
		//			"./frontend/static/login.html")
		fmt.Println("error is : no cookie fuck")
	} else if userName != "" {
		fmt.Println("user is :", userName)
		// Redirect to main page if user is logged in
		//		redirectHandler(w, r, "/main", "You are already logged in")
	}
	jsonData, err := json.Marshal(message)
	if err != nil {
		log.Println("MainData: Failed to marshal JSON:", err)
	}
	buffer := bytes.NewBuffer(jsonData)
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
func LoginHandler(w http.ResponseWriter, r *http.Request, message map[string]interface{}) []byte {
	var data LoginData
	data.NickName = message["loginusername"].(string)
	data.Password = message["loginpassword"].(string)
	user, err := db.SelectDataHandler("users", "NickName", data.NickName)
	var msg string
	if err != nil {
		msg = "User with this nickname does not exist"
		user, err = db.SelectDataHandler("users", "email", data.NickName)
		if err != nil {
			msg = "User with this email does not exist"
			return []byte(msg)

		}
	}
	if !security.MatchPasswords([]byte(data.Password), user.(db.User).Pass) {
		fmt.Println("login: error: password does not match")
	} else {
		sessionId, err := sessions.CreateSession(w, user.(db.User).NickName)
		fmt.Println("w", w)
		if err != nil {
			fmt.Println("error in create session", err.Error())
			return nil
		}
		response := map[string]string{"nickname": user.(db.User).NickName, "sessionId": sessionId}
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
func MainDataHandler(w http.ResponseWriter, r *http.Request, nickname string) []byte {
	mainData, err := GetMainDataStruct(r, nickname)
	if err != nil {
		fmt.Println("error in get main data struct", err.Error())
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		return nil
	}
	jsonData, err := json.Marshal(mainData)
	if err != nil {
		fmt.Println("error in marshal", err.Error())
		//log.Println("MainData: Failed to marshal JSON:", err)
	}
	return jsonData

}
func CreatePostHandler(w http.ResponseWriter, r *http.Request, message map[string]interface{}, nickname string) {
	if nickname != "" {
		var post PostJsonData
		post.Title = message["Title"].(string)
		post.Content = message["Content"].(string)
		post.AllTopics = message["Topics"].(string)
		err := insertPostToDB(nickname, post.Title, post.Content, post.AllTopics)
		if err != nil {
			fmt.Errorf("error in insert post to db %s", err.Error())
			return
		}
		redirectHandler(w, r, "/", "Post created")
		responseData := map[string]string{"status": "success"}
		json.NewEncoder(w).Encode(responseData)
		return
	}
	return
}

var newProfile string

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
	Clients[nickname] = conn

	client := NewClient(SocketHub, conn)
	SocketHub.register <- client
	/* 	defer func() {
		SocketHub.unregister <- client
		conn.Close()
	}() */
	/* go client.SendMessage([]byte("ping"))
	go client.Read() */
	//go func() {

	for {
		err = conn.WriteMessage(websocket.PingMessage, []byte{})
		if err != nil {
			log.Println("WebSocket connection closed:", err)
			break
		}
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Failed to read message from WebSocket:", err)
			break
		}
		var data MessageData
		err = json.Unmarshal(message, &data)
		if err != nil {
			fmt.Println("error in unmarshaling", err.Error())
		}
		fmt.Println("data", data)
		switch data.MessageType {
		case "login":
			client.SendMessage(LoginHandler(w, r, data.Message))
		case "register":
			RegisterHandler(w, r, data.Message)
		case "mainData":
			client.SendMessage(MainDataHandler(w, r, nickname))
		case "blameP":
			CreatePostHandler(w, r, data.Message, nickname)
		case "blameC":
			content := data.Message["Content"]
			id, err := strconv.Atoi(data.Message["PostId"].(string))
			if err != nil {
				// ... handle error
				fmt.Println("error in converting string to int", err.Error())
			}
			insertComment(nickname, id, content.(string))
		//chatHandle(w, r, conn)
		case "content":
			id, err := strconv.Atoi(data.Message["id"].(string))
			if err != nil {
				// ... handle error
				fmt.Println("error in converting string to int", err.Error())
			}
			client.SendMessage(contentHandler(r, nickname, id))
			break
		case "profile":
			newProfile = data.Message["nickname"].(string)
		case "getProfile":
			fmt.Println("getProfile", newProfile)
			client.SendMessage(profileHandler(r, nickname, newProfile))
		case "reaction":
			reactionHandler(nickname, data.Message["Reaction"].(float64), data.Message["PostId"].(string))
		default:
			fmt.Println("default")
		}
		//(break
	}

}
func reactionHandler(nickname string, Reaction float64, postId string) {
	//adding or something
	/* 	id := int(postId)*/
	reaction := int(Reaction)

	id, err := strconv.Atoi(postId)
	if err != nil {
		// ... handle error
		fmt.Println("error in converting string to int", err.Error())
	}
	if reaction == 1 {
		err := insertReaction(nickname, id, -1, "like")
		if err != nil {
			fmt.Println("error in insert reaction", err.Error())
			return
		}
	} else if reaction == -1 {
		err := insertReaction(nickname, id, -1, "dislike")
		if err != nil {
			fmt.Println("error in insert reaction", err.Error())
			return
		}
	}
}
func profileHandler(r *http.Request, activeNickname string, nickname string) []byte {
	profilePageData, err := GetProfileDataStruct(r, activeNickname, nickname)
	if err != nil {
		//SendError(w, r, http.StatusInternalServerError, "Internal Server Error:\n"+err.Error())
		return nil
	}

	// Marshal the profile struct into a JSON string
	jsonData, err := json.Marshal(profilePageData)
	if err != nil {
		fmt.Println("error in marshal", err.Error())
		return nil
	}
	return jsonData
}
func contentHandler(r *http.Request, nickname string, postId int) []byte {
	fmt.Println("content handler")
	ContentData, err := GetContentDataStruct(r, nickname, postId)
	if err != nil {
		fmt.Println(err.Error(), http.StatusInternalServerError)
		return nil
	}
	jsonData, err := json.Marshal(ContentData)
	if err != nil {
		log.Println("MainData: Failed to marshal JSON:", err)
	}
	return jsonData
}

func WsHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	nickname, exist := sessions.Check(r)
	if !exist {

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
	// Read messages from the WebSocket connection
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			break
		}
		var messageData ChatData
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
