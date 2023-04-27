package db

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"

	_ "github.com/mattn/go-sqlite3"
)

var (
	Colour = Colours{
		Reset:    "\033[0m",
		Red:      "\033[31m",
		LightRed: "\033[1;31m",
		Orange:   "\033[0;33m",
		Yellow:   "\033[1;33m",
	}
)

/*
selectData gets the whole query as a string and the arguments as many as desired in any type
since at each table we have a different number of arguments and different types for each column of tables
and returns the specific data rows of table info and error if exist
*/
func selectData(myQuery string, args ...any) (*sql.Rows, error) {
	_, b, _, _ := runtime.Caller(0)
	basepath := filepath.Dir(b)
	database, errOpen := sql.Open("sqlite3", basepath+"/forum.db")
	if errOpen != nil {
		return nil, errOpen
	}
	database.SetMaxOpenConns(1)
	defer database.Close()
	rows, err := database.Query(myQuery, args...)
	if err != nil {
		return nil, err
	}
	return rows, nil
}

/*
SelectDataHandler gets the table name and key of desired data as any type to handle all different
kinds of data. It writes a query based on the table name and the wanted column name of that table.
It calls the select function for that table to get the rows of the table related to the specific data
and returns data in those rows, as well as an error which is non-nil if found or error if data or table does not exist.
*/
func SelectDataHandler(tableName string, keyName string, keyValue any, args ...any) (any, error) {
	myQuery := "SELECT * FROM " + tableName + " WHERE " + keyName + "= ?"
	switch tableName {
	case "users":
		return selectUserHandler(myQuery, keyName, keyValue)
	case "posts":
		return selectPostHandler(myQuery, keyName, keyValue)
	case "topics":
		return selectTopicHandler(myQuery, keyName, keyValue)
	case "comments":
		return selectCommentHandler(myQuery, keyName, keyValue)
	case "PostTopics":
		return selectPostTopicHandler(myQuery, keyName, keyValue)
	case "reactions":
		return selectReactionHandler(keyName, keyValue, args...)
	case "messages":
		return selectMessageHandler(myQuery, keyName, keyValue, args...)
	default:
		return nil, errors.New("table does not exist")
	}
}

/*
NotExistData calls the SelecDataHandler function with a database table name, and key name as input strings,
as well as a key of ny data type. A check is performed as to whether the specified data exists, an an error
value is returned, which is non-nil if the data does not exist.
*/
func NotExistData(tableName string, keyName string, key any, args ...any) error {
	_, err := SelectDataHandler(tableName, keyName, key, args...)
	if err != nil {
		return nil
	}
	return errors.New("data already exist")
}

/*
InsertData gets the table name and the arguments as many as desired in any type to handle all different kinds of data.
it calls the notExistData for checking the existing of this data if its not exist,
it writes a query base on the table name and the arguments of that table. insert new data to the table.
and returns error if exist.
*/
func InsertData(tableName string, args ...any) (int64, error) {
	var myQuery string
	var id int64
	switch tableName {
	case "users":
		err := NotExistData("users", "NickName", args[0])
		if err != nil {
			return -1, errors.New("username already exist")
		}
		myQuery = "INSERT INTO users(NickName,firstName,lastName,gender,birthDate, email, pass, creationTime) VALUES(?,?,?,?,?,?,?,?)"

	case "posts":
		err := NotExistData("users", "userId", args[0])
		if err == nil {
			return -1, errors.New("user does not exist")
		}
		myQuery = "INSERT INTO posts(userId, title, content, creationTime) VALUES(?,?,?,?)"
	case "topics":
		errTopic := NotExistData("topics", "topicName", args[0])
		if errTopic != nil {
			return -1, errors.New("topic already exist")
		}
		myQuery = "INSERT INTO topics(topicName) VALUES(?)"
	case "comments":
		//check user existence
		err := NotExistData("users", "userId", args[0])
		if err == nil {
			return -1, errors.New("user does not exist")
		}
		//check post existence
		err = NotExistData("posts", "postId", args[1])
		if err == nil {
			return -1, errors.New("post does not exist")
		}
		myQuery = "INSERT INTO comments(userId, postId, content, creationTime) VALUES(?,?,?,?)"
	case "reactions":
		var errReact error
		myQuery, errReact = insertReactionHandler(args...)
		// fmt.Println("myQuery", myQuery)
		if myQuery == "" {
			return -1, errReact
		}
	case "PostTopics":
		err := NotExistData("posts", "postId", args[0])
		if err == nil {
			return -1, errors.New("post does not exist")
		}
		err = NotExistData("topics", "topicId", args[1])
		if err == nil {
			return -1, errors.New("topic does not exist")
		}
		myQuery = "INSERT INTO PostTopics(postId, topicId) VALUES(?,?)"
	case "messages":
		//check sender existence
		err := NotExistData("users", "userId", args[0])
		if err == nil {
			return -1, errors.New("sender user does not exist")
		}
		//check ricever existence
		err = NotExistData("users", "userId", args[1])
		if err == nil {
			return -1, errors.New("receiverId user does not exist")
		}
		myQuery = "INSERT INTO messages(senderId, receiverId, messageContent, sendTime) VALUES(?,?,?,?)"
	}

	// for founding the current location
	_, b, _, _ := runtime.Caller(0)
	basepath := filepath.Dir(b)
	database, errOpen := sql.Open("sqlite3", basepath+"/forum.db")
	if errOpen != nil {
		log.Fatal(errOpen)
	}
	database.SetMaxOpenConns(1)
	defer database.Close()
	statement, err := database.Prepare(myQuery)
	if err != nil {
		return -1, err
	}
	defer statement.Close()
	// fmt.Println("args", args)
	res, err := statement.Exec(args...)
	// id is the value of primery key of the data we insert we need it in some cases (e.g insert post)
	if err != nil {
		return -1, err
	}
	id, err = res.LastInsertId()
	if err != nil {
		return -1, err
	}
	return id, nil
}
func updateSeenMessage(messageId int) error {
	db, err := sql.Open("sqlite3", "forum.db")
	if err != nil {
		return err
	}
	defer db.Close()
	query := "UPDATE messages SET seen=1 WHERE messageId=?"
	_, err = db.Exec(query, messageId)
	if err != nil {
		return err
	}
	return nil
}

