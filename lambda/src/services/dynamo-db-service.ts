import {
  GetCommand,
  GetCommandInput,
  ScanCommand,
  ScanCommandInput,
  PutCommandInput,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
  DeleteCommand,
  DeleteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import get from 'lodash/get';
import { BaseService as IBaseService } from '../models';
import { ddbDocClient } from './dynamodb-client';

export abstract class DynamoDbService<T> implements IBaseService<T> {
  public readonly client: any = ddbDocClient;
  private _tableName: any;

  get tableName(): any {
    return this._tableName;
  }

  set tableName(value: any) {
    this._tableName = value;
  }

  async findAll(params: ScanCommandInput): Promise<T[]> {
    const response = await this.client.send(new ScanCommand(params));
    return get(response, 'Items', []);
  }

  async findOne(params: GetCommandInput): Promise<T> {
    const response = await this.client.send(new GetCommand(params));
    return get(response, 'Item', {});
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
