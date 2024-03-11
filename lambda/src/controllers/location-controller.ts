import { Request, RequestHandler, Response } from 'express';
import isEmpty from 'lodash/isEmpty';
import { Place } from '../models';
import { asyncHandler } from '../utils/async-handler';
import { BaseController } from './base-controller';

export default class LocationController extends BaseController {
  // Find places by keyword
  findAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { textQuery } = req.query;
    const response: any = await this.perform(
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
          location,
        };
      });
    }
    if (!response.error) {
      return this.ok<Place[]>(res, 'ok', places);
    } else {
      return this.fail(res, response.error.message);
    }
  });

  findOne: RequestHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });

  create: RequestHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });

  delete: RequestHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });

  update: RequestHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });

  perform = async (method: 'GET' | 'POST', urlPath: string, requestJsonBody?: any, maskFields?: string) => {
    const headers = new Headers({ Accept: '*/*' });
    headers.append('X-Goog-Api-Key', process.env.GOOGLE_PLACES_API_KEY as string);
    if (!isEmpty(maskFields)) {
      headers.append('X-Goog-FieldMask', maskFields ?? '');
    }

    const requestOptions: any = {};

    if (!isEmpty(requestJsonBody)) {
      // JSON content
      headers.append('Content-Type', 'application/json');
      requestOptions.body = JSON.stringify(requestJsonBody);
    }
    requestOptions.method = method.toUpperCase();
    requestOptions.headers = headers;

    const response = await fetch(`https://places.googleapis.com/v1/places${urlPath}`, requestOptions);
    return await response.json();
  };
}
