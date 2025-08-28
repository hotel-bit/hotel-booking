import { NextResponse } from "next/server";
import { s3 } from "@/lib/aws";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const id = formData.get("id");
    const bucket = formData.get("bucket");

    if (!file || !id || !bucket)
      throw new Error("Missing file, storage id, or bucket");

    const arrayBuffer = await file.arrayBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: id,
        Body: arrayBuffer,
        ContentType: file.type,
      })
    );

    const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${id}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { bucket, id } = await req.json();

    if (!bucket || !id) throw new Error("Missing bucket name or image ID");

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: id,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
