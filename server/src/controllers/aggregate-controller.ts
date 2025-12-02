import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import AggregationService from '../d1/aggregation-service.js';
import { Album, AlbumsByYear } from '../types/album.js';
import { BaseController } from './base-controller.js';
import { verifyIfIsAdmin } from './helpers.js';

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

    const aggregationService = new AggregationService(request.env.DB);

    if (aggregateType === 'albumsWithLocation') {
      const isAdmin = verifyIfIsAdmin(request, reply);
      try {
        const albumData = await aggregationService.getAlbumsWithLocation(isAdmin);
        return this.ok<Album[]>(reply, 'ok', albumData);
      } catch (err: any) {
        request.log.error(`Failed to query aggregate data for photo album with location: ${err}`);
        return this.fail(reply, 'Failed to query aggregate data for photo album with location');
      }
    } else if (aggregateType === 'countAlbumsByYear') {
      const isAdmin = verifyIfIsAdmin(request, reply);

      try {
        const countData = await aggregationService.getCountAlbumsByYear(isAdmin);
        return this.ok<AlbumsByYear>(reply, 'ok', countData);
      } catch (err: any) {
        request.log.error(`Failed to query aggregate data for count albums by year: ${err}`);
        return this.fail(reply, 'Failed to query aggregate data for count albums by year');
      }
    } else if (aggregateType === 'featuredAlbums') {
      try {
        const featuredAlbums = await aggregationService.getFeaturedAlbums();
        return this.ok<Album[]>(reply, 'ok', featuredAlbums);
      } catch (err: any) {
        request.log.error(`Failed to query aggregate data for featured albums: ${err}`);
        return this.fail(reply, 'Failed to query aggregate data for featured albums');
      }
    }
    return this.clientError(reply, `Invalid aggregate type: ${aggregateType}`);
  };
}
