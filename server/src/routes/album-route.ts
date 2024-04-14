import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import AlbumController from '../controllers/album-controller.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new AlbumController();

const albumRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/albums', controller.findAll);

  instance.post('/api/albums', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.create,
  });

  instance.put('/api/albums', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.update,
  });

  instance.delete('/api/albums/:albumId', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.delete,
  });

  done();
};

export default fastifyPlugin(albumRoute);
