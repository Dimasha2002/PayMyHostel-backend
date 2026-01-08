# PayMyHostel Backend API

MERN Stack backend for PayMyHostel - Hostel Management System

## Features

- ✅ User Authentication (JWT)
- ✅ Student & Admin Roles
- ✅ Payment Management with Bank Slip Upload
- ✅ Payment History
- ✅ Hostel Notices
- ✅ Room Management
- ✅ Profile Management
- ✅ Password Change
- ✅ File Upload (Bank Slips)

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Navigate to backend directory:
```powershell
cd backend
```

2. Install dependencies:
```powershell
npm install
```

3. Create `.env` file:
```powershell
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/paymyhostel
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

5. Start MongoDB (if running locally):
```powershell
# Make sure MongoDB service is running
```

6. Start the server:

Development mode:
```powershell
npm run dev
```

Production mode:
```powershell
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `PUT /api/users/change-password` - Change password (Protected)
- `GET /api/users` - Get all users (Admin only)

### Payments
- `POST /api/payments` - Submit payment with bank slip (Protected)
- `GET /api/payments/my-payments` - Get user's payment history (Protected)
- `GET /api/payments` - Get all payments (Admin only)
- `PUT /api/payments/:id/status` - Update payment status (Admin only)

### Notices
- `GET /api/notices` - Get all active notices (Protected)
- `POST /api/notices` - Create notice (Admin only)
- `PUT /api/notices/:id` - Update notice (Admin only)
- `DELETE /api/notices/:id` - Delete notice (Admin only)

### Rooms
- `GET /api/rooms` - Get all rooms (Protected)
- `GET /api/rooms/available` - Get available rooms (Protected)
- `POST /api/rooms` - Create room (Admin only)
- `PUT /api/rooms/:id` - Update room (Admin only)

## Request Examples

### Register User
```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "studentId": "STU2024001",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+92 300 1234567",
  "hostelBlock": "Block A",
  "roomNumber": "101"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Submit Payment
```
POST /api/payments
Content-Type: multipart/form-data

amount: 20000
description: Monthly hostel fee
paymentDate: 2024-11-18
bankSlip: [file upload]
```

## Database Models

### User Schema
- fullName, studentId, email, password
- phone, role, hostelBlock, roomNumber
- checkInDate, isActive, lastPasswordChange

### Payment Schema
- user (ref), amount, method, status
- reference, description, paymentDate
- bankSlip, adminNotes, verifiedBy, verifiedAt

### Notice Schema
- title, content, type, priority
- isActive, expiryDate, createdBy

### Room Schema
- hostelBlock, roomNumber, capacity
- currentOccupancy, monthlyRent, facilities
- status, residents

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/paymyhostel |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |
| MAX_FILE_SIZE | Max upload size in bytes | 5242880 (5MB) |

## Project Structure

```
backend/
├── controllers/       # Request handlers
├── models/           # Database models
├── routes/           # API routes
├── middleware/       # Custom middleware
├── uploads/          # Uploaded files
├── .env             # Environment variables
├── .gitignore       # Git ignore file
├── package.json     # Dependencies
└── server.js        # Entry point
```

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- File upload validation
- Input validation
- CORS protection

## Testing the API

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- cURL

Example with cURL:
```powershell
# Login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"john@example.com\",\"password\":\"password123\"}'
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Use MongoDB Atlas or production database
4. Set up proper CORS origins
5. Use environment variables for sensitive data
6. Enable HTTPS
7. Set up proper logging
8. Configure file upload limits

## Support

For issues or questions, contact: support@paymyhostel.com
