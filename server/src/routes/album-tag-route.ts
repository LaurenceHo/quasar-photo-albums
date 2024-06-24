import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import AlbumTagController from '../controllers/album-tag-controller.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new AlbumTagController();

const albumTagRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/albumTags', controller.findAll);

  instance.post('/api/albumTags', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.create,
    schema: {
      body: {
        type: 'array',
        items: {
          type: 'object',
          required: ['tag'],
          properties: {
            tag: { type: 'string' },
          },
        },
      },
    },
  });

  instance.delete('/api/albumTags/:tagId', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.delete,
    schema: {
      params: {
        type: 'object',
        properties: {
          tagId: {
            type: 'string',
          },
        },
      },
    },
  });

  done();
};

export default fastifyPlugin(albumTagRoute);
