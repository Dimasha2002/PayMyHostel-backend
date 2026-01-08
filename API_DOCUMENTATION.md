# PayMyHostel Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Routes (`/api/auth`)

### Register Student
- **POST** `/api/auth/register`
- **Access:** Public
- **Body:**
```json
{
  "fullName": "John Doe",
  "studentId": "STD001",
  "email": "john@example.com",
  "password": "password123",
  "phone": "0712345678",
  "hostelBlock": "A",
  "roomNumber": "A01"
}
```

### Student Login
- **POST** `/api/auth/login`
- **Access:** Public
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
- **GET** `/api/auth/me`
- **Access:** Private (Student/Admin)

---

## Admin Routes (`/api/admin`)

### Admin Login
- **POST** `/api/admin/login`
- **Access:** Public
- **Body:**
```json
{
  "username": "Hostel",
  "password": "H123"
}
```

### Get Dashboard Statistics
- **GET** `/api/admin/stats`
- **Access:** Private/Admin
- **Response:**
```json
{
  "success": true,
  "stats": {
    "totalStudents": 50,
    "pendingPayments": 5,
    "approvedPayments": 45,
    "rejectedPayments": 2,
    "totalPayments": 52,
    "totalRevenue": 900000,
    "activeNotices": 3,
    "totalRooms": 40,
    "occupiedRooms": 25,
    "vacantRooms": 15
  }
}
```

### Get Room Occupancy
- **GET** `/api/admin/rooms?block=A&room=A01`
- **Access:** Private/Admin
- **Query Params:** `block`, `room` (optional)

### Approve Payment
- **PUT** `/api/admin/payments/:id/approve`
- **Access:** Private/Admin
- **Body:**
```json
{
  "adminNotes": "Payment verified"
}
```

### Reject Payment
- **PUT** `/api/admin/payments/:id/reject`
- **Access:** Private/Admin
- **Body:**
```json
{
  "adminNotes": "Invalid bank slip"
}
```

---

## User Routes (`/api/users`)

### Get Profile
- **GET** `/api/users/profile`
- **Access:** Private

### Update Profile
- **PUT** `/api/users/profile`
- **Access:** Private
- **Body:**
```json
{
  "fullName": "John Updated",
  "email": "newemail@example.com",
  "phone": "0712345679"
}
```

### Change Password
- **PUT** `/api/users/change-password`
- **Access:** Private
- **Body:**
```json
{
  "currentPassword": "old123",
  "newPassword": "new123"
}
```

### Get All Users
- **GET** `/api/users?role=student&status=active&block=A&room=A01`
- **Access:** Private/Admin
- **Query Params:** `role`, `status`, `block`, `room` (all optional)

### Get Students Only
- **GET** `/api/users/students?block=A&room=A01`
- **Access:** Private/Admin
- **Query Params:** `block`, `room` (optional)

### Get Single User
- **GET** `/api/users/:id`
- **Access:** Private/Admin

---

## Payment Routes (`/api/payments`)

### Submit Payment
- **POST** `/api/payments`
- **Access:** Private (Student)
- **Content-Type:** `multipart/form-data`
- **Body:**
```
amount: 20000
month: January
year: 2025
description: Hostel fee for January
paymentDate: 2025-01-15
bankSlip: [file]
```

### Get My Payments
- **GET** `/api/payments/my-payments?month=January&year=2025&status=pending`
- **Access:** Private (Student)
- **Query Params:** `month`, `year`, `status` (all optional)

### Get All Payments
- **GET** `/api/payments?month=January&year=2025&status=pending`
- **Access:** Private/Admin
- **Query Params:** `month`, `year`, `status` (all optional)

### Get Pending Payments
- **GET** `/api/payments/pending`
- **Access:** Private/Admin

### Get Payment Receipt
- **GET** `/api/payments/:id/receipt`
- **Access:** Private (Student/Admin)
- Students can only view their own receipts

### Update Payment Status
- **PUT** `/api/payments/:id/status`
- **Access:** Private/Admin
- **Body:**
```json
{
  "status": "success",
  "adminNotes": "Payment verified"
}
```

---

## Notice Routes (`/api/notices`)

### Get Active Notices
- **GET** `/api/notices?type=urgent&priority=high`
- **Access:** Private
- **Query Params:** `type`, `priority` (optional)
- **Valid types:** general, urgent, maintenance, event, payment
- **Valid priorities:** low, medium, high

### Get All Notices (including inactive)
- **GET** `/api/notices/admin/all`
- **Access:** Private/Admin

### Get Single Notice
- **GET** `/api/notices/:id`
- **Access:** Private

### Create Notice
- **POST** `/api/notices`
- **Access:** Private/Admin
- **Body:**
```json
{
  "title": "Important Announcement",
  "content": "Notice details here...",
  "type": "urgent",
  "priority": "high",
  "expiryDate": "2025-12-31"
}
```

### Update Notice
- **PUT** `/api/notices/:id`
- **Access:** Private/Admin
- **Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "type": "general",
  "priority": "medium",
  "isActive": true
}
```

### Delete Notice
- **DELETE** `/api/notices/:id`
- **Access:** Private/Admin

---

## Room Routes (`/api/rooms`)

### Get All Rooms
- **GET** `/api/rooms`
- **Access:** Private/Admin

### Get Single Room
- **GET** `/api/rooms/:id`
- **Access:** Private/Admin

### Create Room
- **POST** `/api/rooms`
- **Access:** Private/Admin
- **Body:**
```json
{
  "hostelBlock": "A",
  "roomNumber": "A01",
  "capacity": 2,
  "monthlyRent": 20000,
  "facilities": ["WiFi", "Attached Bathroom", "Study Table"]
}
```

### Update Room
- **PUT** `/api/rooms/:id`
- **Access:** Private/Admin

### Delete Room
- **DELETE** `/api/rooms/:id`
- **Access:** Private/Admin

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Status Codes

- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Internal Server Error

---

## Payment Statuses

- `pending` - Awaiting admin approval
- `success` - Approved by admin
- `rejected` - Rejected by admin
- `failed` - Payment processing failed

---

## Notice Types

- `general` - General announcements
- `urgent` - Urgent notices
- `maintenance` - Maintenance updates
- `event` - Event notifications
- `payment` - Payment reminders

---

## Priority Levels

- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority

---

## File Uploads

### Bank Slip Upload
- **Endpoint:** `/api/payments`
- **Field name:** `bankSlip`
- **Allowed formats:** JPG, JPEG, PNG, PDF
- **Max size:** 5MB
- **Storage:** `/uploads/payments/`

### Access Uploaded Files
- **URL:** `http://localhost:5000/uploads/payments/filename.jpg`

---

## Notes

1. All dates should be in ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`
2. The admin credentials are hardcoded: `username: Hostel`, `password: H123`
3. Payment amount is fixed at Rs. 20,000
4. Each room can accommodate 2 students maximum
5. Students are automatically assigned rooms upon registration
6. JWT tokens expire after 30 days (configurable in `.env`)
