package handlers

import (
	"fmt"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

var Clients = make(map[string]*websocket.Conn)
var Broadcast = make(chan MessageData)

// hub.go
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mutex      sync.RWMutex
}

var SocketHub = NewHub()
var upgrader = websocket.Upgrader{}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		mutex:      sync.RWMutex{},
	}
}

func (h *Hub) Run() {
	fmt.Println("Starting WebSocket Hub")
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()
		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mutex.Unlock()
		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					fmt.Println("Failed to send message to client in this fucking hub")
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

func NewClient(hub *Hub, conn *websocket.Conn) *Client {
	return &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte),
	}
}

func (c *Client) Read() ([]byte, error) {

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			return nil, err
		}
		return message, nil
	}

}
func (c *Client) Write() {

	for message := range c.send {
		err := c.conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			break
		}
	}
}

func (c *Client) SendMessage(message []byte) {
	if c.conn != nil {
		err := c.conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Failed to send message to client:", err)
			return
		}
	}
}
