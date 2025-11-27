const corsMiddleware = require('../_lib/middleware/cors');

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    res.status(200).json({
      message: '로그아웃 되었습니다',
    });
  });
};
