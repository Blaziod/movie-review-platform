# Movie Review Platform

IFN636 Assessment 1 - Software Requirements Analysis and Design.

A small MERN application where **Reviewers** submit ratings and written reviews against a movie catalog, and a **Moderator (Admin)** curates the catalog and approves/rejects submissions before they go public. Two roles, two end-to-end workflows, one deployed application.

- Full requirements, backlog and decision log: `Assessment1_MovieReviewPlatform/01_Problem_Requirements_ProjectManagement.md` in the assessment report
- Jira board: `<JIRA BOARD URL>`
- Figma prototype: `<FIGMA VIEW-ONLY LINK>`
- Live deployment: `<EC2 PUBLIC URL>` *(not yet deployed - see Deployment below)*

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
│   ├── controllers/            # Route handler logic (authController, ...)
│   ├── middleware/              # protect (JWT) + requireAdmin (role gate)
│   ├── models/                 # Mongoose schemas (User, ...)
│   ├── routes/                 # Express routers, mounted in server.js
│   ├── seed/createAdmin.js     # One-off script to create/promote an admin
│   ├── test/                   # Mocha/Chai/Sinon unit tests
│   └── server.js
└── frontend/
    └── src/
        ├── pages/               # Register, Login, Dashboard, ...
        ├── components/          # Navbar, ...
        ├── context/AuthContext.js
        └── axiosConfig.jsx
```

## Setup

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

Run both servers together from the project root:

```bash
npm run dev
```

- Backend: http://localhost:5001
- Frontend: http://localhost:3000

### Creating an admin account

There is **no public admin sign-up** - only Reviewer self-registration (US1.1) - by design, matching "trusted staff only" (US1.3). Create or promote an admin directly:

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

Four-layer architecture (Presentation → Business Logic → Data Access → Database), matching the course's Software Layers and Tiers model:

- **Presentation**: React pages/components (`frontend/src`)
- **Business logic**: Express controllers + middleware (`backend/controllers`, `backend/middleware`)
- **Data access**: Mongoose models (`backend/models`)
- **Database**: MongoDB

Authentication is JWT-based (`Authorization: Bearer <token>`). `protect` verifies the token and attaches `req.user`; `requireAdmin` gates admin-only routes server-side (not just hidden UI) - a Reviewer token hitting an admin route gets a `403`, verified in `backend/test/authMiddleware.test.js` and live via curl during development.

Full SysML design (block/internal-block/requirements diagrams, sequence diagrams for both workflows, traceability matrix): see `Assessment1_MovieReviewPlatform/02_System_Design.md` in the assessment report.


## Deployment

*Not yet deployed - this section will be filled in once the application is deployed to EC2 (Assessment Section 5).* Planned approach: manual deployment (per the course's Manual Deployment lecture) - provision an EC2 instance, clone this repo, `npm run install-all`, set `backend/.env`, keep the Node process running (e.g. via `pm2` or `nohup`), open the required inbound port in the instance's security group, and set the frontend's `axiosConfig.jsx` `baseURL` to the instance's public address.

## GenAI disclosure

GenAI assistance was used during development of this project (permitted per the unit's relaxed GenAI policy). See the GenAI declaration and evidence log in the assessment report (Section 6) for details of what was used and how.
