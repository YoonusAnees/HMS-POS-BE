import ManagerReportService from '../Services/managerReport.service.js';


const ManagerReportController = {
  ManagerSummery: async (req, res, next) => {
  try {
    const from = String(req.query.from || '');
    const to = String(req.query.to || '');
    const currency = String(req.query.currency || 'LKR');

    const data = await ManagerReportService.summary({ from, to, currency });
    res.json(data);
  } catch (e) {
    next(e);
  }}


};

export default ManagerReportController;