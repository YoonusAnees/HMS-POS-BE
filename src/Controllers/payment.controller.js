import PaymentService from '../Services/payment.service.js';

const PaymentController = {
  create: async (req, res, next) => {
    try {
      const createdById = req.user.sub;
      const result = await PaymentService.createPayment(req.body, createdById);
      res.status(201).json({ message: 'Payment created', ...result });
    } catch (err) {
      next(err);
    }
  },
};

export default PaymentController;
