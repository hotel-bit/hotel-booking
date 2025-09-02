import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/aws";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req) {
  try {
    const { id, sk } = await req.json();

    const result = await dynamoDb.send(
      new GetCommand({
        TableName: "rooms",
        Key: {
          id,
          sk,
        },
      })
    );

    return NextResponse.json(result.Item ?? {});
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}
