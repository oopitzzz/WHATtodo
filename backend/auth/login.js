const authService = require('../_lib/services/authService');
const corsMiddleware = require('../_lib/middleware/cors');
const errorHandler = require('../_lib/middleware/errorHandler');

module.exports = async (req, res) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return corsMiddleware(req, res, () => {
      res.status(200).end();
    });
  }

  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_REQUIRED_FIELDS',
            message: '이메일과 비밀번호를 입력해주세요'
          }
        });
      }

      const result = await authService.login({ email, password });

      res.status(200).json(result);
    } catch (err) {
      errorHandler(err, req, res);
    }
  });
};
