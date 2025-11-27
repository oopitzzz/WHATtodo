const authService = require('../_lib/services/authService');
const corsMiddleware = require('../_lib/middleware/cors');
const errorHandler = require('../_lib/middleware/errorHandler');

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_REQUIRED_FIELDS',
            message: 'Refresh token이 필요합니다'
          }
        });
      }

      const result = await authService.refresh(refreshToken);

      res.status(200).json(result);
    } catch (err) {
      errorHandler(err, req, res);
    }
  });
};
