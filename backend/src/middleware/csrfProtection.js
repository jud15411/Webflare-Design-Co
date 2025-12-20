const verifyCsrf = (req, res, next) => {
  const csrfCookie = req.cookies['XSRF-TOKEN'];
  const csrfHeader = req.headers['x-xsrf-token'];

  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return res.status(403).json({
      message: 'Invalid or missing CSRF token',
      debug: { cookiePresent: !!csrfCookie, headerPresent: !!csrfHeader },
    });
  }
  next();
};

module.exports = verifyCsrf;
