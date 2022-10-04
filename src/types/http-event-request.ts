import {APIGatewayProxyEvent} from "aws-lambda";

export type HttpEventRequest<T = null> = Omit<APIGatewayProxyEvent, 'queryStringParameters'> & {
    queryStringParameters: T
}