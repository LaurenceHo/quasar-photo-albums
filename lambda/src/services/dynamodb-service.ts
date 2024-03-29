import { UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
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
    const response: CreateEntityResponse<typeof this._entity> = await this._entity
      .create(item)
      .go({ response: 'none' });

    return response.data === null;
  }

  async update(params: UpdateCommandInput): Promise<boolean> {
    const response = await this.client.send(new UpdateCommand(params));
    return response.$metadata.httpStatusCode === 200;
  }

  async delete(objectKey: { [key: string]: string | number }): Promise<boolean> {
    const response: EntityIdentifiers<typeof this._entity> = await this._entity.delete(objectKey).go();
    return isEqual(response.data, objectKey);
  }
}
