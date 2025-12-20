const verifyCsrf = (req, res, next) => {
  const csrfCookie = req.cookies['XSRF-TOKEN'];
  const csrfHeader = req.headers['x-xsrf-token'];

  console.log('--- CSRF DEBUG START ---');
  console.log('Path:', req.path);
  console.log('CSRF Cookie Present:', !!csrfCookie);
  console.log('CSRF Header Present:', !!csrfHeader);

  if (csrfCookie && csrfHeader) {
    console.log('Tokens Match:', csrfCookie === csrfHeader);
  } else {
    console.log(
      'Missing component - Cookie:',
      csrfCookie,
      'Header:',
      csrfHeader
    );
  }
  console.log('--- CSRF DEBUG END ---');

  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return res.status(403).json({
      message: 'Invalid or missing CSRF token',
      debug: { cookiePresent: !!csrfCookie, headerPresent: !!csrfHeader },
    });
  }
  next();
};

module.exports = verifyCsrf;
