import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import AlbumController from '../controllers/album-controller.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new AlbumController();

const albumSchema = {
  type: 'object',
  required: ['year', 'id', 'albumName', 'isPrivate'],
  properties: {
    year: {
      type: 'string',
      minLength: 1
    },
    id: {
      type: 'string',
      minLength: 1
    },
    albumName: {
      type: 'string',
      minLength: 1
    },
    description: {
      type: 'string'
    },
    albumCover: {
      type: 'string'
    },
    isPrivate: {
      type: 'boolean'
    },
    isFeatured: {
      type: 'boolean'
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    place: {
      type: ['object', 'null'],
      properties: {
        displayName: {
          type: 'string'
        },
        formattedAddress: {
          type: 'string'
        },
        location: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number'
            },
            longitude: {
              type: 'number'
            }
          }
        }
      }
    }
  }
};

const albumRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/albums/:year', {
    handler: controller.findAll,
    schema: {
      params: {
        type: 'object',
        properties: {
          year: {
            type: 'string'
          }
        }
      }
    }
  });

  instance.post('/api/albums', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and'
    }),
    handler: controller.create,
    schema: {
      body: albumSchema
    }
  });

  instance.put('/api/albums', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and'
    }),
    handler: controller.update,
    schema: {
      body: albumSchema
    }
  });

  instance.delete('/api/albums', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and'
    }),
    handler: controller.delete,
    schema: {
      body: {
        type: 'object',
        required: ['year', 'id'],
        properties: {
          year: {
            type: 'string'
          },
          id: {
            type: 'string'
          }
        }
      }
    }
  });

  done();
};

export default fastifyPlugin(albumRoute);
