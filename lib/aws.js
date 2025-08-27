import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export const dynamoDb = DynamoDBDocumentClient.from(client);

export const s3 = new S3Client({ region: process.env.AWS_REGION });
