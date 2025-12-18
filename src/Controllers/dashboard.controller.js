import DashboardService from '../Services/dashboard.service.js';

const DashboardController = {
  summary: async (req, res, next) => {
    try {
      const from = String(req.query.from || '');
      const to = String(req.query.to || '');
      if (!from || !to) throw new Error('from and to are required (YYYY-MM-DD)');
      const data = await DashboardService.summary(from, to);
      res.json(data);
    } catch (e) {
      next(e);
    }
  },
};

export default DashboardController;
