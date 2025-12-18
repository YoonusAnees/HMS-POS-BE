import ReportService from '../Services/report.service.js';

const ReportController = {
  eod: async (req, res, next) => {
    try {
      const date = String(req.query.date || '');
      if (!date) throw new Error('date is required (YYYY-MM-DD)');
      const currency = req.query.currency ? String(req.query.currency) : 'LKR';
      const report = await ReportService.endOfDay(date, currency);
      res.json(report);
    } catch (e) {
      next(e);
    }
  },
};

export default ReportController;
