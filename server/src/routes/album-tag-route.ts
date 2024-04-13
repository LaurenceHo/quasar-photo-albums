import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import AlbumTagController from '../controllers/album-tag-controller.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new AlbumTagController();

const albumTagRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/albumTags', controller.findAll);

  instance.after(() => {
    instance.route({
      method: 'POST',
      url: '/api/albumTags',
      preHandler: instance.auth([verifyJwtClaim, verifyUserPermission]),
      handler: controller.create,
    });
  });

  instance.after(() => {
    instance.route({
      method: 'DELETE',
      url: '/api/albumTags/:tagId',
      preHandler: instance.auth([verifyJwtClaim, verifyUserPermission]),
      handler: controller.delete,
    });
  });

  done();
};

export default fastifyPlugin(albumTagRoute);
