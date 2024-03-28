import {
  DeleteCommand,
  DeleteCommandInput,
  PutCommand,
  PutCommandInput,
  ScanCommand,
  ScanCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { get } from 'radash';
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

  async findAll(params: ScanCommandInput): Promise<T[]> {
    const response = await this.client.send(new ScanCommand(params));
    return get(response, 'Items', []);
  }

  async findOne(objectKey: { [key: string]: string | number }): Promise<T> {
    const response = await this._entity.get(objectKey).go({ ignoreOwnership: true });
    return get(response, 'data', {} as T);
  }

  async create(item: T): Promise<boolean> {
    const params: PutCommandInput = {
      TableName: this._tableName,
      Item: item as Record<string, any>,
    };
    const response = await this.client.send(new PutCommand(params));
    return response.$metadata.httpStatusCode === 200;
  }

  async update(params: UpdateCommandInput): Promise<boolean> {
    const response = await this.client.send(new UpdateCommand(params));
    return response.$metadata.httpStatusCode === 200;
  }

  async delete(objectKey: { [key: string]: string | number }): Promise<boolean> {
    const params: DeleteCommandInput = {
      TableName: this._tableName,
      Key: objectKey,
    };

    const response = await this.client.send(new DeleteCommand(params));
    return response.$metadata.httpStatusCode === 200;
  }
}
