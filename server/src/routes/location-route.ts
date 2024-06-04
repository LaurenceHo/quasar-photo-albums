import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import LocationController from '../controllers/location-controller.js';

const controller = new LocationController();

const locationRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/location/search', {
    handler: controller.findAll,
    schema: {
      querystring: {
        type: 'object',
        required: ['textQuery'],
        properties: {
          textQuery: {
            type: 'string',
          },
        },
      },
    },
  });

  instance.get('/api/location/albums', controller.findAlbumsWithLocation);

  done();
};

export default fastifyPlugin(locationRoute);
