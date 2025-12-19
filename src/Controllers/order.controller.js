import OrderService from '../Services/order.service.js';

const OrderController = {
  // create: async (req, res, next) => {
  //   try {
  //     const order = await OrderService.create(req.body, req.user.sub);
  //     res.status(201).json(order);
  //   } catch (err) {
  //     next(err);
  //   }
  // },

  // getById: async (req, res, next) => {
  //   try {
  //     const order = await OrderService.getById(Number(req.params.id));
  //     res.json(order);
  //   } catch (err) {
  //     next(err);
  //   }
  // },

  // listOpen: async (req, res, next) => {
  //   try {
  //     const orders = await OrderService.listOpen();
  //     res.json(orders);
  //   } catch (err) {
  //     next(err);
  //   }
  // },

  // close: async (req, res, next) => {
  //   try {
  //     const order = await OrderService.closeOrder(
  //       Number(req.params.id),
  //       req.user.sub
  //     );
  //     res.json(order);
  //   } catch (err) {
  //     next(err);
  //   }
  // },


    create: async (req, res, next) => {
    try {
      const openedById = req.user.sub; // from JWT
      const order = await OrderService.createOrder(req.body, openedById);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  },

  addItem: async (req, res, next) => {
    try {
      const orderId = Number(req.params.id);
      const order = await OrderService.addItem(orderId, req.body);
      res.json(order);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const order = await OrderService.getById(id);
      res.json(order);
    } catch (err) {
      next(err);
    }
  },

  listOpen: async (req, res, next) => {
    try {
      const orders = await OrderService.listOpen();
      res.json(orders);
    } catch (err) {
      next(err);
    }
  },

  listAll: async (req, res, next) => {
    try {
      const orders = await OrderService.listAll();
      res.json(orders);
    } catch (err) {
      next(err);
    }   },
};

export default OrderController;
