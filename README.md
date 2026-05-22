# 🛍️ Chibudom's E-Commerce Product API

A focused, production-ready product REST API built with **Node.js**, **Express**, and **SQLite** for my school New Horizon project (via `better-sqlite3`). No database server required — SQLite creates a local `store.db` file automatically on first run.

---

## Tech Stack

| Layer      | Technology           |
|------------|----------------------|
| Runtime    | Node.js              |
| Framework  | Express.js           |
| Database   | SQLite (better-sqlite3) |
| Auth       | JWT (jsonwebtoken)   |
| Passwords  | bcryptjs             |
| Validation | express-validator    |

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Glxtchman/ecommerce-product-api.git
cd product-api
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Run

```bash
npm run dev    # development (nodemon)
npm start      # production
```

The SQLite database (`store.db`) is created automatically. No setup needed.

---

## Folder Structure

```
product-api/
├── config/
│   └── db.js                 # SQLite connection + table creation
├── controllers/
│   ├── authController.js
│   └── productController.js
├── middleware/
│   ├── auth.js               # JWT protect + role guard
│   ├── errorHandler.js
│   └── validate.js
├── routes/
│   ├── authRoutes.js
│   └── productRoutes.js
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## API Endpoints

> **Base URL:** `http://localhost:5000/api`
> **Auth header:** `Authorization: Bearer <token>`

---

### 🔐 Auth — `/api/auth`

| Method | Endpoint    | Access  | Description                  |
|--------|-------------|---------|------------------------------|
| POST   | `/register` | Public  | Register a new user          |
| POST   | `/login`    | Public  | Login and receive JWT token  |
| GET    | `/me`       | Private | Get the logged-in user       |
| POST   | `/logout`   | Private | Logout confirmation          |

#### Register
```json
POST /api/auth/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response includes a `token` — save this for protected requests.**

---

### 📦 Products — `/api/products`

| Method | Endpoint | Access  | Description                         |
|--------|----------|---------|-------------------------------------|
| GET    | `/`      | Public  | Get all products (search & filter)  |
| GET    | `/:id`   | Public  | Get a single product by ID          |
| POST   | `/`      | Admin   | Create a new product                |
| PUT    | `/:id`   | Admin   | Update a product                    |
| DELETE | `/:id`   | Admin   | Delete a product                    |

#### Query Parameters for `GET /api/products`

| Param      | Type   | Example              | Description                    |
|------------|--------|----------------------|--------------------------------|
| `keyword`  | string | `?keyword=phone`     | Search name, description, brand |
| `category` | string | `?category=phones`   | Filter by category             |
| `brand`    | string | `?brand=Samsung`     | Filter by brand                |
| `minPrice` | number | `?minPrice=50`       | Minimum price filter           |
| `maxPrice` | number | `?maxPrice=500`      | Maximum price filter           |
| `featured` | bool   | `?featured=true`     | Only featured products         |
| `page`     | number | `?page=2`            | Page number (default: 1)       |
| `limit`    | number | `?limit=5`           | Results per page (default: 10) |

#### Create Product (Admin)
```json
POST /api/products
Authorization: Bearer <admin_token>

{
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling headphones",
  "price": 149.99,
  "stock": 50,
  "category": "electronics",
  "brand": "SoundMax",
  "imageUrl": "https://example.com/headphones.jpg",
  "isFeatured": true
}
```

#### Update Product (Admin)
```json
PUT /api/products/1
Authorization: Bearer <admin_token>

{
  "price": 129.99,
  "stock": 45
}
```

---

## Roles

| Role       | Can do                                      |
|------------|---------------------------------------------|
| `customer` | Register, login, browse products            |
| `admin`    | Everything above + create/update/delete products |

> To create an admin account, manually update the role in `store.db`:
> ```sql
> UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
> ```
> Or use a SQLite viewer like [DB Browser for SQLite](https://sqlitebrowser.org/).

---

## Error Format

```json
{ "success": false, "message": "Error description" }
```

Validation errors:
```json
{
  "success": false,
  "errors": [{ "msg": "Price must be a positive number", "path": "price" }]
}
```

---

## Testing with Postman

1. `POST /api/auth/register` — create an account
2. `POST /api/auth/login` — copy the `token` from the response
3. In Postman: **Authorization tab → Bearer Token → paste token**
4. Hit any protected route

---

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: E-Commerce Product API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/product-api.git
git push -u origin main
```

---

## License

MIT
