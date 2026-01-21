🛒 E-Commerce Backend API

A full-featured E-Commerce Backend REST API built with Node.js, Express.js, MongoDB, and JWT authentication.
This project demonstrates real-world backend concepts like authentication, role-based access control, cart management, order processing, and product filtering.

---

🚀 Features

🔐 Authentication & Authorization

- User Registration & Login
- JWT-based authentication
- Role-based access (Admin / Customer)

📦 Products

- Create, update, delete products (Admin only)
- Get all products (Public)
- Stock validation (cannot be negative)
- Search, filter, sort, and pagination

🛒 Cart

- Add products to cart
- Update product quantity
- Remove products from cart
- User-specific cart

📑 Orders

- Place order from cart
- Stock validation before checkout
- Clear cart after successful order
- View own orders (Customer)
- View all orders & update order status (Admin)

---

🛠 Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT (JSON Web Token)
- bcrypt
- Postman (API Testing)

---
Security

- helmet
- cors
- express-rate-limit


---
🔑 Environment Variables

Create a ".env" file in the root directory:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

---

▶️ Run Locally

# Install dependencies
npm install

# Run server
npm run dev

Server will run on:

http://localhost:3000

---

📌 API Endpoints

Auth

- "POST /api/auth/register"
- "POST /api/auth/login"

Products

- "GET /api/products"
- "POST /api/products" (Admin)
- "PATCH /api/products/:id" (Admin)
- "DELETE /api/products/:id" (Admin)

Cart

- "POST /api/cart"
- "GET /api/cart"
- "PATCH /api/cart/:productId"
- "DELETE /api/cart/:productId"

Orders

- "POST /api/orders"
- "GET /api/orders/my"
- "GET /api/orders" (Admin)
- "PATCH /api/orders/:id" (Admin)

---

🔍 Product Query Examples

GET /api/products?search=iphone
GET /api/products?category=electronics
GET /api/products?sort=-price
GET /api/products?page=2&limit=10

---

🎯 Key Learnings

- JWT Authentication & Authorization
- RESTful API design
- MongoDB relationships & population
- Real-world e-commerce business logic
- Clean folder structure & scalability


---

👨‍💻 Author

Datt Patel
