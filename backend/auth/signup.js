const authService = require('../_lib/services/authService');
const corsMiddleware = require('../_lib/middleware/cors');
const errorHandler = require('../_lib/middleware/errorHandler');

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    try {
      const { email, password, nickname } = req.body;

      if (!email || !password || !nickname) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_REQUIRED_FIELDS',
            message: '필수 입력값이 누락되었습니다'
          }
        });
      }

      const result = await authService.signup({ email, password, nickname });

      res.status(201).json(result);
    } catch (err) {
      errorHandler(err, req, res);
    }
  });
};
