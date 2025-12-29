-- Adatbázis létrehozása kezdete

CREATE DATABASE telephoto
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

-- Adatbázis létrehozása vége

-- Táblák létrehozása kezdete

DELIMITER //

CREATE TABLE users(
    user_id INT NOT NULL,
    username VARCHAR(50),
    password_salt VARCHAR(16),
    password_hash VARCHAR(64),
    email VARCHAR(100),
    profile_picture_link VARCHAR(200),
    biography VARCHAR(500),
    is_admin BOOLEAN,
    registration_date DATETIME,
    PRIMARY KEY(user_id)
);
//
CREATE TABLE posts(
    post_id INT NOT NULL,
    user_id INT,
    description VARCHAR(500),
    tags TEXT,
    upvote INT DEFAULT 0,
    downvote INT DEFAULT 0,
    location VARCHAR(176),
    PRIMARY KEY(post_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);
//
CREATE TABLE pictures(
	picture_id INT NOT NULL,
    post_id INT,
    picture_link TEXT NOT NULL,
    PRIMARY KEY(picture_id),
    FOREIGN KEY(post_id) REFERENCES posts(post_id)
);
//
CREATE TABLE comments(
	comment_id INT NOT NULL,
    post_id INT,
    user_id INT,
    comment_content VARCHAR(500),
    PRIMARY KEY(comment_id),
    FOREIGN KEY(post_id) REFERENCES posts(post_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);
//
DELIMITER ;

-- Táblák létrehozása vége
