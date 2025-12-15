// src/services/user.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../Models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const UserService = {
  async register({ username, password, fullName, email, role }) {
    const existing = await UserModel.findByUsername(username);
    if (existing) {
      throw new Error('Username already exists');
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      username,
      passwordHash: hash,
      fullName,
      email,
      role: role || 'cashier',
    });

    return user;
  },

  async login({ username, password }) {
    const user = await UserModel.findByUsername(username);
    if (!user) throw new Error('Invalid username or password');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('Invalid username or password');

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  },

  async list() {
    return UserModel.list();
  },
};

export default UserService;
