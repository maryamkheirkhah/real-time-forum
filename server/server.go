package server

import (
	"fmt"
	"net/http"
	"real-time-forum/handlers"
	"real-time-forum/sessions"
	"time"
)

func StartServer() {
	// Set up a file server to serve static assets (e.g. HTML, CSS, JS)
	fileServer := http.FileServer(http.Dir("./static"))
	go handlers.SocketHub.Run()

	// Handle requests to the root URL ("/") by serving the index.html file
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/index.html")
	})
	//http.HandleFunc("/profile", handlers.Profile)
	http.HandleFunc("/api/chat", handlers.WsHandler)

	http.HandleFunc("/api/data-route", handlers.DataRoute)
	// Serve static assets at "/static/*"
	http.Handle("/static/", http.StripPrefix("/static/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fileServer.ServeHTTP(w, r)
	})))

	fmt.Println("server started on port 8080")
	// Start the server on port 8080
	http.ListenAndServe(":8080", nil)

	sessions.ActiveSessions.CleanUpInactiveSessions(0 * time.Minute)
}
