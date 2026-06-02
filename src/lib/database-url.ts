import path from "path";

export const DEFAULT_DATABASE_URL = "file:./pdsbs.db";

export function getDatabaseUrl(
  databaseUrl = process.env.DATABASE_URL,
  baseDir = process.cwd()
): string {
  const url = databaseUrl?.trim() || DEFAULT_DATABASE_URL;

  if (!url.startsWith("file:")) {
    return url;
  }

  const filePath = url.slice("file:".length);
  if (!filePath || path.isAbsolute(filePath)) {
    return url;
  }

  return `file:${path.resolve(baseDir, filePath)}`;
}
