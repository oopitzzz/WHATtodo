function logger(req, res, next) {
  const startedAt = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    const status = res.statusCode;
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl || req.url} -> ${status} (${duration}ms)`);
  });

  next();
}

module.exports = logger;
