# ✦ SocialMini

A full-stack mini social media platform built for the CodeAlpha internship.

**Stack:** Node.js / Express — MySQL (mysql2, raw queries) — Vanilla HTML/CSS/JS

---

## Features

| Feature | Details |
|---|---|
| Auth | Registration, login, bcrypt password hashing, JWT tokens |
| Profiles | Avatar placeholder, bio, post / follower / following counts |
| Posts | Create text posts with optional image URL, global feed |
| Following Feed | Tab that shows only posts from users you follow |
| Comments | Per-post comments with username and timestamp |
| Likes | Like / unlike, live count, one like per user enforced at DB + server |
| Follow System | Follow / unfollow, cannot follow yourself |

---

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm

---

## 1. Clone and install

```bash
git clone <repo-url>
cd socialmini
npm install
```

---

## 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=socialmini

# Generate a strong secret: openssl rand -hex 64
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

---

## 3. Create the database and tables

```bash
mysql -u root -p < schema.sql
```

This creates the `socialmini` database and all five tables with proper foreign keys and constraints.

---

## 4. Run the server

**Development (auto-restart on changes):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The server starts at `http://localhost:3000`

---

## 5. Using the app

| URL | Page |
|---|---|
| `http://localhost:3000/` | Main feed (requires login) |
| `http://localhost:3000/pages/register.html` | Create account |
| `http://localhost:3000/pages/login.html` | Sign in |
| `http://localhost:3000/pages/profile.html?id=<userId>` | User profile |
| `http://localhost:3000/pages/post.html?id=<postId>` | Single post + comments |

---

## Project structure

```
socialmini/
├── server.js                 # Express entry point
├── schema.sql                # MySQL schema
├── package.json
├── .env.example
├── middleware/
│   └── auth.js               # JWT verification middleware
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── posts.js
│   ├── comments.js
│   ├── likes.js
│   └── followers.js
├── controllers/
│   ├── authController.js
│   ├── usersController.js
│   ├── postsController.js
│   ├── commentsController.js
│   ├── likesController.js
│   └── followersController.js
├── db/
│   ├── pool.js               # mysql2 connection pool
│   ├── users.js              # query helpers
│   ├── posts.js
│   ├── comments.js
│   ├── likes.js
│   └── followers.js
└── public/
    ├── index.html            # Main feed
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── api.js            # Shared API client + auth helpers
    │   ├── feed.js
    │   ├── profile.js
    │   └── post.js
    └── pages/
        ├── login.html
        ├── register.html
        ├── profile.html
        └── post.html
```

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ✗ | Register a new user |
| POST | `/api/auth/login` | ✗ | Log in, receive JWT |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | ✓ | Get own profile |
| GET | `/api/users/:id` | ✓ | Get any user's profile |
| PUT | `/api/users/me/profile` | ✓ | Update bio / avatar |

### Posts
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | ✓ | All posts (global feed) |
| GET | `/api/posts/following` | ✓ | Posts from followed users |
| GET | `/api/posts/:id` | ✓ | Single post |
| GET | `/api/posts/user/:userId` | ✓ | All posts by a user |
| POST | `/api/posts` | ✓ | Create a post |
| DELETE | `/api/posts/:id` | ✓ | Delete own post |

### Comments
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/posts/:postId/comments` | ✓ | Get comments for a post |
| POST | `/api/posts/:postId/comments` | ✓ | Add a comment |
| DELETE | `/api/posts/:postId/comments/:commentId` | ✓ | Delete own comment |

### Likes
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/posts/:postId/like` | ✓ | Toggle like / unlike |

### Followers
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/users/:userId/follow` | ✓ | Toggle follow / unfollow |
| GET | `/api/users/:userId/followers` | ✓ | List followers |
| GET | `/api/users/:userId/following` | ✓ | List following |

---

## Security notes

- Passwords hashed with bcrypt (cost factor 12) — plaintext never stored or logged
- JWT stored in `localStorage` — token verified on every protected API call
- All protected routes require a valid Bearer token
- Self-follow prevented at both server and DB level (`CHECK` constraint)
- Duplicate likes prevented at both server and DB level (`UNIQUE` constraint)
- User input validated on both client and server before any DB write
- SQL injection not possible — all queries use parameterized placeholders (`?`)
- Email not revealed in "invalid credentials" errors (prevents email enumeration)
