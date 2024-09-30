import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import { Place } from '../types';
import { BaseController } from './base-controller.js';
import { perform } from './helpers.js';

export default class LocationController extends BaseController {
  // Find places by keyword
  findAll: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { textQuery } = request.query as { textQuery: string };
    const response: any = await perform(
      'POST',
      ':searchText',
      { textQuery, languageCode: 'en' },
      'places.formattedAddress,places.displayName,places.location'
    );
    let places: Place[] = [];
    if (response.places) {
      places = response.places.map((place: any) => {
        const { displayName, formattedAddress, location } = place;
        return {
          displayName: displayName.text,
          formattedAddress,
          location
        };
      });
    }
    if (!response.error) {
      return this.ok<Place[]>(reply, 'ok', places);
    } else {
      return this.fail(reply, response.error.message);
    }
  };

  findOne: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  create: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  delete: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  update: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };
}
