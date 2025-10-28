import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import logger from 'pino';
import { D1Client } from '../d1/d1-client.js';
import { RequestWithUser } from '../types';
import { TravelRecord } from '../types/types';
import { BaseController } from './base-controller.js';
import { updateDatabaseAt } from './helpers';

const travelClient = new D1Client('travel_records', ['departure', 'destination']);

export default class TravelRecordController extends BaseController {
  findAll: RouteHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const travelRecords: TravelRecord[] = await travelClient.getAll<TravelRecord>();
      return this.ok<TravelRecord[]>(reply, 'ok', travelRecords);
    } catch (err: any) {
      logger().error(`Failed to fetch travel records from D1: ${err.message}`);
      return this.fail(reply, 'Failed to query travel records');
    }
  };

  create: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as TravelRecord;
    const userEmail = (request as RequestWithUser).user?.email ?? 'unknown';

    const payload: TravelRecord = {
      ...body,
      distance: 1000, // FIXME, need to calculate the real distance later
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userEmail,
      updatedBy: userEmail,
    };

    try {
      await travelClient.create<TravelRecord>(payload);
      await updateDatabaseAt('travel');
      return this.ok(reply, 'Travel record created');
    } catch (err: any) {
      logger().error(`Failed to create travel record in D1: ${err.message}`);
      return this.fail(reply, 'Failed to create travel record');
    }
  };

  update: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as TravelRecord;
    const userEmail = (request as RequestWithUser).user?.email ?? 'unknown';

    const payload: any = { ...body };
    delete payload.id;
    delete payload.createdAt;
    delete payload.createdBy;

    payload.updatedAt = new Date().toISOString();
    payload.updatedBy = userEmail;

    try {
      await travelClient.update<TravelRecord>(id, payload);
      await updateDatabaseAt('travel');
      return this.ok(reply, 'Travel record updated');
    } catch (err: any) {
      logger().error(`Failed to update travel record in D1: ${err.message}`);
      return this.fail(reply, 'Failed to update travel record');
    }
  };

  delete: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { recordId } = request.params as { recordId: string };
    logger().info('##### Delete travel record: %s', recordId);

    try {
      await travelClient.delete(recordId);
      await updateDatabaseAt('travel');
      return this.ok(reply, 'Travel record deleted');
    } catch (err: any) {
      logger().error(`Failed to delete travel record in D1: ${err.message}`);
      return this.fail(reply, 'Failed to delete travel record');
    }
  };

  findOne: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };
}
