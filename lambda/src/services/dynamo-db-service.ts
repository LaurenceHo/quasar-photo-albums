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

  async findAll(params: ScanCommandInput): Promise<T[]> {
    const response = await this.client.send(new ScanCommand(params));
    return get(response, 'Items', []);
  }

  async findOne(params: GetCommandInput): Promise<T> {
    const response = await this.client.send(new GetCommand(params));
    return get(response, 'Item', {});
  }

  async create(params: PutCommandInput): Promise<boolean> {
    const response = await this.client.send(new PutCommand(params));
    return response.$metadata.httpStatusCode === 200;
  }

  async update(params: UpdateCommandInput): Promise<boolean> {
    const response = await this.client.send(new UpdateCommand(params));
    return response.$metadata.httpStatusCode === 200;
  }

  async delete(params: DeleteCommandInput): Promise<boolean> {
    const response = await this.client.send(new DeleteCommand(params));
    return response.$metadata.httpStatusCode === 200;
  }
}
