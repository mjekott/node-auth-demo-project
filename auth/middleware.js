const jwt = require('jsonwebtoken');

const checkTokenSetUser = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
          console.log(error);
        }
        req.user = user;
        next();
      });
    } else {
      next();
    }

    next();
  } else {
    next();
  }
};

module.exports = {
  checkTokenSetUser,
};
