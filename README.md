# Hotel POS Backend

Node.js + Express + Prisma + PostgreSQL backend for the **Hotel POS System**.

This service provides REST API endpoints for:
- User authentication & roles (admin/manager/cashier/reception)
- Menu management (categories & items)
- Restaurant tables & hotel rooms
- Orders (dine‑in, takeaway, room service)
- Payments & billing

---

## 🔧 Tech Stack

- **Node.js**  
- **Express.js**  
- **Prisma ORM**  
- **PostgreSQL**  
- **JWT Auth**  
- **bcryptjs**, **dotenv**, **cors**

---

## 📁 Project Structure

```
backend/
  .env
  .env.example
  package.json
  prisma/
    schema.prisma
  src/
    config/
      db.js
    middleware/
      auth.middleware.js
      error.middleware.js
    utils/
      calcTotals.js
    models/
      *.model.js
    services/
      *.service.js
    controllers/
      *.controller.js
    routes/
      *.routes.js
      index.js
    server.js
```

Pattern used:  
**Route → Controller → Service → Model → DB**

---

## ⚙️ Setup Instructions

### 1️⃣ Install dependencies
```
npm install
```

### 2️⃣ Create `.env` file (based on `.env.example`)
```
DATABASE_URL="postgresql://user:password@localhost:5432/hotel_pos"
JWT_SECRET="your-secret-key"
PORT=4000
```

### 3️⃣ Prisma setup
```
npx prisma generate
npx prisma migrate dev --name init
```

### 4️⃣ Run the backend
```
npm run dev
```

API available at:  
`http://localhost:4000/api`

---

## 🔐 Authentication

### Login
```
POST /api/users/login
```
Use returned token in all protected routes:

```
Authorization: Bearer <token>
```

---

## 📚 API Endpoints

### 👤 Users
```
POST /api/users/login
POST /api/users/register      (admin)
GET  /api/users               (admin, manager)
```

### 🧾 Categories
```
GET /api/categories
POST /api/categories          (admin, manager)
PUT /api/categories/:id       (admin, manager)
DELETE /api/categories/:id    (admin)
```

### 🍽 Items
```
GET /api/items
POST /api/items               (admin, manager)
PUT /api/items/:id            (admin, manager)
DELETE /api/items/:id         (admin)
```

### 🪑 Restaurant Tables
```
GET /api/tables
POST /api/tables              (admin, manager)
PUT /api/tables/:id           (admin, manager)
```

### 🏨 Rooms
```
GET /api/rooms
POST /api/rooms               (admin, manager)
PUT /api/rooms/:id            (admin, manager)
```

### 📦 Orders
```
GET  /api/orders/open
GET  /api/orders/:id
POST /api/orders
POST /api/orders/:id/items
```

### 💰 Payments
```
POST /api/payments
```

---

## 🧪 Testing With Postman

1. Log in  
2. Copy the JWT token  
3. Use it in:

```
Authorization: Bearer <token>
```

Optional: Ask for **HMS.postman_collection.json**

---

## 🧠 Business Rules Summary

- Orders start in **open** state  
- Payments change order to **closed**  
- Totals use `calcTotals.js`  
- Prisma transactions ensure atomic order creation  
- Only admins can delete entities  

---

## 📌 Next Improvements (Optional)

- Add Zod/Joi validation  
- Add reporting endpoints  
- Add activity logs  
- Implement soft deletes  
