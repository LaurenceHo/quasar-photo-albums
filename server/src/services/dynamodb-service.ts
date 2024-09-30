import { CreateEntityResponse, EntityIdentifiers, QueryOptions, QueryResponse } from 'electrodb';
import { get, isEmpty, isEqual } from 'radash';
import { BaseService } from '../types';
import { ddbDocClient } from './dynamodb-client.js';

export abstract class DynamodbService<T> implements BaseService<T> {
  public readonly client: any = ddbDocClient;
  private _entity: any;

  get entity(): any {
    return this._entity;
  }

  set entity(value: any) {
    this._entity = value;
  }

  async findAll<K extends keyof T>(
    method: 'scan' | 'query' = 'scan',
    filter?: { indexName: string; key: { [P in K]?: T[P] } } | null,
    attributes?: Array<keyof T> | null,
    whereClause?: ((_val1: any, _val2: any) => string) | null
  ): Promise<T[]> {
    const options: QueryOptions & { attributes?: Array<keyof T> } = {
      ignoreOwnership: true
    };
    if (method === 'query' && !filter) {
      throw new Error('Filter is required for query method');
    }

    if (attributes) {
      options['attributes'] = attributes;
    }

    let entity = { ...this._entity[method] };
    if (filter) {
      entity = entity[filter.indexName](filter.key);
    }

    if (whereClause) {
      entity = entity.where(whereClause);
    }
    const response = await entity.go(options);

    return get(response, 'data', [] as T[]);
  }

  async findOne(objectKey: { [key: string]: string | number }, attributes?: Array<keyof T>): Promise<T> {
    const options: QueryOptions & { attributes?: Array<keyof T> } = {
      ignoreOwnership: true
    };

    if (attributes) {
      options['attributes'] = attributes;
    }

    const response: QueryResponse<typeof this._entity> = await this._entity.get(objectKey).go(options);

    return get(response, 'data');
  }

  async create(item: T | T[]): Promise<boolean> {
    const response: CreateEntityResponse<typeof this._entity> = await this._entity.put(item).go({ response: 'none' });

    return isEmpty(response.data);
  }

  async update(
    objectKey: { [key: string]: string | number },
    item: T,
    whereClause?: (_val1: any, _val2: any) => string
  ): Promise<boolean> {
    const entity = this._entity.patch(objectKey).set(item);
    if (whereClause) {
      entity.where(whereClause);
    }
    const response = await entity.go({
      ignoreOwnership: true
    });

    return isEqual(response.data, objectKey);
  }

  async delete(objectKey: { [key: string]: string | number }): Promise<boolean> {
    const response: EntityIdentifiers<typeof this._entity> = await this._entity.delete(objectKey).go();

    return isEqual(response['data'], objectKey);
  }
}
