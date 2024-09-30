import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import AggregateController from '../controllers/aggregate-controller.js';

const controller = new AggregateController();
const aggregateRoute: FastifyPluginCallback = (instance: FastifyInstance, _opt, done) => {
  instance.get('/api/aggregate/:type', {
    handler: controller.findOne,
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

  done();
};

export default fastifyPlugin(aggregateRoute);
