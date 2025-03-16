import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import {
  ALBUMS_WITH_LOCATION,
  AlbumsByYear,
  COUNT_ALBUMS_BY_YEAR,
  COUNT_ALBUMS_BY_YEAR_EXCLUDE_PRIVATE,
  DataAggregation,
  FEATURED_ALBUMS,
} from '../schemas/aggregation.js';
import { Album } from '../schemas/album.js';
import DataAggregationService from '../services/data-aggregation-service.js';
import { BaseController } from './base-controller.js';
import { verifyIfIsAdmin } from './helpers.js';

const dataAggregationService = new DataAggregationService();

export default class AggregateController extends BaseController {
  findAll: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  create: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  update: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  delete: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  findOne: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const aggregateType = (request.params as any)['type'] as
      | 'albumsWithLocation'
      | 'countAlbumsByYear'
      | 'featuredAlbums';

    if (aggregateType === 'albumsWithLocation') {
      try {
        const albumData: DataAggregation<typeof ALBUMS_WITH_LOCATION> =
          await dataAggregationService.findOne({
            key: ALBUMS_WITH_LOCATION,
          });

        return this.ok<Album[]>(reply, 'ok', albumData?.value ?? []);
      } catch (err: any) {
        request.log.error(`Failed to query aggregate data for photo album with location: ${err}`);
        return this.fail(reply, 'Failed to query aggregate data for photo album with location');
      }
    } else if (aggregateType === 'countAlbumsByYear') {
      const isAdmin = verifyIfIsAdmin(request, reply);

      try {
        let countData: DataAggregation<typeof COUNT_ALBUMS_BY_YEAR>;
        if (!isAdmin) {
          countData = await dataAggregationService.findOne({
            key: COUNT_ALBUMS_BY_YEAR_EXCLUDE_PRIVATE,
          });
        } else {
          countData = await dataAggregationService.findOne({
            key: COUNT_ALBUMS_BY_YEAR,
          });
        }
        return this.ok<AlbumsByYear>(reply, 'ok', countData?.value ?? []);
      } catch (err: any) {
        request.log.error(`Failed to query aggregate data for count albums by year: ${err}`);
        return this.fail(reply, 'Failed to query aggregate data for count albums by year');
      }
    } else if (aggregateType === 'featuredAlbums') {
      try {
        const featuredAlbums: DataAggregation<typeof FEATURED_ALBUMS> =
          await dataAggregationService.findOne({
            key: FEATURED_ALBUMS,
          });

        return this.ok<Album[]>(reply, 'ok', featuredAlbums?.value ?? []);
      } catch (err: any) {
        request.log.error(`Failed to query aggregate data for featured albums: ${err}`);
        return this.fail(reply, 'Failed to query aggregate data for featured albums');
      }
    }
    return this.clientError(reply, `Invalid aggregate type: ${aggregateType}`);
  };
}
