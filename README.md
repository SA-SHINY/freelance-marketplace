# Freelance Marketplace

A full-stack freelance marketplace platform connecting clients with freelancers.

## Features

### User Authentication
- Register/Login with email
- Role-based access (Freelancer/Client)
- JWT authentication
- Password management

### For Freelancers
- Profile management with skills
- Portfolio showcase
- Browse available projects
- Place bids on projects
- Manage contracts
- Service listings

### For Clients
- Post projects
- Browse freelancers
- Search with filters (skills, location, rating, budget)
- Accept/reject bids
- Create contracts
- Real-time notifications

## Tech Stack

### Frontend
- React 19
- Tailwind CSS
- React Router DOM
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcryptjs

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB

### Backend Setup
\\\ash
cd backend
npm install
npm run dev
\\\

### Frontend Setup
\\\ash
cd frontend
npm install
npm start
\\\

## Environment Variables

Create a .env file in the backend folder:

\\\
PORT=5000
MONGODB_URI=mongodb://localhost:27017/freelance_marketplace
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
\\\

## API Endpoints

### Authentication
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update profile
- PUT /api/auth/change-password - Change password

### Projects
- POST /api/projects/create - Create project
- GET /api/projects/available - Get available projects
- GET /api/projects/my-projects - Get client's projects
- POST /api/projects/:id/bid - Place a bid

### Contracts
- POST /api/contracts/create - Create contract
- GET /api/contracts/freelancer - Get freelancer's contracts
- GET /api/contracts/client - Get client's contracts
- PUT /api/contracts/:id/accept - Accept contract

## License

MIT
