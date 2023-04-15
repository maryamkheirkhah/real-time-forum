package server

import (
	"fmt"
	"net/http"
	"real-time-forum/handlers"
)

func StartServer() {
	// Set up a file server to serve static assets (e.g. HTML, CSS, JS)
	fileServer := http.FileServer(http.Dir("./static"))
	go handlers.SocketHub.Run()

	// Handle requests to the root URL ("/") by serving the index.html file
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/index.html")
	})
	// test
	//http.HandleFunc("/login", handlers.Login)
	http.HandleFunc("/register", handlers.Register)
	http.HandleFunc("/api/registerData", handlers.Register)
	http.HandleFunc("/api/loginData", handlers.Login)
	http.HandleFunc("/blamer", handlers.Blamer)
	http.HandleFunc("/profile", handlers.Profile)
	http.HandleFunc("/ws", handlers.WebSocketHandler)
	// Serve static assets at "/static/*"
	http.Handle("/static/", http.StripPrefix("/static/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fileServer.ServeHTTP(w, r)
	})))

	fmt.Println("server started on port 8080")
	// Start the server on port 8080
	http.ListenAndServe(":8080", nil)
}
