package main

import (
	"real-time-forum/db"
	"real-time-forum/server"
)

func main() {
	// Perform database check, initialise if not found
	db.Check("./db/forum.db", "./db/createDb.sql")

	server.StartServer()

}
