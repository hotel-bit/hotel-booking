import { NextResponse } from "next/server";
import { dynamoDb } from "@/lib/aws";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(req) {
  try {
    const { tableName } = await req.json();
    if (!tableName) throw new Error("Table name is required");

    const result = await dynamoDb.send(
      new ScanCommand({ TableName: tableName })
    );

    return NextResponse.json(result.Items ?? []);
  } catch (error) {
    console.error("Error fetching table data:", error);
    return NextResponse.json(
      { error: "Failed to fetch table data" },
      { status: 500 }
    );
  }
}
