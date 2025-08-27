import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/aws";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";

export async function POST(req) {
  try {
    const body = await req.json();
    const { tableName, ...data } = body;

    if (!tableName) throw new Error("Table name is required");

    const id = nanoid();
    const item = {
      id,
      ...data,
      timestamp: new Date().toISOString(),
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
