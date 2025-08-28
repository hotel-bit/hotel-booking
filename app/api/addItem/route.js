import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/aws";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const { tableName, ...data } = body;

    if (!tableName) throw new Error("Table name is required");

    await dynamoDb.send(
      new PutCommand({
        TableName: tableName,
        Item: data,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
