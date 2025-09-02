import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/aws";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

export async function DELETE(req) {
  try {
    const { tableName, id, sk } = await req.json();

    if (!tableName || !id) throw new Error("Table name and ID are required");

    const key = { id };
    if (sk) key.sk = sk;

    await dynamoDb.send(
      new DeleteCommand({
        TableName: tableName,
        Key: key,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
