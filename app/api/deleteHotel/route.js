import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/aws";
import {
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

export async function DELETE(req) {
  try {
    const { hotelId } = await req.json();
    if (!hotelId) throw new Error("Hotel ID is required");

    await dynamoDb.send(
      new DeleteCommand({
        TableName: "hotels",
        Key: { id: hotelId },
      })
    );

    const roomsResult = await dynamoDb.send(
      new QueryCommand({
        TableName: "rooms",
        KeyConditionExpression: "hotelId = :h",
        ExpressionAttributeValues: {
          ":h": hotelId,
        },
      })
    );

    const rooms = roomsResult.Items || [];

    while (rooms.length > 0) {
      const batch = rooms.splice(0, 25).map((room) => ({
        DeleteRequest: { Key: { hotelId: room.hotelId, roomId: room.roomId } },
      }));

      await dynamoDb.send(
        new BatchWriteCommand({
          RequestItems: { rooms: batch },
        })
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hotel and rooms:", error);
    return NextResponse.json(
      { error: "Failed to delete hotel and rooms" },
      { status: 500 }
    );
  }
}
