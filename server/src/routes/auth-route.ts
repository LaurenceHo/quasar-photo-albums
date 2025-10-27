import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import AuthController from '../controllers/auth-controller.js';
import { randomBytes } from 'crypto';

const controller = new AuthController();

const authRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/auth/csrf', async (_request, reply) => {
    const state = randomBytes(16).toString('hex');

    reply.setCookie('csrf_state', state, {
      httpOnly: true,
      secure: process.env['DEVELOPMENT'] !== 'true',
      sameSite: 'strict',
      path: '/',
      maxAge: 300,
    });
    return { state };
  });

  instance.get('/api/auth/userInfo', controller.readUserInfoFromToken);

  instance.post('/api/auth/verifyIdToken', {
    handler: controller.verifyIdToken,
    schema: {
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: {
            type: 'string',
          },
        },
      },
    },
  });

  instance.post('/api/auth/logout', controller.logout);

  done();
};

export default fastifyPlugin(authRoute);
