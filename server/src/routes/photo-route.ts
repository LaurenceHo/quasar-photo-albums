import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import PhotoController from '../controllers/photo-controller.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new PhotoController();

const photoRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/photos/:albumId', controller.findAll);

  instance.after(() => {
    instance.route({
      method: 'POST',
      url: '/api/upload/:albumId',
      preHandler: instance.auth([verifyJwtClaim, verifyUserPermission]),
      handler: controller.create,
    });
  });

  instance.after(() => {
    instance.route({
      method: 'PUT',
      url: '/api/photos',
      preHandler: instance.auth([verifyJwtClaim, verifyUserPermission]),
      handler: controller.update,
    });
  });

  instance.after(() => {
    instance.route({
      method: 'PUT',
      url: '/api/photos/rename',
      preHandler: instance.auth([verifyJwtClaim, verifyUserPermission]),
      handler: controller.rename,
    });
  });

  instance.after(() => {
    instance.route({
      method: 'DELETE',
      url: '/api/photos',
      preHandler: instance.auth([verifyJwtClaim, verifyUserPermission]),
      handler: controller.delete,
    });
  });

  done();
};

export default fastifyPlugin(photoRoute);
