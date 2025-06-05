import pino from 'pino-http';
import cors from 'cors';

import express from 'express';
import dotenv from 'dotenv';
import { getEnvVar } from './utils/getEnvVar.js';
import { getAllContacts, getContactsById } from './services/contacts.js';
import listEndpoints from 'express-list-endpoints';
console.log('typeof express:', typeof express); // Має бути 'function'
dotenv.config();
const PORT = Number(getEnvVar('PORT', 3000));

export const setupServer = () => {
  const app = express();
  console.log('Before any routes, app._router:', app._router);

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use(cors());

  app.use(express.json());

  app.get('/contacts', async (req, res) => {
    const contacts = await getAllContacts();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  });
  console.log('app._router after /contacts:', app._router);

  app.get('/contacts/:contactId', async (req, res, next) => {
    const { contactId } = req.params;
    const contact = await getContactsById(contactId);
    if (!contactId) {
      res.status(404).json({
        message: 'Contact not found',
      });
      return;
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  });
  console.log('app._router after /contacts/:contactId:', app._router);

  // ------------------------------
  const endpoints = listEndpoints(app);
  console.log('Registered endpoints:');
  endpoints.forEach((endpoint) => {
    console.log(`${endpoint.methods.join(', ')} ${endpoint.path}`);
  });
  // -------------------------

  //   app.all((req, res) => {
  //     res.status(404).json({
  //       message: 'Not found',
  //     });
  //   });
  // -----------------------------------------
  function printRoutes(app) {
    if (!app._router) {
      console.log('Router not initialized');
      return;
    }

    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // Route registered directly on the app
        const methods = Object.keys(middleware.route.methods)
          .join(', ')
          .toUpperCase();
        console.log(`${methods} ${middleware.route.path}`);
      } else if (middleware.name === 'router') {
        // Router middleware
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const methods = Object.keys(handler.route.methods)
              .join(', ')
              .toUpperCase();
            console.log(`${methods} ${handler.route.path}`);
          }
        });
      }
    });
  }
  // -------------------------------
  app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
    });
  });

  app.listen(PORT, () => {
    setImmediate(() => {
      printRoutes(app);
      const endpoints = listEndpoints(app);
      console.log('Registered endpoints:');
      endpoints.forEach((endpoint) => {
        console.log(`${endpoint.methods.join(', ')} ${endpoint.path}`);
      });
    });
    console.log(`Server is running on port ${PORT}`);
  });
};
