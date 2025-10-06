import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/aws";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req) {
  try {
    const { id, tableName } = await req.json();

    const result = await dynamoDb.send(
      new GetCommand({
        TableName: tableName,
        Key: { id },
      })
    );

    return NextResponse.json(result.Item ?? {});
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}
