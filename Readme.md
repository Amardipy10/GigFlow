# GigFlow - Freelance Marketplace

A clean, production-ready MERN stack application for posting gigs and submitting bids.

## Features

- **Authentication**: JWT-based auth with HttpOnly cookies
- **Gigs**: Create and browse open gigs with search functionality
- **Bids**: Submit bids on gigs, view bids (owners only)
- **Hiring**: Atomic hiring process that updates gig and all related bids

## Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Context API
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (HttpOnly cookies)

## Project Structure

```
gigflow/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── gigController.js
│   │   └── bidController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Gig.js
│   │   └── Bid.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── gigRoutes.js
│   │   └── bidRoutes.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── CreateGig.jsx
    │   │   └── BidPage.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Gigs
- `GET /api/gigs?search=query` - Get all open gigs (with optional search)
- `POST /api/gigs` - Create gig (protected)

### Bids
- `POST /api/bids` - Submit bid (protected)
- `GET /api/bids/:gigId` - Get all bids for a gig (owner only)
- `PATCH /api/bids/:bidId/hire` - Hire freelancer (owner only)

## Key Implementation Details

### Messaging (Post-Hire Coordination)

**Messaging is intentionally limited to post-hire coordination between the client and the hired freelancer.**

**Real-Time Delivery:**
Post-hire messages are delivered in real-time using Socket.io to avoid manual page refresh. When one user sends a message, the other user sees it instantly without reloading the page.

**Why Chat is Restricted:**
- **No pre-hire negotiation**: Prevents bid manipulation and maintains fair competition
- **Privacy**: Only the two parties working together can communicate
- **Focus**: Chat serves a single purpose - project coordination after hiring
- **Simplicity**: Avoids building a complex chat system with unnecessary features

**Authorization Checks:**
1. **Gig Status Verification**: Chat only works when `gig.status === 'assigned'`
2. **Participant Verification**: Only two users can access chat:
   - The gig owner (client)
   - The hired freelancer (found via `Bid.status === 'hired'`)
3. **Automatic Rejection**: All other users receive 403 Forbidden

**Technical Implementation:**
- Backend validates authorization on every message send/fetch
- Real-time delivery via Socket.io rooms (gig-specific)
- Users join room `gig_<gigId>` when chat opens
- Messages broadcast to room members instantly
- Messages stored with gigId, senderId, receiverId for audit trail
- UI only shows chat in Dashboard → Assigned Gigs section

**Socket.io Events:**
- `joinGigRoom`: User joins gig-specific room after authorization
- `sendMessage`: Emits message to room (both users receive instantly)
- `receiveMessage`: Updates UI in real-time without page reload

**Code Location:**
- Authorization logic: `backend/controllers/messageController.js` - `verifyMessagingAuth()`
- Chat UI: `frontend/src/components/Chat.jsx`

### Authentication
- JWT tokens stored in HttpOnly cookies (NOT localStorage)
- Automatic cookie sending with `withCredentials: true`
- Protected routes on both frontend and backend

### Hiring Logic (CRITICAL)
When a gig owner clicks "Hire" on a bid:

1. **Verification**: Checks if requester is the gig owner
2. **Status Check**: Ensures gig is still "open"
3. **Atomic Transaction**: Uses MongoDB session to:
   - Mark selected bid as `hired`
   - Mark all other bids for same gig as `rejected`
   - Change gig status from `open` to `assigned`
4. **All-or-Nothing**: Either all changes succeed or all fail (no partial updates)

**Code Location**: `backend/controllers/bidController.js` - `hireBid` function

### Authorization Rules
- Only authenticated users can create gigs and submit bids
- Only gig owners can view bids for their gigs
- Only gig owners can hire freelancers
- Users cannot bid on their own gigs

## Testing the Application

1. **Register** a new user
2. **Login** with credentials
3. **Create a gig** (e.g., "Build a React app", ₹50000)
4. **Logout** and register another user
5. **Browse gigs** and click "Place Bid"
6. **Submit a bid** with your message and price
7. **Login** as the gig owner
8. **Navigate to the gig** and view bids
9. **Click "Hire"** on a bid
10. **Verify** gig status changes to "assigned" and other bids become "rejected"

## Production Deployment Notes

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Enable HTTPS for secure cookies
- Set proper CORS origins
- Use MongoDB Atlas for database
- Add rate limiting
- Implement request validation
- Add logging (Winston, Morgan)

## License

MIT