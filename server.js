
import cds from '@sap/cds';
import session from 'express-session';
import express from 'express';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const createMockedUsers = require(
  '@sap/cds/lib/srv/middlewares/auth/mocked-users'
);

cds.on('bootstrap', (app) => {

  // Middleware
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

  // Mocked users
  const users = createMockedUsers(cds.requires.auth);

  // Check current logged-in user's session and role
  app.get('/demo-session', (req, res) => {
    res.json({
      username: req.session.user || null,
      isAdmin: Boolean(req.session.roles?.admin)
    });
  });

  // Protect Admin Dashboard
  app.use('/training-admin-dashboard', (req, res, next) => {
    if (!req.session.user || !req.session.roles?.admin) {
      return res.status(403).send(
        'Access denied: Admin privileges required.'
      );
    }

    next();
  });

  // Welcome page
  app.get('/', (req, res) => {

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Training Registration</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            background: #101820;
            color: white;
            margin: 0;
            min-height: 100vh;
            padding: 30px;

            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            text-align: center;
          }

          h1 {
            margin-bottom: 16px;
            font-size: 36px;
          }

          p {
            font-size: 18px;
            margin-bottom: 18px;
          }

          a {
            display: block;
            width: 320px;
            max-width: 100%;
            padding: 14px;
            margin: 12px 0;
            background: #263d50;
            color: #8fc7ff;
            text-decoration: none;
            border-radius: 6px;
            font-size: 18px;
          }

          a:hover {
            background: #36536b;
          }
        </style>
      </head>

      <body>
        <h1>Welcome to Training Registration</h1>

        <p>Select an application:</p>

        <a href="/training.training/login.html">
          Training Registration
        </a>
      </body>
      </html>
    `);
  });

  // Login
  app.post('/demo-login', (req, res) => {
    const { username, password } = req.body || {};

    const user = users.verify(username, password);

    if (!user || user.failed) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    // Store user and roles in session
    req.session.user = user.id;
    req.session.roles = user.roles || {};

    console.log('LOGIN USER:', user.id);
    console.log('LOGIN SESSION ROLES:', req.session.roles);

    res.json({
      username: user.id,
      roles: user.roles || {}
    });
  });

  // Logout
  app.post('/demo-logout', (req, res) => {
    req.session.destroy((err) => {

      if (err) {
        return res.status(500).json({
          error: 'Logout failed'
        });
      }

      res.clearCookie('connect.sid');
      res.sendStatus(204);
    });
  });

});

export default cds.server;
