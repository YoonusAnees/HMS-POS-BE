// src/models/room.model.js
import prisma from '../Config/db.js';

const RoomModel = {
  list: () => prisma.room.findMany(),
  create: (data) => prisma.room.create({ data }),
  update: (id, data) => prisma.room.update({ where: { id }, data }),
};

export default RoomModel;
