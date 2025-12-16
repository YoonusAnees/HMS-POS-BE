// src/services/room.service.js
import RoomModel from '../Models/room.model.js';

const VALID_STATUSES = ['vacant', 'occupied', 'out_of_order'];

const RoomService = {
  list: () => RoomModel.list(),

  listVacant: () => RoomModel.listVacant(),

  listOccupied: () => RoomModel.listOccupied(),

  listOutOfOrder: () => RoomModel.listOutOfOrder(),

  create: (payload) => {
    // default status if not provided
    return RoomModel.create({
      status: payload.status || 'vacant',
      ...payload
    });
  },

 bulkCreate: (rooms) => {
  const data = rooms.map(room => ({
    status: room.status || 'vacant',
    ...room
  }));
  return RoomModel.createMany(data);
},



  update: (id, payload) => RoomModel.update(id, payload),

  setStatus: (id, status) => {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error('Invalid room status');
    }
    return RoomModel.setStatus(id, status);
  },
};

export default RoomService;
