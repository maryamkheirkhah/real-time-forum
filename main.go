package main

import (
	"fmt"
	"real-time-forum/db"
	"real-time-forum/server"
	"real-time-forum/sessions"
)

func main() {
	// Perform database check, initialise if not found
	db.Check("./db/forum.db", "./db/createDb.sql")

	// Initialise sessions struct, and start go-routine for periodic sessions cleanup
	//sessions.ActiveSessions.Initialise()
	//	go sessions.CleanUpRoutine()
	fmt.Println("sesstions:", sessions.ActiveSessions)

	server.StartServer()

}
