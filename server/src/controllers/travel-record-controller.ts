import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import logger from 'pino';
import TravelRecordService from '../d1/travel-record-service.js';
import { RequestWithUser } from '../types';
import { TravelRecord } from '../types/travel-record';
import { BaseController } from './base-controller.js';
import { haversineDistance, isValidCoordination, updateDatabaseAt } from './helpers.js';

export default class TravelRecordController extends BaseController {
  findAll: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const travelRecordService = new TravelRecordService(request.env.DB);
    try {
      const travelRecords: TravelRecord[] = await travelRecordService.getAll();
      return this.ok<TravelRecord[]>(reply, 'ok', travelRecords);
    } catch (err: any) {
      logger().error(`Failed to fetch travel records from D1: ${err.message}`);
      return this.fail(reply, 'Failed to query travel records');
    }
  };

  create: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as TravelRecord;
    const userEmail = (request as RequestWithUser).user?.email ?? 'unknown';
    const travelRecordService = new TravelRecordService(request.env.DB);

    // TODO: If departure and destination are present, calculate the distance using latitude and longitude
    // If airline and flight number are present, calculate the distance using flight API
    // If all of them are present, calculate the distance using the latitude and longitude

    let distance = 0;
    if (body.departure && body.destination) {
      if (
        !isValidCoordination(body.departure.location.latitude, body.departure.location.longitude) ||
        !isValidCoordination(
          body.destination.location.latitude,
          body.destination.location.longitude,
        )
      ) {
        return this.fail(reply, 'Invalid coordinates');
      }

      const rawDistance = haversineDistance(
        body.departure.location.latitude,
        body.departure.location.longitude,
        body.destination.location.latitude,
        body.destination.location.longitude,
      );

      distance = Math.round(rawDistance);
    }

    const payload: TravelRecord = {
      ...body,
      distance,
      createdBy: userEmail,
      updatedBy: userEmail,
    };

    try {
      await travelRecordService.create(payload);
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
    const travelRecordService = new TravelRecordService(request.env.DB);

    const payload: any = { ...body };
    delete payload.id;
    delete payload.createdAt;
    delete payload.createdBy;

    payload.updatedAt = new Date().toISOString();
    payload.updatedBy = userEmail;

    try {
      await travelRecordService.update(id, payload);
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
    const travelRecordService = new TravelRecordService(request.env.DB);

    try {
      await travelRecordService.delete(recordId);
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
