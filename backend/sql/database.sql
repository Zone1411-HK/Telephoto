-- Adatbázis létrehozása kezdete

CREATE DATABASE telephoto
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

-- Adatbázis létrehozása vége

-- Táblák létrehozása kezdete
USE telephoto;

CREATE TABLE users(
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50),
    password_salt VARCHAR(32),
    password_hash VARCHAR(128),
    email VARCHAR(100),
    profile_picture_link VARCHAR(200),
    biography VARCHAR(500),
    is_admin BOOLEAN,
    is_reported BOOLEAN DEFAULT FALSE,
    registration_date DATETIME
);
CREATE TABLE posts(
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    description VARCHAR(500),
    tags TEXT,
    location VARCHAR(176),
    latitude FLOAT,
    longitude FLOAT,
    creation_date DATETIME,
    is_reported BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);
CREATE TABLE pictures(
	picture_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    picture_link TEXT NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(post_id)
);

CREATE TABLE interactions(
 	user_id INT,
    post_id INT,
    upvote BOOLEAN,
    downvote BOOLEAN,
    favorite BOOLEAN,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(post_id) REFERENCES posts(post_id)
);

CREATE TABLE comments(
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    comment_content VARCHAR(150),
    comment_date TIMESTAMP,
    is_reported BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(post_id) REFERENCES posts(post_id)
);

CREATE TABLE chats(
    chat_id INT PRIMARY KEY AUTO_INCREMENT,
    chat_name VARCHAR(50),
    chat_picture_link VARCHAR(200)
);
CREATE TABLE chat_members(
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    chat_id INT,
    user_id INT,
    FOREIGN KEY(chat_id) REFERENCES chats(chat_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)


);
CREATE TABLE messages(
    member_id INT,
    message VARCHAR(200),
    message_date DATETIME,
    FOREIGN KEY(member_id) REFERENCES chat_members(member_id)
);

CREATE TABLE deleted_posts( 
    post_id INT,
    user_id INT,
    description VARCHAR(500),
    tags TEXT,
    location VARCHAR(176),
    latitude FLOAT,
    longitude FLOAT,
    creation_date DATETIME,
    deleted_at TIMESTAMP
);

CREATE TABLE deleted_pictures(
	picture_id INT NOT NULL,
    post_id INT NOT NULL,
    picture_link TEXT NOT NULL,
    deleted_at TIMESTAMP

);

CREATE TRIGGER delete_post
BEFORE DELETE ON posts
FOR EACH ROW
INSERT INTO deleted_posts(post_id, user_id, description, tags, location, latitude, longitude, creation_date, deleted_at)
VALUES(OLD.post_id, OLD.user_id, OLD.description, OLD.tags, OLD.location, OLD.latitude, OLD.longitude, OLD.creation_date, NOW());

CREATE TRIGGER delete_post_interactions
BEFORE DELETE ON posts
FOR EACH ROW
DELETE FROM interactions 
WHERE interactions.post_id = OLD.post_id;

CREATE TRIGGER delete_post_comments
BEFORE DELETE ON posts
FOR EACH ROW
DELETE FROM comments 
WHERE comments.post_id = OLD.post_id;

CREATE TRIGGER delete_post_pictures
BEFORE DELETE ON posts
FOR EACH ROW
DELETE FROM pictures 
WHERE pictures.post_id = OLD.post_id;

CREATE TRIGGER save_deleted_pictures
BEFORE DELETE ON pictures
FOR EACH ROW 
INSERT INTO deleted_pictures(picture_id, post_id, picture_link, deleted_at)
VALUES(OLD.picture_id, OLD.post_id, OLD.picture_link, NOW())
-- Táblák létrehozása vége
