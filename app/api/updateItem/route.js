import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/aws";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function PATCH(req) {
  try {
    const { tableName, id, sk, ...updatedFields } = await req.json();

    if (!tableName || !id || Object.keys(updatedFields).length === 0) {
      throw new Error("Table name, ID, and updated fields are required");
    }

    const updateExpression = [];
    const expressionAttributeValues = {};

    for (const key in updatedFields) {
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeValues[`:${key}`] = updatedFields[key];
    }

    const expressionAttributeNames = {};
    for (const key in updatedFields) {
      expressionAttributeNames[`#${key}`] = key;
    }

    const Key = sk ? { id, sk } : { id };

    await dynamoDb.send(
      new UpdateCommand({
        TableName: tableName,
        Key,
        UpdateExpression: "SET " + updateExpression.join(", "),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}
