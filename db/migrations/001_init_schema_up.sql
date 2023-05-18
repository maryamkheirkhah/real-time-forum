-- +migrate Up

CREATE TABLE IF NOT EXISTS users(
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    NickName TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    gender TEXT NOT NULL,
    birthDate TEXT NOT NULL,
    email TEXT NOT NULL,
    pass TEXT NOT NULL,
    creationTime TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts(
    postId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    creationTime TEXT NOT NULL, 
    FOREIGN KEY(userId) REFERENCES users(userId)
);

CREATE TABLE IF NOT EXISTS comments(
    commentId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    postId INTEGER NOT NULL,
    content TEXT NOT NULL,
    creationTime TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(userId),
    FOREIGN KEY(postId) REFERENCES posts(postId)
);

CREATE TABLE IF NOT EXISTS reactions(
    reactionId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    postId INTEGER NOT NULL,
    commentId INTEGER DEFAULT -1,
    reaction TEXT NOT NULL, 
    FOREIGN KEY(userId) REFERENCES users(userId),
    FOREIGN KEY(postId) REFERENCES posts(postId),
    FOREIGN KEY(commentId) REFERENCES comments(commentId)
);

CREATE TABLE IF NOT EXISTS topics(
    topicId INTEGER PRIMARY KEY AUTOINCREMENT,
    topicName TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS PostTopics(
    postId INTEGER NOT NULL,
    topicId INTEGER NOT NULL,
    FOREIGN KEY(postId) REFERENCES posts(postId),
    FOREIGN KEY(topicId) REFERENCES topics(topicId)
);

CREATE TABLE IF NOT EXISTS messages(
    messageId INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER NOT NULL,
    receiverId INTEGER NOT NULL,
    messageContent TEXT NOT NULL,
    sendTime TEXT NOT NULL,
    seen INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(senderId) REFERENCES users(userId)
    FOREIGN KEY(receiverId) REFERENCES users(userId)
);