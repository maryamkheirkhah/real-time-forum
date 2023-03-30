package db

type User struct {
	// not sure about userId!
	UserId   int
	Username string
	Pass     string
	Email    string
	Time     string
}
type Post struct {
	PostId       int
	UserId       int
	Title        string
	Content      string
	CreationTime string
}

// for testing
type PostTopic struct {
	PostId  int
	TopicId int
}
type Comment struct {
	CommentId int
	UserId    int
	PostId    int
	Content   string
	Time      string
}
type Reaction struct {
	ReactionId int
	UserId     int
	PostId     int
	CommentId  int
	Reaction   string
}

type Colours struct {
	Reset      string // Resets terminal colour to default after 'text colouring'
	Red        string
	LightRed   string
	Green      string
	LightGreen string
	Blue       string
	LightBlue  string
	Orange     string
	Yellow     string
}
type Message struct {
	MessageId  int
	SenderId   int
	ReceiverId int
	Message    string
	SendTime   string
}
