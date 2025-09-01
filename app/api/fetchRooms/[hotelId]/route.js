import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/aws";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

export async function GET(req, { params }) {
  try {
    const { hotelId } = params;

    if (!hotelId) {
      return NextResponse.json(
        { error: "hotelId is required" },
        { status: 400 }
      );
    }

    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: "rooms",
        KeyConditionExpression: "hotelId = :hotelId",
        ExpressionAttributeValues: {
          ":hotelId": hotelId,
        },
      })
    );

    return NextResponse.json({ rooms: result.Items || [] });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
