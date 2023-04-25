package handlers

import "github.com/gorilla/websocket"

var Clients = make(map[string]*websocket.Conn)
var Broadcast = make(chan MessageData)

type StatusData struct {
	Code int
	Msg  string
}

type MessageData struct {
	Message     map[string]interface{} `json:"message"`
	MessageType string                 `json:"type"`
}
type User struct {
	Username  string
	FirstName string
	LastName  string
	Birthday  string
	Gender    string
	Email     string
}
type LoginData struct {
	NickName string `json:"loginusername"`
	Password string `json:"loginpassword"`
}
type Summary struct {
	Title        string // Title of post
	Id           int    // ID of post / comment
	CreationTime string // Time post / like / dislike / comment was created
	Message      string
}

type Post struct {
	PostId        int
	Username      string
	CreationTime  string
	Title         string
	Content       string
	Topics        []string
	Likes         int // Total likes
	Dislikes      int // Total dislikes
	TotalComments int // Total comments
}

type Events struct {
	Time      string // Time of event
	Username  string // Username of user who performed the action
	Action    string // Created Post, Liked Post, Disliked Post, Commented on Post
	PostTitle string // Title of post that was acted upon
}

type Comment struct {
	CommentId    int    // Comment ID
	PostId       int    // ID of post that comment belongs to
	Username     string // Username of user who created comment
	Content      string // Comment content
	CreationTime string // Time comment was created
	Likes        int    // Total likes
	Dislikes     int    // Total dislikes
	LikeStatus   int    // Comment-specific "like status" of logged in user (0 for not liked, 1 for liked, -1 for dislike)
}

type RegisterData struct {
	Username      string
	Email         string
	CookieMessage string // Message to be displayed to user if forum-message cookie is set
}

type ProfileData struct {
	ActiveUsername string
	UserInfo       User
	Timeline       []Events // *** NOT USED RIGHT NOW *** Sort in order of each event's Time field, most recent to oldest
	LikedPosts     []Summary
	DislikedPosts  []Summary
	CreatedPosts   []Summary
	CookieMessage  string // Message to be displayed to user if forum-message cookie is set
}

type ContentData struct {
	Likes      int       `json:"likes"`      // Total likes
	Dislikes   int       `json:"dislikes"`   // Total dislikes
	LikeStatus int       `json:"likeStatus"` // 0 for not liked, 1 for liked, -1 for disliked
	Comments   []Comment `json:"comments"`   // Comments on post
}
type RegisterJsonData struct {
	NickName  string `json:"nickName"`
	FistName  string `json:"firstName"`
	LastName  string `json:"lastName"`
	Gender    string `json:"gender"`
	Bd        string `json:"birthday"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	CPassword string `json:"cpassword"`
}

type MainData struct {
	NickName      string   // Username of user or "guest"
	Posts         []Post   // Posts to be displayed could be all posts or posts from a specific topic
	Topics        []string // All topics
	CookieMessage string   // Message to be displayed to user if forum-message cookie is set
	UserNicknames []string `json:"users"`
	Messages      map[string][]ChatData
}
type PostData struct {
	Username      string
	AllTopics     []string
	CookieMessage string // Message to be displayed to user if forum-message cookie is set
}
type PostJsonData struct {
	Title     string `json:"Title"`
	AllTopics string `json:"Topics"`
	Content   string `json:"Content"`
}
type ChatData struct {
	Receiver string `json:"receiver"`
	Sender   string `json:"sender"`
	Msg      string `json:"content"`
	Time     string `json:"time"`
	Seen     int    `json:"seen"`
}
type AllChats struct {
	Chats       map[string][]ChatData
	onlineUsers []string
}
