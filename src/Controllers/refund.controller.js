import RefundService from '../Services/refund.service.js';

const RefundController = {
  create: async (req, res, next) => {
    try {
      const createdById = req.user.sub;
      const result = await RefundService.createRefund(req.body, createdById);
      res.status(201).json({ message: 'Refund created', ...result });
    } catch (e) {
      next(e);
    }
  },
};

export default RefundController;
