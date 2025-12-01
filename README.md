# 🛒 Real-Time Order Management System

A complete backend system with authentication, order management, payment integration (Stripe), real-time notifications (Socket.io), and AI chatbot.

## ✨ Features

- ✅ **JWT Authentication** - Secure user registration and login
- ✅ **Order Management** - MongoDB integration with Prisma ORM
- ✅ **Stripe Payment** - Payment Intent and Webhook
- ✅ **Payment Webhooks** - Secure webhook handling (payment status cannot be updated from frontend)
- ✅ **Real-time Updates** - Instant notifications with Socket.io
- ✅ **AI Chatbot** - HuggingFace Free API integration
- ✅ **Admin Panel** - Order status management
- ✅ **TypeScript** - Type-safe codebase
- ✅ **Validation** - Zod schema validation
- ✅ **Error Handling** - Centralized error handler
- ✅ **Rate Limiting** - API protection
- ✅ **Docker Support** - Easy deployment

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB
- **ORM:** Prisma
- **Real-time:** Socket.io
- **Payment:** Stripe
- **AI:** HuggingFace (google/flan-t5-base)
- **Authentication:** JWT + bcrypt
- **Validation:** Zod

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Stripe Account
- HuggingFace API Key (free)

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/tanzimsiamm/Order-X.git
cd Order-X
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Then update the `.env` file with your credentials.

# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=mongodb+srv://order-x:yh8xBDpKe61xJRES@cluster0.hyv0wnb.mongodb.net/order-x?appName=Cluster0

# JWT
JWT_SECRET=secret
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_51OBfrIDITPfpX7OJWEZmGoDSyNxy9B0TFhOmwFq7tRSfPFhjorLcSY2EGS5tBtZDcpGagufd74t4IGjDxJmOhUDu00yiDOru7X
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret


# HuggingFace
HUGGINGFACE_API_KEY=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

# Frontend URL
FRONTEND_URL=http://localhost:3000

### 4. Prisma Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to MongoDB
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Server will run at: `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Orders

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "title": "Gaming Keyboard",
      "price": 120,
      "quantity": 1
    },
    {
      "title": "Gaming Mouse",
      "price": 80,
      "quantity": 2
    }
  ],
  "paymentMethod": "stripe"
}
```

Response (Stripe):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "...",
      "userId": "...",
      "items": [...],
      "totalAmount": 280,
      "paymentMethod": "STRIPE",
      "paymentStatus": "PENDING",
      "orderStatus": "PENDING"
    },
    "payment": {
      "clientSecret": "pi_xxx_secret_xxx",
      "paymentIntentId": "pi_xxx"
    }
  }
}
```

#### Get User Orders
```http
GET /orders
Authorization: Bearer <token>
```

#### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Payment Webhooks

#### Stripe Webhook
```http
POST /payment/webhook/stripe
stripe-signature: <signature>
Content-Type: application/json

[Stripe webhook payload]
```

### AI Chatbot

#### Chat
```http
POST /chatbot
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Which product is best for gaming?"
}
```

Response:
```json
{
  "success": true,
  "message": "Response generated successfully",
  "data": {
    "reply": "For gaming, I recommend the Gaming Mouse X500 with fast response times...",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Get Chat History
```http
GET /chatbot/history?limit=10
Authorization: Bearer <token>
```

### Admin (Requires ADMIN role)

#### Update Order Status
```http
PATCH /admin/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderStatus": "SHIPPED"
}
```

#### Get All Orders
```http
GET /admin/orders?page=1&limit=20
Authorization: Bearer <token>
```

## 🔌 Socket.io Connection

### Client Example (JavaScript)

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});

// Listen for order updates
socket.on('orderUpdate', (data) => {
  console.log('Order updated:', data);
  // data = {
  //   orderId: "...",
  //   paymentStatus: "PAID",
  //   orderStatus: "PROCESSING",
  //   message: "Payment successful! Your order is now being processed."
  // }
});

// Connection status
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

🐳 Docker Deployment Guide
🔧 Build & Run Locally
# Build Docker image
docker build -t orderx-app .

# Run container with environment variables
docker run -p 5000:5000 --env-file .env orderx-app

📦 Using Docker Compose (Local Development)
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d --build

# View live logs
docker-compose logs -f

# Stop and remove containers
docker-compose down

## ☁️ Cloud Deployment

🌐 Deploying to Render (Docker)

Render automatically detects your Dockerfile and builds the production image.

Push your project to GitHub

Create a New Web Service on Render

Select environment: Docker

Add your environment variables (DATABASE_URL, JWT, Stripe keys, etc.)

Deploy

Render will run the container using:

ENTRYPOINT ["docker-entrypoint.sh"]


## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **bcrypt** - Password hashing with salt
- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - API abuse prevention
- **Webhook Verification** - Stripe signature verification
- **Input Validation** - Zod schema validation
- **Error Handling** - No sensitive data leak

## 🎯 Key Highlights

### Payment Security
- Payment status is updated **only from webhooks**
- Payment status from frontend is never trusted
- Stripe webhook signature is verified

### Real-time Updates
- Socket.io connection is established as soon as user logs in
- Instant notification when payment is successful
- Instant notification when admin updates order status
- Socket.io authentication with JWT token

### AI Chatbot
- Completely **FREE** HuggingFace API
- Maintains last 3 messages for memory/context
- Fallback responses if API fails
- Chat history is saved in database

## 🐛 Troubleshooting

### Prisma Issues

```bash
# Reset Prisma
npx prisma generate
npx prisma db push --force-reset
```

### Socket.io Connection Failed

- Check if JWT token is correct
- Check CORS configuration
- Verify if Frontend URL in `.env` is correct

### Payment Webhook Not Working

**Stripe:**
- Check if webhook secret is correct
- Test locally with Stripe CLI
- Add webhook endpoint from Stripe Dashboard in production

### HuggingFace API Errors

- Check if API key is valid
- Check if rate limit has been exceeded
- Fallback response system will handle automatically

## 📊 Database Schema

### User
- id (ObjectId)
- email (unique)
- password (hashed)
- name
- role (USER | ADMIN)
- orders (relation)
- chatMessages (relation)

### Order
- id (ObjectId)
- userId (relation)
- items (array)
- totalAmount
- paymentMethod STRIPE
- paymentStatus (PENDING | PAID | FAILED)
- orderStatus (PENDING | PROCESSING | SHIPPED | DELIVERED)
- stripePaymentIntentId

### ChatMessage
- id (ObjectId)
- userId (relation)
- message
- response
- createdAt

## 📝 Testing Checklist

- [ ] User registration works
- [ ] User login returns JWT token
- [ ] Create order with Stripe
- [ ] Stripe webhook updates payment status
- [ ] Socket.io sends real-time notifications
- [ ] AI chatbot responds correctly
- [ ] Admin can update order status
- [ ] Rate limiting works
- [ ] Error handling works properly

## 👨‍💻 Developer Notes

### Creating an Admin User

You need to manually set a user's role to ADMIN in the database:

```javascript
// Using Prisma Studio or MongoDB Compass
db.User.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

### Testing Payments

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ by Tanjim Siddiki Siyam

**Live Demo:** https://order-x.onrender.com/health

**GitHub:** https://github.com/tanzimsiamm/Order-X

**Contact:** tanjim.siyam.tech@gmail.com