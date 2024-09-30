import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import AuthController from '../controllers/auth-controller.js';

const controller = new AuthController();

const authRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/auth/userInfo', controller.findOne);

  instance.post('/api/auth/verifyIdToken', {
    handler: controller.verifyIdToken,
    schema: {
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: {
            type: 'string'
          }
        }
      }
    }
  });

  instance.post('/api/auth/logout', controller.logout);

  done();
};

export default fastifyPlugin(authRoute);
