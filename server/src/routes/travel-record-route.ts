import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import TravelRecordController from '../controllers/travel-record-controller.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new TravelRecordController();

const travelRecordSchema = {
  type: 'object',
  required: ['id', 'departure', 'destination', 'travelDate'],
  properties: {
    id: {
      type: 'string',
      minLength: 1,
    },
    travelDate: {
      type: 'string',
      minLength: 1,
    },
    departure: {
      type: ['object', 'null'],
      properties: {
        displayName: {
          type: 'string',
        },
        formattedAddress: {
          type: 'string',
        },
        location: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
            },
            longitude: {
              type: 'number',
            },
          },
        },
      },
    },
    destination: {
      type: ['object', 'null'],
      properties: {
        displayName: {
          type: 'string',
        },
        formattedAddress: {
          type: 'string',
        },
        location: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
            },
            longitude: {
              type: 'number',
            },
          },
        },
      },
    },
  },
};

const travelRecordRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/travelRecords', {
    handler: controller.findAll,
  });

  instance.post('/api/travelRecords', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.create,
    schema: {
      body: travelRecordSchema,
    },
  });

  instance.put('/api/travelRecords', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.update,
    schema: {
      body: travelRecordSchema,
    },
  });

  instance.delete('/api/travelRecords/:recordId', {
    onRequest: instance.auth([verifyJwtClaim, verifyUserPermission], {
      relation: 'and',
    }),
    handler: controller.delete,
    schema: {
      params: {
        type: 'object',
        properties: {
          recordId: {
            type: 'string',
          },
        },
      },
    },
  });

  done();
};

export default fastifyPlugin(travelRecordRoute);
