import ReportService from '../Services/report.service.js';

const ReportController = {
  eod: async (req, res, next) => {
    try {
    const date = String(req.query.date || '');
    const currency = String(req.query.currency || 'LKR');
    if (!date) throw new Error('date is required (YYYY-MM-DD)');

    const data = await ReportService.endOfDay(date, currency);
    res.json(data);
    } catch (e) {
      next(e);
    }
  },
};

export default ReportController;
