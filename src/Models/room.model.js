// src/models/room.model.js
import prisma from '../Config/db.js';

const RoomModel = {
  list: () => prisma.room.findMany(),

  getById: (id) =>
    prisma.room.findUnique({ where: { id } }),

  listVacant: () =>
    prisma.room.findMany({ where: { status: 'vacant' } }),

  listOccupied: () =>
    prisma.room.findMany({ where: { status: 'occupied' } }),

  listOutOfOrder: () =>
    prisma.room.findMany({ where: { status: 'out_of_order' } }),

  create: (data) =>
    prisma.room.create({ data }),

  createMany: (dataArray) =>
    prisma.room.createMany({ data: dataArray }),

  update: (id, data) =>
    prisma.room.update({ where: { id }, data }),

  setStatus: (id, status) =>
    prisma.room.update({
      where: { id },
      data: { status }
    }),
};

export default RoomModel;
