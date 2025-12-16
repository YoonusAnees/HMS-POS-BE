// src/services/category.service.js
import CategoryModel from '../Models/category.model.js';

const CategoryService = {
    list: () => CategoryModel.list(),
    listActive: () => CategoryModel.listActive(),
    create: (payload) => CategoryModel.create(payload),
    createMany: (payloadArray) => CategoryModel.createMany(payloadArray),
    update: (id, payload) => CategoryModel.update(id, payload),
    remove: (id) => CategoryModel.remove(id),
    setStatus: (id, isActive) => CategoryModel.setStatus(id, isActive),
};

export default CategoryService;
