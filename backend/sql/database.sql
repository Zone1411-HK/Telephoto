-- Adatbázis létrehozása kezdete

CREATE DATABASE telephoto
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

-- Adatbázis létrehozása vége

-- Táblák létrehozása kezdete
USE telephoto;

CREATE TABLE users(
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password_salt VARCHAR(32) NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    email VARCHAR(100) NOT NULL,
    profile_picture_link TEXT,
    biography TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_reported BOOLEAN DEFAULT FALSE,
    registration_date DATETIME
);
CREATE TABLE posts(
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    description TEXT,
    tags TEXT,
    location VARCHAR(176),
    latitude FLOAT,
    longitude FLOAT,
    creation_date DATETIME,
    is_reported BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE pictures(
	picture_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    picture_link TEXT NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE interactions(
    interaction_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
 	user_id INT NOT NULL,
    post_id INT NOT NULL,
    upvote BOOLEAN,
    downvote BOOLEAN,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE favorites(
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  is_favorited BOOLEAN,
  FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE comments(
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    comment_content VARCHAR(150) NOT NULL,
    comment_date TIMESTAMP,
    is_reported BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE chats(
    chat_id INT PRIMARY KEY AUTO_INCREMENT,
    chat_name VARCHAR(50) NOT NULL,
    chat_picture_link TEXT NOT NULL
);
CREATE TABLE chat_members(
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    chat_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY(chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE


);
CREATE TABLE messages(
    member_id INT,
    message VARCHAR(200) NOT NULL,
    message_date DATETIME,
    FOREIGN KEY(member_id) REFERENCES chat_members(member_id) ON DELETE CASCADE
);

CREATE TABLE deleted_posts( 
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    description TEXT,
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

CREATE TRIGGER delete_post_favorites
BEFORE DELETE ON posts
FOR EACH ROW
DELETE FROM favorites 
WHERE favorites.post_id = OLD.post_id;

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
VALUES(OLD.picture_id, OLD.post_id, OLD.picture_link, NOW());



CREATE TRIGGER delete_user_favorites
BEFORE DELETE ON users
FOR EACH ROW
DELETE FROM favorites 
WHERE favorites.user_id = OLD.user_id;

CREATE TRIGGER delete_user_interactions
BEFORE DELETE ON users
FOR EACH ROW
DELETE FROM interactions 
WHERE interactions.user_id = OLD.user_id;

CREATE TRIGGER delete_user_comments
BEFORE DELETE ON users
FOR EACH ROW
DELETE FROM comments 
WHERE comments.user_id = OLD.user_id;

CREATE TRIGGER delete_user_posts
BEFORE DELETE ON users
FOR EACH ROW
DELETE FROM posts 
WHERE posts.user_id = OLD.user_id;

CREATE TRIGGER delete_user_messages
BEFORE DELETE ON users
FOR EACH ROW
DELETE FROM messages 
WHERE messages.member_id IN (SELECT member_id FROM chat_members WHERE user_id = OLD.user_id) ;

CREATE TRIGGER delete_chatmember_messages
BEFORE DELETE ON chat_members
FOR EACH ROW
DELETE FROM messages 
WHERE OLD.member_id = messages.member_id;

CREATE TRIGGER delete_user_member
BEFORE DELETE ON users
FOR EACH ROW
DELETE FROM chat_members 
WHERE chat_members.user_id = OLD.user_id;

-- Táblák létrehozása vége
