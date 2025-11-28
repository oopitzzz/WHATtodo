const corsMiddleware = require('../_lib/middleware/cors');

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

    res.status(200).json({
      message: '로그아웃 되었습니다',
    });
  });
};
