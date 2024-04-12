import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import AlbumTagController from '../controllers/album-tag-controller.js';
import { verifyJwtClaimV2, verifyUserPermissionV2 } from './auth-middleware.js';

const controller = new AlbumTagController();

const albumTagRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/albumTags', controller.findAll);

  instance.decorate('verifyJwtClaim', verifyJwtClaimV2).decorate('verifyUserPermission', verifyUserPermissionV2);

  instance.after(() => {
    instance.route({
      method: 'POST',
      url: '/api/albumTags',
      preHandler: instance.auth([verifyJwtClaimV2, verifyUserPermissionV2]),
      handler: controller.create,
    });
  });

  instance.after(() => {
    instance.route({
      method: 'DELETE',
      url: '/api/albumTags/:tagId',
      preHandler: instance.auth([verifyJwtClaimV2, verifyUserPermissionV2]),
      handler: controller.delete,
    });
  });

  done();
};

export default fastifyPlugin(albumTagRoute);
