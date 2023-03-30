package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/security"
	"real-time-forum/sessions"
	"time"
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

	// Redirect to the target page
	http.Redirect(w, r, pageName, http.StatusMovedPermanently)
}

func Login(w http.ResponseWriter, r *http.Request) {
	// Check for logged-in session cookie, renew / update if found, return username if found
	userName, err := sessions.Check(w, r)
	if err != nil {
		// Reload login page if CheckSessions returns an error
		//		renderTemplate(w, r, err.Error()+": please try logging in or registering",
		//			"./frontend/static/login.html")
	} else if userName != "" {
		// Redirect to main page if user is logged in
		redirectHandler(w, r, "/", "You are already logged in")
	}

	// Check if redirected from other pages or not
	msg := ""
	messageCookie, err := r.Cookie(MESSAGE_COOKIE_NAME)
	if err == nil {
		msg = messageCookie.Value
	}
	fmt.Println("msg", msg)
	fmt.Println("username", userName)
	if r.Method == "POST" {

		// Get the form values and perform database checks for validity
		username := r.PostFormValue("loginusername")
		password := r.PostFormValue("loginpassword")

		user, err := db.SelectDataHandler("users", "userName", username)
		fmt.Println("user", user)
		if err != nil {
			msg = "The user doesn't exist"
			//	renderTemplate(w, r, msg, "./frontend/static/login.html")
		} else if !security.MatchPasswords([]byte(password), user.(db.User).Pass) {
			//renderTemplate(w, r, "The password is incorrect", "./frontend/static/login.html")
		} else {
			err := sessions.Login(w, r, username) // Get userName from Login post method data
			if err != nil {
				msg = "An error was encountered while logging in. Please try again"
				//	renderTemplate(w, r, msg, "./frontend/static/login.html")
			}

			// Redirect to the main page upon successful login
			fmt.Println("redirecting")
			redirectHandler(w, r, "/", "You are successfully logged in")

		}
	} else if r.Method == "GET" {
		// Display the login page with the message if redirected from other pages
		//renderTemplate(w, r, msg, "./frontend/static/login.html")
	} else {
		//	SendError(w, r, http.StatusMethodNotAllowed, http.StatusText(http.StatusMethodNotAllowed))
	}
	r.URL.Path = "/"
	http.ServeFile(w, r, "./static/index.html")

}

func Register(w http.ResponseWriter, r *http.Request) {
	userName, err := sessions.Check(w, r)
	if err != nil {
		// Reload login page if CheckSessions returns an error
		//		renderTemplate(w, r, err.Error()+": please try logging in or registering",
		//			"./frontend/static/login.html")
	} else if userName != "" {
		// Redirect to main page if user is logged in
		//		redirectHandler(w, r, "/main", "You are already logged in")
	}

	// Check if redirected from other pages or not
	msg := ""
	messageCookie, err := r.Cookie(MESSAGE_COOKIE_NAME)
	if err == nil {
		msg = messageCookie.Value
	}
	fmt.Println("msg", msg)

	//testing
	// Decode JSON data from request body
	var formData RegisterJsonData
	errGet := json.NewDecoder(r.Body).Decode(&formData)
	if errGet != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Handle form data
	log.Println("Name:", formData.NickName)
	log.Println("Email:", formData.Email)

	// Send response
	response := map[string]string{"message": "Form submitted successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	//end testing

	if r.Method == "POST" {
		err := r.ParseMultipartForm(0)

		if err != nil {
			// Handle error
		}
		username := r.PostFormValue("registerusername")
		fname := r.PostFormValue("registerfname")
		lname := r.PostFormValue("registerlname")
		birthdate := r.PostFormValue("registerbirthdate")
		email := r.PostFormValue("registeremail")
		password := r.PostFormValue("registerpassword")
		cpassword := r.PostFormValue("registercpassword")
		user := fmt.Sprint(username, fname, lname, birthdate, email, password, cpassword)
		fmt.Println("user", user)
	}
	r.URL.Path = "/"
	http.ServeFile(w, r, "./static/index.html")

}

func Blamer(w http.ResponseWriter, r *http.Request) {
	userName, err := sessions.Check(w, r)
	if err != nil {
		// Reload login page if CheckSessions returns an error
		//		renderTemplate(w, r, err.Error()+": please try logging in or registering",
		//			"./frontend/static/login.html")
	} else if userName != "" {
		// Redirect to main page if user is logged in
		//		redirectHandler(w, r, "/main", "You are already logged in")
	}

	// Check if redirected from other pages or not
	msg := ""
	messageCookie, err := r.Cookie(MESSAGE_COOKIE_NAME)
	if err == nil {
		msg = messageCookie.Value
	}

	fmt.Println("msg", msg)
	fmt.Println("username", userName)

	// Call the GetMainDataStruct function to get the data
	mainData, err := GetMainDataStruct(r, userName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Marshal the MainData struct into a JSON string
	jsonData, err := json.Marshal(mainData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.Unmarshal(jsonData, &mainData)

	// Set the content type of the response to JSON
	w.Header().Set("Content-Type", "application/json")

	// Send the JSON string in the response body
	w.Write(jsonData)
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
	if r.Method == "GET" {
		url := r.URL.Query()
		username := url.Get("Username")
		// Check if username is valid
		_, err := getUserId(username)
		if err != nil {
			redirectHandler(w, r, "/main", "User "+username+" does not exist")
			return
		}
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

		// Set the content type of the response to JSON
		w.Header().Set("Content-Type", "application/json")

		// Send the JSON string in the response body
		w.Write(jsonData)
	} else {
		SendError(w, r, http.StatusMethodNotAllowed, http.StatusText(http.StatusMethodNotAllowed))
		return
	}

}

/* func sendData(w http.ResponseWriter, r *http.Request) {
	// Call the GetMainDataStruct function to get the data
	mainData, err := GetMainDataStruct(r, "guest")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Marshal the MainData struct into a JSON string
	jsonData, err := json.Marshal(mainData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.Unmarshal(jsonData, &mainData)

	// Set the content type of the response to JSON
	w.Header().Set("Content-Type", "application/json")

	// Send the JSON string in the response body
	w.Write(jsonData)
}
*/
