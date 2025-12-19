import DashboardService from '../Services/dashboard.service.js';

const DashboardController = {
  summary: async (req, res, next) => {
    try {
      const from = String(req.query.from || '');
      const to = String(req.query.to || '');
      const currency = String(req.query.currency || 'LKR');

      const data = await DashboardService.summary({ from, to, currency });
      res.json(data);
    } catch (e) {
      next(e);
    }
  },
};

export default DashboardController;
