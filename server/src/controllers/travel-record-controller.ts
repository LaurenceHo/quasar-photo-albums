import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import { TravelRecord } from '../schemas/travel-record.js';
import TravelRecordService from '../services/travel-record-service.js';
import { RequestWithUser } from '../types';
import { BaseController } from './base-controller.js';

const travelRecordService = new TravelRecordService();

export default class TravelRecordController extends BaseController {
  findAll: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const travelRecords = await travelRecordService.findAll(
        'query',
        {
          indexName: 'byTravelDate',
          key: { gsi1pk: 'travelrecords' },
          order: 'asc',
        },
        ['id', 'travelDate', 'departure', 'destination'],
      );
      return this.ok<TravelRecord[]>(reply, 'ok', travelRecords);
    } catch (err: any) {
      request.log.error(`Failed to query travel records: ${err}`);
      return this.fail(reply, 'Failed to query travel records');
    }
  };

  create: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const travelRecord = request.body as TravelRecord;
    travelRecord.createdBy = (request as RequestWithUser).user?.email ?? 'unknown';
    travelRecord.updatedBy = (request as RequestWithUser).user?.email ?? 'unknown';

    try {
      const result = await travelRecordService.create(travelRecord);

      if (result) {
        return this.ok(reply, 'Travel record created');
      }
      return this.fail(reply, 'Failed to create travel record');
    } catch (err: any) {
      request.log.error(`Failed to insert travel record: ${err}`);
      return this.fail(reply, 'Failed to create travel record');
    }
  };

  update: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const travelRecord = request.body as TravelRecord;

      const clonedRecord: any = { ...travelRecord };
      clonedRecord.updatedBy = (request as RequestWithUser).user?.email ?? 'unknown';
      clonedRecord.updatedAt = new Date().toISOString();

      delete clonedRecord.id;
      delete clonedRecord.createdAt;
      delete clonedRecord.createdBy;

      const result = await travelRecordService.update({ id: travelRecord.id }, clonedRecord);

      if (result) {
        return this.ok(reply, 'Travel record updated');
      }
      return this.fail(reply, 'Failed to update travel record');
    } catch (err: any) {
      request.log.error(`Failed to update travel record: ${err}`);
      return this.fail(reply, 'Failed to update travel record');
    }
  };

  delete: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const record = (request.params as any)['recordId'] as string;
      request.log.info('##### Delete travel record:', record);

      const result = await travelRecordService.delete({ id: record });

      if (result) {
        return this.ok(reply, 'Travel record deleted');
      }
    } catch (err: any) {
      request.log.error(`Failed to delete travel record: ${err}`);
      return this.fail(reply, 'Failed to delete travel record');
    }
  };

  findOne: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };
}
