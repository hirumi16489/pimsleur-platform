// MIME type mappings for file handling
export interface MimeTypeMapping {
  mimeType: string;
  fileType: string; // The category (e.g., "image", "text", "audio")
  extension: string; // The file extension (e.g., "png", "jpg", "txt")
}

export const MIME_TYPE_MAPPINGS: MimeTypeMapping[] = [
  // Images
  { mimeType: 'image/jpeg', fileType: 'image', extension: 'jpg' },
  { mimeType: 'image/jpg', fileType: 'image', extension: 'jpg' },
  { mimeType: 'image/png', fileType: 'image', extension: 'png' },
  { mimeType: 'image/gif', fileType: 'image', extension: 'gif' },
  { mimeType: 'image/webp', fileType: 'image', extension: 'webp' },
  { mimeType: 'image/svg+xml', fileType: 'image', extension: 'svg' },

  // Text files
  { mimeType: 'text/plain', fileType: 'text', extension: 'txt' },
  { mimeType: 'text/html', fileType: 'text', extension: 'html' },
  { mimeType: 'text/css', fileType: 'text', extension: 'css' },
  { mimeType: 'text/javascript', fileType: 'text', extension: 'js' },
  { mimeType: 'text/markdown', fileType: 'text', extension: 'md' },

  // Audio files
  { mimeType: 'audio/mpeg', fileType: 'audio', extension: 'mp3' },
  { mimeType: 'audio/wav', fileType: 'audio', extension: 'wav' },
  { mimeType: 'audio/ogg', fileType: 'audio', extension: 'ogg' },
  { mimeType: 'audio/mp4', fileType: 'audio', extension: 'm4a' },

  // Video files
  { mimeType: 'video/mp4', fileType: 'video', extension: 'mp4' },
  { mimeType: 'video/webm', fileType: 'video', extension: 'webm' },
  { mimeType: 'video/ogg', fileType: 'video', extension: 'ogv' },

  // Documents
  { mimeType: 'application/pdf', fileType: 'document', extension: 'pdf' },
  { mimeType: 'application/json', fileType: 'data', extension: 'json' },
  { mimeType: 'application/xml', fileType: 'data', extension: 'xml' },
  { mimeType: 'application/zip', fileType: 'archive', extension: 'zip' },
  { mimeType: 'application/x-rar-compressed', fileType: 'archive', extension: 'rar' },
];

/**
 * Get file type and extension from MIME type
 * @param mimeType - The MIME type (e.g., "image/png")
 * @returns Object with fileType and extension, or null if not found
 */
export function getFileInfoFromMimeType(
  mimeType: string
): { fileType: string; extension: string } | null {
  const mapping = MIME_TYPE_MAPPINGS.find((m) => m.mimeType === mimeType);
  if (mapping) {
    return {
      fileType: mapping.fileType,
      extension: mapping.extension,
    };
  }

  // Fallback: try to parse the MIME type
  const parts = mimeType.split('/');
  if (parts.length === 2) {
    return {
      fileType: parts[0],
      extension: parts[1],
    };
  }

  return null;
}

/**
 * Get the allowed MIME types for uploads
 */
export function getAllowedMimeTypes(): string[] {
  return MIME_TYPE_MAPPINGS.map((m) => m.mimeType);
}
