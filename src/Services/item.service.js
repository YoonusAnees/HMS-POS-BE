// src/services/item.service.js
import { create } from 'domain';
import ItemModel from '../Models/item.model.js';

const ItemService = {
  list: () => ItemModel.list(),
  create: (payload) => ItemModel.create(payload),
  createMany: (payloadArray) => ItemModel.createMany(payloadArray),
  update: (id, payload) => ItemModel.update(id, payload),
  remove: (id) => ItemModel.remove(id),
  setStatus: (id, isActive) => ItemModel.setStatus(id, isActive)
};

export default ItemService;