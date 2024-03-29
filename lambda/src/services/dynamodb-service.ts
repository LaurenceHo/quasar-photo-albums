import { CreateEntityResponse, EntityIdentifiers, QueryOptions, QueryResponse } from 'electrodb';
import { get, isEqual } from 'radash';
import { BaseService } from '../models';
import { ddbDocClient } from './dynamodb-client';

export abstract class DynamodbService<T> implements BaseService<T> {
  public readonly client: any = ddbDocClient;
  private _tableName: string = '';
  private _entity: any;

  get tableName(): any {
    return this._tableName;
  }

  set tableName(value: any) {
    this._tableName = value;
  }

  get entity(): any {
    return this._entity;
  }

  set entity(value: any) {
    this._entity = value;
  }

  async findAll(attributes?: Array<keyof T>, whereClause?: ((_val1: any, _val2: any) => string) | null): Promise<T[]> {
    const options: QueryOptions & { attributes?: Array<keyof T> } = {
      ignoreOwnership: true,
    };
    if (attributes) {
      options['attributes'] = attributes;
    }

    const entity = this._entity.scan;
    if (whereClause) {
      entity.where(whereClause);
    }
    const response = await entity.go(options);

    return get(response, 'data', [] as T[]);
  }

  async findOne(objectKey: { [key: string]: string | number }): Promise<T> {
    const response: QueryResponse<typeof this._entity> = await this._entity
      .get(objectKey)
      .go({ ignoreOwnership: true });

    return get(response, 'data', {} as T);
  }

  async create(item: T): Promise<boolean> {
    const response: CreateEntityResponse<typeof this._entity> = await this._entity.create(item).go();

    return !!get(response, 'data');
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
      ignoreOwnership: true,
    });

    return isEqual(response.data, objectKey);
  }

  async delete(objectKey: { [key: string]: string | number }): Promise<boolean> {
    const response: EntityIdentifiers<typeof this._entity> = await this._entity.delete(objectKey).go();

    return isEqual(response.data, objectKey);
  }
}
