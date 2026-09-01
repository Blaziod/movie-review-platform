# Reelboxed — Movie Review Platform

**IFN636 Assessment 1** Software Requirements Analysis and Design

**Author:** Uwoh Princestan Chizoba
**Student ID:** n12690759

## Description

Reelboxed is a small MERN application where **Reviewers** submit star ratings and written reviews against a movie catalog, and an **Admin (Moderator)** curates the catalog and approves or rejects submissions before they go public. Two roles, two end-to-end workflows (review submission and moderation), one deployed application.

- Jira board: `[<JIRA BOARD URL>](https://connect-team-ruzzrz7e.atlassian.net/jira/software/projects/MRP/boards/2/backlog)`
- Figma prototype: `[<FIGMA VIEW-ONLY LINK>](https://www.figma.com/design/1dkj0j3wajfyrTQdDMxpT8/Movie-review?node-id=0-1&t=FDDQhzlEPzPsgCyW-1)`

## Live deployment

- **URL:** http://3.26.65.198:3000
- **EC2 instance ID:** `i-008a6f4ba4da70da6`

## How to use the website

**As a visitor (no account needed):**
1. Open the site, you land on the **Movie List** (catalog) page.
2. Search by title or filter by genre using the controls at the top right.
3. Click any movie poster to open its **Movie Detail** page, showing its average rating and all approved reviews.

**As a Reviewer:**
1. Click **Register** to create an account, then **Log In**.
2. Open any movie's detail page, pick a star rating and write a review (minimum 20 characters), then submit — it goes in as **Pending**.
3. Check **My Reviews** to see the status of everything you've submitted (Pending / Approved / Rejected, with the moderator's reason if rejected).
4. While a review is still Pending, you can edit or withdraw it from **My Reviews**. Once it's Approved it's locked.

**As an Admin:**
1. Log in with an admin account (see *Creating an admin account* below — there's no public admin sign-up by design).
2. Use **Manage Movies** to add, edit, or delete catalog entries (poster URL and duration are optional fields).
3. Use the **Moderation Queue** to review Pending submissions and Approve or Reject each one (rejection requires a reason, shown to the reviewer). Approving a review immediately recalculates that movie's average rating.

## Tech stack

MERN, following the course's own reference conventions (`controllers/` + `models/` + `routes/` + `middleware/` + `config/db.js`, JWT + bcrypt auth):

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt password hashing
- **Frontend**: React (Create React App), React Router, Tailwind CSS, Axios
- **Testing**: Mocha, Chai, Sinon (backend unit tests, model/DB calls stubbed)

## Project structure

```
movie-review-platform/
├── backend/
│   ├── config/db.js            # Mongoose connection
│   ├── controllers/            # Route handler logic
│   ├── middleware/              # protect (JWT) + requireAdmin (role gate)
│   ├── models/                 # Mongoose schemas (User, Movie, Review)
│   ├── routes/                 # Express routers, mounted in server.js
│   ├── seed/createAdmin.js     # One-off script to create/promote an admin
│   ├── test/                   # Mocha/Chai/Sinon unit tests
│   └── server.js
└── frontend/
    └── src/
        ├── pages/               # Catalog, MovieDetail, Login, Register, Dashboard, ...
        ├── components/          # Navbar, Footer, RatingStats, StarRating, ...
        ├── context/AuthContext.js
        └── axiosConfig.jsx
```

## Install and set up (local development)

**Prerequisites**: Node.js, a MongoDB connection string (local or [Atlas](https://account.mongodb.com/account/login)).

```bash
git clone https://github.com/Blaziod/movie-review-platform.git
cd movie-review-platform
npm run install-all
```

Copy `backend/.env.example` to `backend/.env` and fill in your own values:

```
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<a long random secret>
PORT=5001
```

In `frontend/src/axiosConfig.jsx`, make sure the local dev line is the active `baseURL`:

```js
baseURL: 'http://localhost:5001', 
```

Run both servers together from the project root:

```bash
npm run dev
```

- Backend: http://localhost:5001
- Frontend: http://localhost:3000

### Creating an admin account

There is **no public admin sign-up** — only Reviewer self-registration — by design, matching "trusted staff only" access. Create or promote an admin directly:

```bash
cd backend
npm run seed:admin -- "Admin Name" admin@example.com "a-strong-password"
```

Safe to re-run: if the email already exists it promotes that account to `role: admin` instead of erroring.

### Running the backend tests

```bash
cd backend
npm test
```

## Architecture summary

Four-layer architecture (Presentation → Business Logic → Data Access → Database):

- **Presentation**: React pages/components (`frontend/src`)
- **Business logic**: Express controllers + middleware (`backend/controllers`, `backend/middleware`)
- **Data access**: Mongoose models (`backend/models`)
- **Database**: MongoDB

Authentication is JWT-based (`Authorization: Bearer <token>`). `protect` verifies the token and attaches `req.user`; `requireAdmin` gates admin-only routes server-side (not just hidden UI) — a Reviewer token hitting an admin route gets a `403`.

## Deployment

Manually deployed to a single AWS EC2 instance (`i-008a6f4ba4da70da6`), following the course's Manual Deployment method:

1. SSH into the instance and install Node.js, git, and PM2.
2. `git clone` this repository onto the instance.
3. Set `backend/.env` with the production `MONGO_URI` and `JWT_SECRET`, then run the backend persistently with `pm2 start server.js --name mrp-backend`.
4. Build the frontend locally with `axiosConfig.jsx`'s `baseURL` pointed at the instance's public IP, then copy the `build/` folder to the instance and serve it with `pm2 start "serve -s build -l 3000" --name mrp-frontend`.
5. Open inbound ports `3000` (frontend) and `5001` (backend) in the instance's security group.

Redeploying after a code change is manual (no CI/CD pipeline): pull/copy the updated files, then `pm2 restart mrp-backend` (backend) or rebuild + re-copy `build/` (frontend) — PM2 does not hot-reload code changes on its own.
