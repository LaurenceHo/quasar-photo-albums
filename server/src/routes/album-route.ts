import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import AlbumController from '../controllers/album-controller.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new AlbumController();

const albumRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/albums', controller.findAll);

  instance.after(() => {
    instance.route({
      method: 'POST',
      url: '/api/albums',
      preHandler: instance.auth([verifyJwtClaim, verifyUserPermission]),
      handler: controller.create,
    });
  });

  instance.after(() => {
    instance.route({
      method: 'PUT',
      url: '/api/albums',
      preHandler: instance.auth([verifyJwtClaim, verifyUserPermission]),
      handler: controller.update,
    });
  });

  instance.after(() => {
    instance.route({
      method: 'DELETE',
      url: '/api/albums/:albumId',
      preHandler: instance.auth([verifyJwtClaim, verifyUserPermission]),
      handler: controller.delete,
    });
  });

  done();
};

export default fastifyPlugin(albumRoute);
