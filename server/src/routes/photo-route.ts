import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import PhotoController from '../controllers/photo-controller.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new PhotoController();

const photoRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/photos/:albumId', controller.findAll);

  instance.post('/api/photos/upload/:albumId', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.create,
  });

  instance.put('/api/photos', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.update,
  });

  instance.put('/api/photos/rename', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.rename,
  });

  instance.delete('/api/photos', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.delete,
  });

  done();
};

export default fastifyPlugin(photoRoute);
