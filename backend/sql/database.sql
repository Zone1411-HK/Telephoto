-- Adatbázis létrehozása kezdete

CREATE DATABASE telephoto
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

-- Adatbázis létrehozása vége

-- Táblák létrehozása kezdete


DELIMITER //

CREATE TABLE users(
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50),
    password_salt VARCHAR(32),
    password_hash VARCHAR(128),
    email VARCHAR(100),
    profile_picture_link VARCHAR(200),
    biography VARCHAR(500),
    is_admin BOOLEAN,
    registration_date DATETIME
);
//
CREATE TABLE posts(
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    description VARCHAR(500),
    tags TEXT,
    location VARCHAR(176),
    latitude FLOAT,
    longitude FLOAT,
    creation_date DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);
//
CREATE TABLE pictures(
	picture_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    picture_link TEXT NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(post_id)
);

//
CREATE TABLE interactions(
 	user_id INT,
    post_id INT,
    upvote_downvote INT,
    favorite BOOLEAN,
    comment_content VARCHAR(500),
    type VARCHAR(20),
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(post_id) REFERENCES posts(post_id)
);
//
CREATE TABLE chats(
    chat_id INT PRIMARY KEY AUTO_INCREMENT,
    chat_name VARCHAR(50),
    chat_picture_link VARCHAR(200)
);
//
CREATE TABLE chat_members(
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    chat_id INT,
    user_id INT,
    FOREIGN KEY(chat_id) REFERENCES chats(chat_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)


);
//
CREATE TABLE messages(
    member_id INT,
    message VARCHAR(200),
    message_date DATETIME,
    FOREIGN KEY(member_id) REFERENCES chat_members(member_id)
);

//
DELIMITER ;


-- Táblák létrehozása vége
