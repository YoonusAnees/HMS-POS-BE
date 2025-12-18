import PaymentService from '../Services/payment.service.js';

const PaymentController = {
  create: async (req, res, next) => {
    try {
      const payment = await PaymentService.create(
        req.body,
        req.user.sub
      );
      res.status(201).json(payment);
    } catch (err) {
      next(err);
    }
  },

  listByOrder: async (req, res, next) => {
    try {
      const payments = await PaymentService.listByOrder(
        Number(req.params.orderId)
      );
      res.json(payments);
    } catch (err) {
      next(err);
    }
  },
};

export default PaymentController;
