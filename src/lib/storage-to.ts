const BASE = "https://storage.to/api";

interface InitResponse {
  id: string;
  presigned_urls: string[];
}

interface ConfirmResponse {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

function getHeaders(): Record<string, string> {
  const token = process.env.STORAGE_TO_TOKEN;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function initUpload(
  fileName: string,
  fileSize: number,
  mimeType: string
): Promise<InitResponse> {
  const res = await fetch(`${BASE}/upload/init`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: fileName,
      size: fileSize,
      mime_type: mimeType,
    }),
  });

  if (!res.ok) {
    throw new Error(`storage.to init failed: ${res.status}`);
  }

  return res.json();
}

async function uploadToPresigned(
  presignedUrl: string,
  fileBuffer: Buffer | ArrayBuffer,
  mimeType: string
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
    },
    body: fileBuffer as unknown as BodyInit,
  });

  if (!res.ok) {
    throw new Error(`storage.to presigned upload failed: ${res.status}`);
  }
}

async function confirmUpload(uploadId: string): Promise<ConfirmResponse> {
  const res = await fetch(`${BASE}/upload/confirm`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ id: uploadId }),
  });

  if (!res.ok) {
    throw new Error(`storage.to confirm failed: ${res.status}`);
  }

  return res.json();
}

export async function uploadToStorageTo(
  file: File
): Promise<{ url: string; id: string }> {
  const buffer = await file.arrayBuffer();
  const init = await initUpload(file.name, file.size, file.type);

  for (const url of init.presigned_urls) {
    await uploadToPresigned(url, buffer, file.type);
  }

  const confirmed = await confirmUpload(init.id);

  return {
    url: confirmed.url,
    id: confirmed.id,
  };
}

export async function uploadBufferToStorageTo(
  buffer: Buffer,
  fileName: string,
  fileSize: number,
  mimeType: string
): Promise<{ url: string; id: string }> {
  const init = await initUpload(fileName, fileSize, mimeType);

  for (const url of init.presigned_urls) {
    await uploadToPresigned(url, buffer, mimeType);
  }

  const confirmed = await confirmUpload(init.id);

  return {
    url: confirmed.url,
    id: confirmed.id,
  };
}
