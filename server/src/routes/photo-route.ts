import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import PhotoController from '../controllers/photo-controller.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new PhotoController();

const photoRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/photos/:albumId', {
    handler: controller.findAll,
    schema: {
      params: {
        type: 'object',
        properties: {
          albumId: {
            type: 'string',
          },
        },
      },
    },
  });

  instance.post('/api/photos/upload/:albumId', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.create,
    schema: {
      params: {
        type: 'object',
        properties: {
          albumId: {
            type: 'string',
          },
        },
      },
    },
  });

  instance.put('/api/photos', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.update,
    schema: {
      body: {
        type: 'object',
        required: ['albumId', 'destinationAlbumId', 'photoKeys'],
        properties: {
          albumId: {
            type: 'string',
          },
          destinationAlbumId: {
            type: 'string',
          },
          photoKeys: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
  });

  instance.put('/api/photos/rename', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.rename,
    schema: {
      body: {
        type: 'object',
        required: ['albumId', 'newPhotoKey', 'currentPhotoKey'],
        properties: {
          albumId: {
            type: 'string',
          },
          newPhotoKey: {
            type: 'string',
          },
          currentPhotoKey: {
            type: 'string',
          },
        },
      },
    },
  });

  instance.delete('/api/photos', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.delete,
    schema: {
      body: {
        type: 'object',
        required: ['albumId', 'photoKeys'],
        properties: {
          albumId: {
            type: 'string',
          },
          photoKeys: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
  });

  done();
};

export default fastifyPlugin(photoRoute);
