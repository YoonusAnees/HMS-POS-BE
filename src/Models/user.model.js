// src/models/user.model.js
import prisma from '../Config/db.js';

const UserModel = {
  findById: (id) =>
    prisma.user.findUnique({ where: { id } }),

  findByUsername: (username) =>
    prisma.user.findUnique({ where: { username } }),

  create: (data) =>
    prisma.user.create({ data }),

  list: () =>
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    }),
};

export default UserModel;
