# Secure E-commerce Platform- SMW Super

A modern, secure e-commerce web application built with Node.js, Express.js, React, and MongoDB. This project implements Auth0 authentication with session management and addresses OWASP Top 10 security vulnerabilities.

## 🚀 Features

- **Secure Authentication**: Auth0 integration with Passport.js and session-based authentication
- **Product Catalog**: Browse and search products with detailed information
- **Order Management**: Place orders with delivery scheduling (excluding Sundays)
- **User Profiles**: Manage user information and view order history
- **Admin Functionality**: Admin users can manage products via API endpoints
- **Security**: OWASP Top 10 compliance with comprehensive security measures
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Auth0 with Passport.js
- **Session Management**: express-session with MongoDB store
- **Security**: Helmet, CORS, Rate limiting, Input validation

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API
- **Styling**: CSS3 with responsive design

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB** (v5.0 or higher) or MongoDB Atlas account
- **Git** for version control

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/SandaruUOK/IS-project
cd backend/IS_project
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 4. Auth0 Configuration

1. **Create Auth0 Account**: Sign up at [auth0.com](https://auth0.com)

2. **Create Application**:
   - Go to Applications → Create Application
   - Choose "Regular Web Applications"
   - Select Node.js technology

3. **Configure Application Settings**:
   - **Allowed Callback URLs**: `http://localhost:5000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000/login`
   - **Allowed Web Origins**: `http://localhost:3000`

4. **Get Credentials**:
   - Note down Domain, Client ID, and Client Secret

### 5. MongoDB Setup

#### Option A: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Whitelist your IP address

#### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/secure-ecommerce`

## ⚙️ Environment Variables

### Backend Environment Variables

Create `backend/.env` file with the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/secure-ecommerce?retryWrites=true&w=majority

# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_CALLBACK_URL=http://localhost:5000/api/auth/callback

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters-long

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=12
```

### Frontend Environment Variables

Create `frontend/.env` file with the following variables:

```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server**:
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

2. **Start Frontend Development Server**:
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

### Production Mode

1. **Build Frontend**:
```bash
cd frontend
npm run build
```

2. **Start Backend in Production**:
```bash
cd backend
NODE_ENV=production npm start
```

## 🗄️ Database Setup

### 1. Seed Sample Data

```bash
cd backend
node scripts/seedProducts.js
```

### 2. Create Admin User

```bash
cd backend
node scripts/makeAdmin.js your-email@example.com
```

## 🔐 Security Features

This application implements comprehensive security measures:

- **Authentication**: Secure session-based authentication with Auth0
- **Authorization**: Role-based access control (User/Admin)
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: MongoDB sanitization
- **XSS Protection**: Input sanitization and CSP headers
- **CSRF Protection**: Session-based protection
- **Rate Limiting**: API endpoint protection
- **Secure Headers**: Helmet.js security headers
- **HTTPS**: SSL/TLS encryption (production)
- **Session Security**: HTTP-only cookies with secure flags

## 📱 API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate Auth0 login
- `GET /api/auth/callback` - Auth0 callback
- `GET /api/auth/check` - Check authentication status
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `GET /api/orders/my-orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/cancel` - Cancel order

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Using PM2 (Recommended for Production)

1. **Install PM2**:
```bash
npm install -g pm2
```

2. **Create PM2 Configuration** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'secure-ecommerce-backend',
    script: './backend/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

3. **Start with PM2**:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Using Docker

1. **Build and Run**:
```bash
docker-compose up --build
```

2. **For Production**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Troubleshooting

### Common Issues

1. **Auth0 Callback Error**:
   - Verify callback URL in Auth0 dashboard
   - Check CLIENT_SECRET is correct

2. **Database Connection Error**:
   - Verify MongoDB URI
   - Check network access (Atlas)
   - Ensure MongoDB service is running (local)

3. **CORS Errors**:
   - Verify FRONTEND_URL in backend .env
   - Check credentials: 'include' in frontend requests

4. **Session Issues**:
   - Verify SESSION_SECRET is set
   - Check MongoDB session store connection

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Auth0](https://auth0.com) for authentication services
- [OWASP](https://owasp.org) for security guidelines
- [MongoDB](https://mongodb.com) for database services
- [React](https://reactjs.org) and [Express.js](https://expressjs.com) communities

## 📧 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/secure-ecommerce-platform](https://github.com/yourusername/secure-ecommerce-platform)

---

**⚠️ Security Notice**: This application is designed for educational purposes. For production deployment, ensure all security measures are properly configured and regularly updated.