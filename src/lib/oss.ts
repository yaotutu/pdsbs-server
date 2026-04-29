import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 京东云 OSS 兼容 S3 协议
const endpoint = process.env.OSS_ENDPOINT || "";
const s3 = new S3Client({
  region: process.env.OSS_REGION || "cn-north-1",
  endpoint: endpoint.startsWith("http") ? endpoint : `https://${endpoint}`,
  credentials: {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.OSS_BUCKET || "";
const CDN_DOMAIN = process.env.OSS_CDN_DOMAIN || "";

/**
 * 上传文件到京东云 OSS
 * @param buffer 文件内容
 * @param key OSS 中的对象键（路径+文件名）
 * @param contentType MIME 类型
 * @returns 文件的访问 URL
 */
export async function uploadToOSS(
  buffer: Buffer,
  key: string,
  contentType: string = "application/octet-stream"
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  // 优先使用 CDN 域名，否则拼接默认 OSS 域名
  const domain = CDN_DOMAIN || `https://${BUCKET}.${process.env.OSS_ENDPOINT?.replace("https://", "")}`;
  return `${domain}/${key}`;
}
