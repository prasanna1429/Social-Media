-- ============================================================
--  SocialMini — Full Database Schema
--  Database: MySQL 8.x
--  Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS socialmini
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE socialmini;

-- ============================================================
--  USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  username     VARCHAR(32)       NOT NULL,
  email        VARCHAR(255)      NOT NULL,
  password     VARCHAR(255)      NOT NULL,        -- bcrypt hash
  bio          TEXT              DEFAULT NULL,
  avatar_url   VARCHAR(500)      DEFAULT NULL,
  created_at   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email    (email)
) ENGINE=InnoDB;

-- ============================================================
--  POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED      NOT NULL,
  content      TEXT              NOT NULL,
  image_url    VARCHAR(500)      DEFAULT NULL,
  created_at   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_posts_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  post_id      INT UNSIGNED      NOT NULL,
  user_id      INT UNSIGNED      NOT NULL,
  content      TEXT              NOT NULL,
  created_at   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_comments_post
    FOREIGN KEY (post_id) REFERENCES posts (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  LIKES
--  Composite UNIQUE key enforces "one like per user per post"
--  at the database level — no application-layer tricks needed.
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
  id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  post_id      INT UNSIGNED      NOT NULL,
  user_id      INT UNSIGNED      NOT NULL,
  created_at   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_likes_post_user (post_id, user_id),   -- prevents duplicate likes
  CONSTRAINT fk_likes_post
    FOREIGN KEY (post_id) REFERENCES posts (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_likes_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  FOLLOWERS
--  Self-referencing join table on the users table.
--  (follower_id) follows (following_id).
--  Composite UNIQUE key prevents duplicate follow relationships.
-- ============================================================
CREATE TABLE IF NOT EXISTS followers (
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  follower_id    INT UNSIGNED    NOT NULL,   -- the user who presses "Follow"
  following_id   INT UNSIGNED    NOT NULL,   -- the user being followed
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_follow_pair (follower_id, following_id),
  CONSTRAINT fk_followers_follower
    FOREIGN KEY (follower_id)  REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_followers_following
    FOREIGN KEY (following_id) REFERENCES users (id)
    ON DELETE CASCADE,
  -- prevent self-follows at the DB level
  CONSTRAINT chk_no_self_follow
    CHECK (follower_id <> following_id)
) ENGINE=InnoDB;
