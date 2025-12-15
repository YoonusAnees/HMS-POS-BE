// src/routes/index.js
const express = require('express');
const userRoutes = require('./Routes/user.routes');


const router = express.Router();

router.use('/users', userRoutes);

module.exports = router;
