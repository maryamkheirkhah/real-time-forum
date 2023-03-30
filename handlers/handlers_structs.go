package handlers

type StatusData struct {
	Code int
	Msg  string
}

type User struct {
	Username  string
	UserRank  string
	UserEmail string
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
type RegisterJsonData struct {
	NickName string
	FistName string
	LastName string
	Bd       string
	Email    string
	Password string
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
	ActiveUsername  string
	CreatorUsername string
	Title           string    // Title of post
	Topics          []string  // Topics of post
	CreationTime    string    // Time post was created
	Content         string    // Content of post
	Likes           int       // Total likes
	Dislikes        int       // Total dislikes
	LikeStatus      int       // 0 for not liked, 1 for liked, -1 for disliked
	Comments        []Comment // Comments on post
	CookieMessage   string    // Message to be displayed to user if forum-message cookie is set
}

type MainData struct {
	Username      string   // Username of user or "guest"
	Posts         []Post   // Posts to be displayed could be all posts or posts from a specific topic
	Topics        []string // All topics
	CookieMessage string   // Message to be displayed to user if forum-message cookie is set
}
type PostData struct {
	Username      string
	AllTopics     []string
	CookieMessage string // Message to be displayed to user if forum-message cookie is set
}

// TO-DO:
// Fill ProfileData struct
// Main handler filter by topic
