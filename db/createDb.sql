/*
Database creation file.
usage: sqlite3 name.db < createDb.sql
*/
CREATE TABLE users(
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    userName TEXT NOT NULL,
    email TEXT NOT NULL,
    pass TEXT NOT NULL,
    creationTime TEXT NOT NULL
);

CREATE TABLE posts(
    postId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    creationTime TEXT NOT NULL, 
    FOREIGN KEY(userId) REFERENCES users(userId)
);

CREATE TABLE comments(
    commentId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    postId INTEGER NOT NULL,
    content TEXT NOT NULL,
    creationTime TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(userId),
    FOREIGN KEY(postId) REFERENCES posts(postId)
);

CREATE TABLE reactions(
    reactionId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    postId INTEGER NOT NULL,
    commentId INTEGER DEFAULT -1,
    reaction TEXT NOT NULL, 
    FOREIGN KEY(userId) REFERENCES users(userId),
    FOREIGN KEY(postId) REFERENCES posts(postId),
    FOREIGN KEY(commentId) REFERENCES comments(commentId)
);

CREATE TABLE topics(
    topicId INTEGER PRIMARY KEY AUTOINCREMENT,
    topicName TEXT NOT NULL
);

CREATE TABLE PostTopics(
    postId INTEGER NOT NULL,
    topicId INTEGER NOT NULL,
    FOREIGN KEY(postId) REFERENCES posts(postId),
    FOREIGN KEY(topicId) REFERENCES topics(topicId)
);

CREATE TABLE messages(
    messageId INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER NOT NULL,
    receiverId INTEGER NOT NULL,
    messageContent TEXT NOT NULL,
    sendTime TEXT NOT NULL, 
    FOREIGN KEY(senderId) REFERENCES users(userId)
    FOREIGN KEY(reciverId) REFERENCES users(userId)
);