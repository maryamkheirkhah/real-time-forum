package server

import (
	"fmt"
	"net/http"
	"real-time-forum/handlers"
	"strings"
)

func StartServer() {
	// Set up a file server to serve static assets (e.g. HTML, CSS, JS)
	fileServer := http.FileServer(http.Dir("./static"))

	// Handle requests to the root URL ("/") by serving the index.html file
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/index.html")
	})
	// test
	http.HandleFunc("/login", handlers.Login)
	http.HandleFunc("/register", handlers.Register)
	http.HandleFunc("/blamer", handlers.Blamer)
	http.HandleFunc("/profile", handlers.Profile)
	// Serve static assets at "/static/*"
	http.Handle("/static/", http.StripPrefix("/static/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set the Content-Type header to "text/javascript" for JavaScript module files
		if strings.HasSuffix(r.URL.Path, ".js") {
			w.Header().Set("Content-Type", "application/javascript")
		} else if strings.HasSuffix(r.URL.Path, ".css") {
			w.Header().Set("Content-Type", "text/css")
		}
		fileServer.ServeHTTP(w, r)
	})))

	fmt.Println("server started on port 8080")
	// Start the server on port 8080
	http.ListenAndServe(":8080", nil)
}
