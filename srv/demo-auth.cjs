const cds = require('@sap/cds');
const createMockedUsers = require('@sap/cds/lib/srv/middlewares/auth/mocked-users');

module.exports = function (options) {
  const users = createMockedUsers(options);

  return function demoAuth(req, res, next) {
    const username = req.session?.user;

    if (!username) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const user = users.users[username];

    if (!user) {
      return res.status(401).json({
        error: 'Invalid session'
      });
    }

    req.user = user;
    cds.context.user = user;

    return next();
  };
};