/*
UpdateData get the table name as a string to identify which type of data is going to update
finding it in case of user want to change its username and other user's info
if user doesn't exist or any other problem return error
*/

func UpdateData(table string, key string, args ...any) error { //// should be update
	/* if CheckUserName(user.Username) {
		return errors.New("username already taken")
	} */
	_, b, _, _ := runtime.Caller(0)
	basepath := filepath.Dir(b)
	database, errOpen := sql.Open("sqlite3", basepath+"/forum.db")
	if errOpen != nil {
		return errOpen
	}
	defer database.Close()
	var myQuery string
	switch table {
	case "users":
		myQuery = "UPDATE users SET NickName=?,fisrtName=?,lastName=?,gender=?,birthDate=?, email=?, pass=? where NickName=?"
	}
	statement, err := database.Prepare(myQuery)
	if err != nil {
		return err
	}
	defer statement.Close()
	res, err := statement.Exec(args, key)
	if err != nil {
		return err
	}
	affect, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if affect == 0 {
		return errors.New("user not found")
	}
	return nil
}

/*
selectUserHandler called in SelectDataHandler it gets the query and column name and value for wanted user
this function is specific for selecting user data from user table
it retruns a map with those users with that specific value on columnName and nil error or nil map and non-nil error when its not exist or there are other problem.
*/
func selectUserHandler(myQuery string, keyName string, keyValue any) (any, error) {
	var rows *sql.Rows
	var err error
	if keyName == "" {
		myQuery = "SELECT * FROM users"
		rows, err = selectData(myQuery, keyValue)
	} else {
		rows, err = selectData(myQuery, keyValue)
	}
	if err != nil {
		return nil, errors.New("error in selectUserHandler")
	}
	defer rows.Close()
	users := map[int]User{}
	u := User{}
	for rows.Next() {
		rows.Scan(&u.UserId, &u.NickName, &u.FirstName, &u.LastName, &u.Gender, &u.BirthDate, &u.Email, &u.Pass, &u.Time)
		users[u.UserId] = u
	}
	if u.UserId > 0 {
		if keyName == "" {
			return users, nil
		}
		return u, nil
	} else {
		return nil, errors.New("data doesn't exist")
	}
}

/*
selectCommentHandler called in SelectDataHandler it gets the query and column name and value for wanted comment
this function is specific for selecting comment data from comment table
it retruns a map with those comments for that specific value on columnName and nil error or nil map and non-nil error when its not exist or there are other problem.
*/

