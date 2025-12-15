// src/routes/user.routes.js
const express = require('express');
const UserController = require('../Controllers/user.controller');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', auth(['admin']), UserController.register);
router.post('/login', UserController.login);
router.get('/', auth(['admin', 'manager']), UserController.list);

module.exports = router;
