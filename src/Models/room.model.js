// src/models/room.model.js
const prisma = require('../Config/db');

const RoomModel = {
  list: () => prisma.room.findMany(),
  create: (data) => prisma.room.create({ data }),
  update: (id, data) => prisma.room.update({ where: { id }, data }),
};

export default RoomModel;