func selectCommentHandler(myQuery string, keyName string, keyValue any, args ...any) (any, error) {
	//when we call the function for selecting all comments
	var rows *sql.Rows
	var err error
	if keyName == "" {
		myQuery = "SELECT * FROM comments"
		rows, err = selectData(myQuery, keyValue)

	} else if args != nil {
		myQuery = "SELECT * FROM comments WHERE " + keyName + "= ?" + args[0].(string) + "= ?"
		if args[1] != nil {
			rows, err = selectData(myQuery, keyValue, args[1])
		} else {
			return nil, errors.New("you didn't send the value")
		}
	} else {
		myQuery = "SELECT * FROM comments WHERE " + keyName + "= ?"
		rows, err = selectData(myQuery, keyValue)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	comments := map[int]Comment{}
	comment := Comment{}
	for rows.Next() {
		rows.Scan(&comment.CommentId, &comment.UserId, &comment.PostId, &comment.Content, &comment.Time)
		comments[comment.CommentId] = comment
	}
	if comment.Content != "" {
		return comments, nil
	}
	return nil, errors.New("data doesn't exist")
}

/*
selectPostHandler called in SelectDataHandler it gets the query and column name and value for wanted post
this function is specific for selecting post data from post table
it retruns a map with those posts for that specific value on columnName and nil error or nil map and non-nil error when its not exist or there are other problem.
*/
func selectPostHandler(myQuery string, keyName string, keyValue any) (any, error) {
	//when we call the function for selecting all posts
	if keyName == "" {
		myQuery = "SELECT * FROM posts"
	}
	rows, err := selectData(myQuery, keyValue)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	post := Post{}
	posts := map[int]Post{}
	for rows.Next() {
		rows.Scan(&post.PostId, &post.UserId, &post.Title, &post.Content, &post.CreationTime)
		posts[post.PostId] = post
	}
	if post.Content != "" {
		return posts, nil
	}
	return nil, errors.New("data doesn't exist in posts	table")
}

/*
selectTopicHandler called in SelectDataHandler it gets the query and column name and value for wanted topic
this function is specific for selecting topic data from topic table
it retruns a map with those topics for that specific value on columnName and nil error or nil map and non-nil error when its not exist or there are other problem.
*/
func selectTopicHandler(myQuery string, keyName string, keyValue any) (any, error) {
	// when we call the function for selecting all topics
	if keyName == "" {
		myQuery = "SELECT * FROM topics"
	}
	rows, err := selectData(myQuery, keyValue)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var topicId int
	var topic string
	topics := map[int]string{}
	for rows.Next() {
		rows.Scan(&topicId, &topic)
		topics[topicId] = topic
	}
	if topic != "" {
		return topics, nil
	}
	return nil, errors.New("data doesn't exist in topics table")
}

/*
selectPostTopicHandler called in SelectDataHandler it gets the query and column name and value for wanted post topic
this function is specific for selecting post topic data from post topic table
it retruns a map with those post topics for that specific value on columnName and nil error or nil map and non-nil error when its not exist or there are other problem.
*/
func selectPostTopicHandler(myQuery string, keyName string, keyValue any) (any, error) {
	//when we call the function for selecting all topics
	if keyName == "" {
		myQuery = "SELECT * FROM topics"
	}
	rows, err := selectData(myQuery, keyValue)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	if keyName == "postId" {
		var postId int
		var topicId int
		// make a map the keys are int and values are array of int
		postTopics := make(map[int][]int)
		for rows.Next() {
			rows.Scan(&postId, &topicId)
			postTopics[postId] = append(postTopics[postId], topicId)
		}
		if topicId != 0 {
			return postTopics, nil
		}
	} else if keyName == "topicId" {
		var postId int
		var topicId int
		// make a map the keys are int and values are array of int
		topicPosts := make(map[int][]int)
		for rows.Next() {
			rows.Scan(&postId, &topicId)
			topicPosts[topicId] = append(topicPosts[topicId], postId)
		}
		if postId != 0 {
			return topicPosts, nil
		}
	}
	return nil, errors.New("data doesn't exist in postTopics table")
}

/*
selectMessageHandler called in SelectDataHandler it gets the query and column name and value for wanted message
*/
func selectMessageHandler(myQuery string, keyName string, keyValue any, args ...any) (any, error) {
	//when we call the function for selecting all messages
	if keyName == "" {
		myQuery = "SELECT * FROM messages"
	}
	var rows *sql.Rows
	var err error
	if args != nil {
		myQuery = "SELECT * FROM messages WHERE " + keyName + "=?" + " AND " + args[0].(string) + "=?"
		rows, err = selectData(myQuery, keyValue, args[1])
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		message := Message{}
		for rows.Next() {
			rows.Scan(&message.MessageId, &message.SenderId, &message.ReceiverId, &message.Message, &message.SendTime, &message.Seen)
		}
		if message.Message != "" {
			return message, nil
		}
	} else {
		myQuery = "SELECT * FROM messages WHERE " + keyName + "=?"
		rows, err = selectData(myQuery, keyValue)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	message := Message{}
	messages := map[int]Message{}
	for rows.Next() {
		rows.Scan(&message.MessageId, &message.SenderId, &message.ReceiverId, &message.Message, &message.SendTime, &message.Seen)
		messages[message.MessageId] = message
	}
	if message.Message != "" {
		return messages, nil
	}
	return nil, errors.New("message doesn't exist in messages table")
}

/*
DeleteData takes the table name as a string to identify which type of data to delete and from which table
and id to find that desired item. Then, after checking the existence of data, based on the table name,
it adds the arguments of the table in a query to delete that item.
*/
func DeleteData(tableName string, keyValue any) error {
	var key string

	// Check for relevant table title
	switch tableName {
	case "users":
		key = "NickName"
	case "posts":
		key = "postId"
	case "comments":
		key = "commentId"
	case "topics":
		key = "topicName"
	case "reactions":
		key = "reactionId"
	case "PostTopics":
		key = "postId"

	case "messages":
		key = "messageId"
	default:
		return errors.New("table does not exist")
	}

	// Check if input keyValue is valid
	err := NotExistData(tableName, key, keyValue)
	if err == nil {
		return errors.New("data does not exist")
	}

	// Sourcing filepath / root-directory for "forum" database
	_, b, _, _ := runtime.Caller(0)
	basepath := filepath.Dir(b)
	database, errOpen := sql.Open("sqlite3", basepath+"/forum.db")
	if errOpen != nil {
		return errOpen
	}
	defer database.Close()
	myQuery := "DELETE from " + tableName + " WHERE " + key + "=?"
	statement, PrepareErr := database.Prepare(myQuery)
	if PrepareErr != nil {
		return PrepareErr
	}
	defer statement.Close()

	result, errSt := statement.Exec(keyValue)
	if errSt != nil {
		return errSt
	}
	affect, errRow := result.RowsAffected()
	if errRow != nil {
		return errRow
	}
	if affect == 0 {
		return errors.New("item not found")
	}
	return nil
}

/*
selectReactionHandler takes arguments of query and check existing of user and post/comment after that
if user didn't react to that post/comment it returns error otherwise it returns a map of reactions of that post/comment
it works for both case of 1- all reactions of a post/comment  2-an specific user reaction to a post/comment
*/
func selectReactionHandler(keyName string, keyValue any, args ...any) (any, error) {
	var rows *sql.Rows
	var err error
	var myQuery string
	if args != nil {
		myQuery = "SELECT * FROM reactions  WHERE " + keyName + "=?" + " AND " + args[0].(string) + "=?"
		rows, err = selectData(myQuery, keyValue, args[1])
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		reaction := Reaction{}
		for rows.Next() {
			rows.Scan(&reaction.ReactionId, &reaction.UserId, &reaction.PostId, &reaction.CommentId, &reaction.Reaction)
		}
		if reaction.Reaction != "" {
			return reaction, nil
		}
	} else {
		myQuery = "SELECT * FROM reactions WHERE " + keyName + "=?"
		rows, err = selectData(myQuery, keyValue)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	reaction := Reaction{}
	reactions := map[int]Reaction{}
	for rows.Next() {
		rows.Scan(&reaction.ReactionId, &reaction.UserId, &reaction.PostId, &reaction.CommentId, &reaction.Reaction)
		reactions[reaction.ReactionId] = reaction
	}
	if reaction.Reaction != "" {
		return reactions, nil
	}
	return nil, errors.New("data doesn't exist in reactions table")
}

/*
insertReactionHandler takes arguments of query and check existing of user and post/comment after that
if user already reacted to that post/comment it returns error
otherwise it returns a query for inserting that reaction
*/
func insertReactionHandler(args ...any) (string, error) {

	err := NotExistData("users", "userId", args[0])
	if err == nil {
		return "", errors.New("user does not exist")
	}
	// for post reaction
	if args[1] != -1 {
		err = NotExistData("posts", "postId", args[1])
		if err == nil {
			return "", errors.New("post does not exist")
		}
		err = NotExistData("reactions", "userId", args[0], "postId", args[1])
		if err == nil {
			// fmt.Println("in error = nil", err)
			return "insert into reactions (userId, postId, commentId, reaction) VALUES(?,?,?,?)", nil
		}
		res, err := SelectDataHandler("reactions", "userId", args[0], "postId", args[1])

		// fmt.Println("user id:", args[0], "post id", args[1], "res:", res.(Reaction).Reaction, "args[3]:", args[3])
		if res.(Reaction).Reaction == args[3] {
			err = DeleteData("reactions", res.(Reaction).ReactionId)
			if err != nil {
				return "", errors.New("error in inserReactionHandler => calling DeleteData =>" + err.Error())
			}
			return "", nil
		} else {
			err := updateReaction(args[3], args[0], args[1], args[2])
			if err != nil {
				return "", errors.New("error in inserReactionHandler => calling updateReaction =>" + err.Error())
			}
			return "", nil
		}

		//for comment reaction

	} else if args[2] != -1 {
		err = NotExistData("comments", "commentId", args[2])
		if err == nil {
			return "", errors.New("comment does not exist")
		}
		err = NotExistData("reactions", "userId", args[0], "commentId", args[2])
		if err == nil {
			// fmt.Println("in error = nil", err)
			return "insert into reactions (userId, postId, commentId, reaction) VALUES(?,?,?,?)", nil
		}
		res, err := SelectDataHandler("reactions", "userId", args[0], "commentId", args[2])

		// fmt.Println("user id:", args[0], "comment id", args[2], "res:", res.(Reaction).Reaction, "args[3]:", args[3])
		if res.(Reaction).Reaction == args[3] {
			err = DeleteData("reactions", res.(Reaction).ReactionId)
			if err != nil {
				return "", errors.New("error in inserReactionHandler => calling DeleteData =>" + err.Error())
			}
			return "", nil
		} else {
			// fmt.Println("in else", args[3], args[0], args[1], args[2], "err:", err)
			err := updateReaction(args[3], args[0], args[1], args[2])
			if err != nil {
				return "", errors.New("error in inserReactionHandler => calling updateReaction =>" + err.Error())
			}
			return "", nil
		}
	}
	return "", errors.New("error in insertReactionHandler")
}

/*
updateReaction takes arguments of query and check existing of user and post/comment after that
if user didn't react to that post/comment it returns error
otherwise it updates the reaction of that user to that post/comment
*/
func updateReaction(args ...any) error {
	myQuery := "UPDATE reactions SET reaction=? WHERE userId=? AND postId=? AND commentId=?"
	// fmt.Println("in updateReaction", args, "myQuery:", myQuery)
	_, b, _, _ := runtime.Caller(0)
	basepath := filepath.Dir(b)
	database, errOpen := sql.Open("sqlite3", basepath+"/forum.db")
	if errOpen != nil {
		log.Fatal(errOpen)
	}
	database.SetMaxOpenConns(1)
	defer database.Close()
	statement, err := database.Prepare(myQuery)
	if err != nil {
		return err
	}
	defer statement.Close()
	_, err = statement.Exec(args...)
	if err != nil {
		return err
	}
	return nil
}

/*
Initialise is called in the event that a database needs to be created. It takes the
file path for the desired database, as well as the file path for the sql database
creation file (both as strings), and executes the sql file, piping the queries
directly into the specified database file. An error value is returned, which is
non-nil in the event errors are encountered in opening / creating the database file
or the sql file.
*/
func initialise(databasePathAndName, sqlFilePathAndName string) error {
	// Initialise specified database
	database, err := sql.Open("sqlite3", databasePathAndName)
	if err != nil {
		return err
	}
	defer database.Close()
	// Open sql database creation file
	file, err := os.Open(sqlFilePathAndName)
	if os.IsNotExist(err) {
		return errors.New("database sql creation file ( " +
			sqlFilePathAndName + " ) not found")
	} else {
		// Read the file into a buffer
		buf := make([]byte, 1024)
		var str string
		for {
			n, err := file.Read(buf)
			if err != nil {
				break
			}
			str += string(buf[:n])
		}

		// Execute the SQL
		_, err = database.Exec(str)
		if err != nil {
			return err
		}
	}
	return nil
}

/*
Check is a composite function that checks if the database file exists and if not, initialises it.
It does this by calling the local initialise function. If an error is encountered in the process,
it is logged and the program exits.
*/
func Check(dbFile, sqlFile string) {
	_, err := os.Stat(dbFile)
	if os.IsNotExist(err) {
		// Initialise database if specified input does not already exist
		fmt.Print(Colour.Yellow + "\ndatabase not found, initialising...\n\n" + Colour.Reset)
		err = initialise(dbFile, sqlFile)
		if err != nil {
			log.Fatal(err)
		}
	}
}
