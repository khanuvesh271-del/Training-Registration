import cds from '@sap/cds';
import session from 'express-session';
import express from 'express';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const createMockedUsers = require(
  '@sap/cds/lib/srv/middlewares/auth/mocked-users'
);

cds.on('bootstrap', (app) => {
  app.use(express.json());

  app.use(session({
    secret: process.env.SESSION_SECRET || 'training-demo-only-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: 'auto'
    }
  }));

  const users = createMockedUsers(cds.requires.auth);

  app.post('/demo-login', (req, res) => {
    const { username, password } = req.body || {};
    const user = users.verify(username, password);

    if (!user || user.failed) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    req.session.user = user.id;

    res.json({
      username: user.id,
      roles: user.roles || []
    });
  });

  app.post('/demo-logout', (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.sendStatus(204);
    });
  });
});

export default cds.server;