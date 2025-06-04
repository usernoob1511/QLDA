# QLDA E-commerce Project

A full-stack e-commerce platform built with TypeScript, Node.js, Express, SQL Server, React, and Tailwind CSS.

## Features

- 🛍️ Product browsing with filtering and pagination
- 🔐 Secure user authentication with JWT
- 🛒 Real-time cart management
- 💳 VNPay payment integration
- 📧 Email notifications for orders
- 📱 Responsive design for all devices
- 👤 User profile management
- 🛡️ Role-based access control
- 📦 Order tracking and management

## Project Structure

```
QLDA_project/
├── src/
│   ├── backend/           # Express.js + Sequelize backend
│   │   ├── src/
│   │   │   ├── config/   # Configuration files
│   │   │   ├── models/   # Sequelize models
│   │   │   ├── routes/   # API routes
│   │   │   ├── controllers/ # Route controllers
│   │   │   └── middleware/ # Express middleware
│   │   └── tests/        # Backend tests
│   └── frontend/         # React + Tailwind frontend
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── pages/     # Page components
│       │   ├── hooks/     # Custom React hooks
│       │   ├── services/  # API services
│       │   └── types/     # TypeScript types
│       └── tests/        # Frontend tests
├── docs/                # Documentation
└── tasks/              # Project management tasks
```

## Prerequisites

- Node.js (v14 or higher)
- SQL Server
- Windows Authentication enabled for SQL Server
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/QLDA_project.git
cd QLDA_project
```

2. Install dependencies for both backend and frontend:
```bash
# Install backend dependencies
cd src/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:

Create `.env` files in both `src/backend` and `src/frontend` directories:

Backend `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_NAME=QLDA_DB
TEST_DB_NAME=QLDA_TEST
JWT_SECRET=your_jwt_secret
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
SENDGRID_API_KEY=your_sendgrid_api_key
```

Frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Initialize the database:
```bash
cd src/backend
npm run db:sync
```

## Running the Application

1. Start the backend server:
```bash
cd src/backend
npm run dev
```

2. Start the frontend development server:
```bash
cd src/frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Product Endpoints

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart Endpoints

- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart

### Order Endpoints

- `POST /api/orders` - Create order
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Payment Endpoints

- `POST /api/payment/create` - Create VNPay payment URL
- `GET /api/payment/vnpay_return` - Handle VNPay payment return
- `POST /api/payment/vnpay_ipn` - Handle VNPay IPN

## Testing

Run the test suite:
```bash
cd src/backend
npm test
```

For frontend tests:
```bash
cd src/frontend
npm test
```

## Documentation

- [User Manual](docs/user-manual.md) - Detailed guide for using the application
- [API Documentation](docs/api-docs.md) - Detailed API documentation
- [Development Guide](docs/development.md) - Guide for developers

## Security Features

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation
- SQL injection protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 