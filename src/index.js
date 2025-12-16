// src/routes/index.js
import express from 'express';
import userRoutes from './Routes/user.routes.js';
import categoryRoutes from './Routes/category.routes.js';

const router = express.Router();

// auth endpoints
router.use('/auth', userRoutes);

// user management endpoints
router.use('/users', userRoutes);

//Category endpoints
router.use('/categories', categoryRoutes);


export default router;
