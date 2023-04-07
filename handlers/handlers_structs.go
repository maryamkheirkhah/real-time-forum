package handlers

import "github.com/gorilla/websocket"

var Clients = make(map[string]*websocket.Conn)
var Broadcast = make(chan MessageData)

type StatusData struct {
	Code int
	Msg  string
}

type User struct {
	Username  string
	UserRank  string
	UserEmail string
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
	ActiveUsername  string    `json:"activeUserName"` // Username of user who is currently logged in
	CreatorUsername string    `json:"creatorUsername"`
	Title           string    `json:"title"`         // Title of post
	Topics          []string  `json:"topics"`        // Topics of post
	CreationTime    string    `json:"creationTime"`  // Time post was created
	Content         string    `json:"content"`       // Content of post
	Likes           int       `json:"likes"`         // Total likes
	Dislikes        int       `json:"dislikes"`      // Total dislikes
	LikeStatus      int       `json:"likeStatus"`    // 0 for not liked, 1 for liked, -1 for disliked
	Comments        []Comment `json:"comments"`      // Comments on post
	CookieMessage   string    `json:"cookieMessage"` // Message to be displayed to user if forum-message cookie is set
}
type RegisterJsonData struct {
	NickName  string `json:"nickName"`
	FistName  string `json:"fistName"`
	LastName  string `json:"lastName"`
	Gender    string `json:"gender"`
	Bd        string `json:"birthdate"`
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
	Messages      map[string][]MessageData
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
type MessageData struct {
	Receiver string `json:"receiver"`
	Sender   string `json:"sender"`
	Msg      string `json:"content"`
	Time     string `json:"time"`
}

// TO-DO:
// Fill ProfileData struct
// Main handler filter by topic