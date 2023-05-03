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
	//http.HandleFunc("/profile", handlers.Profile)
	http.HandleFunc("/api/chat", handlers.WsHandler)

	http.HandleFunc("/api/data-route", handlers.DataRoute)
	// Serve static assets at "/static/*"
	http.Handle("/static/", http.StripPrefix("/static/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fileServer.ServeHTTP(w, r)
	})))

	fmt.Println("server started on port 8080")
	// Start the server on port 8080
	/* 	go func() {
		for {
			fmt.Println("delete sessions", sessions.ActiveSessions)
			if len(sessions.ActiveSessions.Data) == 0 {
				continue
			}
			sessions.ActiveSessions.CleanUpInactiveSessions(60 * 60) // 1 hour
			fmt.Println("after delete sessions", sessions.ActiveSessions)
		}
	}() */
	http.ListenAndServe(":8080", nil)
}
