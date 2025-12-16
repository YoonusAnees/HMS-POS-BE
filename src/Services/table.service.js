// src/Services/table.service.js
import TableModel from '../Models/table.model.js';

const VALID_STATUSES = new Set(['free', 'occupied', 'reserved']);

const TableService = {
  list: () => TableModel.list(),
  listActive: () => TableModel.listActive(),

  async create(payload) {
    const code = String(payload.code || '').trim();
    if (!code) throw new Error('Table code is required');

    const capacity = Number(payload.capacity);
    if (!Number.isFinite(capacity) || capacity <= 0) {
      throw new Error('Capacity must be a positive number');
    }

    const status = payload.status ? String(payload.status) : 'free';
    if (!VALID_STATUSES.has(status)) {
      throw new Error('Invalid status. Use: free | occupied | reserved');
    }

    return TableModel.create({
      code,
      capacity,
      status,
      isActive: payload.isActive ?? true,
    });
  },

  async bulkCreate(payloadArray) {
    if (!Array.isArray(payloadArray)) {
      throw new Error('Body must be an array of tables');
    }

    const data = payloadArray.map((t) => {
      const code = String(t.code || '').trim();
      const capacity = Number(t.capacity);

      const status = t.status ? String(t.status) : 'free';
      if (!VALID_STATUSES.has(status)) {
        throw new Error(`Invalid status for table ${code || '(no-code)'}: ${status}`);
      }

      if (!code) throw new Error('Each table needs a code');
      if (!Number.isFinite(capacity) || capacity <= 0) {
        throw new Error(`Invalid capacity for table ${code}`);
      }

      return {
        code,
        capacity,
        status,
        isActive: t.isActive ?? true,
      };
    });

    return TableModel.createMany(data);
  },

  async update(id, payload) {
    const data = {};

    if (payload.code !== undefined) data.code = String(payload.code).trim();

    if (payload.capacity !== undefined) {
      const capacity = Number(payload.capacity);
      if (!Number.isFinite(capacity) || capacity <= 0) {
        throw new Error('Capacity must be a positive number');
      }
      data.capacity = capacity;
    }

    if (payload.status !== undefined) {
      const status = String(payload.status);
      if (!VALID_STATUSES.has(status)) {
        throw new Error('Invalid status. Use: free | occupied | reserved');
      }
      data.status = status;
    }

    if (payload.isActive !== undefined) data.isActive = Boolean(payload.isActive);

    return TableModel.update(id, data);
  },

  async setStatus(id, status) {
    status = String(status);
    if (!VALID_STATUSES.has(status)) {
      throw new Error('Invalid status. Use: free | occupied | reserved');
    }
    return TableModel.setStatus(id, status);
  },

  async setActive(id, isActive) {
    return TableModel.setActive(id, Boolean(isActive));
  },

  async getById(id) {
    const table = await TableModel.findById(id);
    if (!table) throw new Error('Table not found');
    return table;
  },

  // OPTIONAL
  async remove(id) {
    await TableModel.remove(id);
    return { message: 'Table deleted' };
  },
};

export default TableService;
