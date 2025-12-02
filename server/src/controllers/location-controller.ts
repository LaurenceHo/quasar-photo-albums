import { Context } from 'hono';
import { Place } from '../types';
import { BaseController } from './base-controller.js';
import { perform } from './helpers.js';

export default class LocationController extends BaseController {
  // Find places by keyword
  findAll = async (c: Context) => {
    const textQuery = c.req.query('textQuery');
    if (!textQuery) {
      return this.clientError(c, 'textQuery is required');
    }
    const response: any = await perform(
      'POST',
      ':searchText',
      { textQuery, languageCode: 'en' },
      'places.formattedAddress,places.displayName,places.location',
    );
    let places: Place[] = [];
    if (response.places) {
      places = response.places.map((place: any) => {
        const { displayName, formattedAddress, location } = place;
        return {
          displayName: displayName.text,
          formattedAddress,
          location,
        };
      });
    }
    if (!response.error) {
      return this.ok<Place[]>(c, 'ok', places);
    } else {
      return this.fail(c, response.error.message);
    }
  };

  findOne = async (_c: Context) => {
    throw new Error('Method not implemented.');
  };

  create = async (_c: Context) => {
    throw new Error('Method not implemented.');
  };

  delete = async (_c: Context) => {
    throw new Error('Method not implemented.');
  };

  update = async (_c: Context) => {
    throw new Error('Method not implemented.');
  };
}
