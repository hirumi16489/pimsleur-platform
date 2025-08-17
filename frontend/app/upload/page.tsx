'use client';
import { useMemo, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Dropzone } from '@/components/ui/Dropzone';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique lesson ID
function generateLessonId(): string {
  return `lesson#${uuidv4()}`;
}

type PresignedUpload = {
  url: string;
  headers?: Record<string, string>;
};

type UploadedFile = {
  name: string;
  size: number;
  contentType: string;
  etag?: string;
};

export type PresignRequest = {
  kind: PresignKind;
  fileType?: string;
  lessonId: string;
};

enum PresignKind {
  USER_FILE = 'USER_FILE',
  METADATA = 'METADATA',
}

function FileRow({ file }: { file: File }) {
  return (
    <li className="p-3 border rounded-card bg-white flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{file.name}</div>
        <div className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</div>
      </div>
      <span className="text-xs text-zinc-500">{file.type || 'application/octet-stream'}</span>
    </li>
  );
}

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sortedFiles = useMemo(() => {
    const filesCopy = [...selectedFiles];
    filesCopy.sort((left, right) => {
      const leftIsMetadata = left.name === 'metadata.json';
      const rightIsMetadata = right.name === 'metadata.json';
      if (leftIsMetadata && !rightIsMetadata) return 1;
      if (!leftIsMetadata && rightIsMetadata) return -1;
      return 0;
    });
    return filesCopy;
  }, [selectedFiles]);

  function getContentTypeOrDefault(file: File): string {
    return file.type || 'application/octet-stream';
  }

  async function requestPresignedUpload(file: File, lessonId: string): Promise<PresignedUpload> {
    const request: PresignRequest = {
      kind: PresignKind.USER_FILE,
      fileType: getContentTypeOrDefault(file),
      lessonId,
    };

    const response = await fetch('/api/s3-upload-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to presign ${file.name} (HTTP ${response.status})`);
    }

    return response.json();
  }

  async function uploadWithPresignedUrl(
    file: File,
    presigned: PresignedUpload,
    opts?: {
      onProgress?: (progress01: number) => void;
      signal?: AbortSignal;
    }
  ): Promise<UploadedFile> {
    return new Promise<UploadedFile>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presigned.url, true);
      xhr.withCredentials = false;
  
      // Send EXACTLY what the server told you to send (already signed).
      if (presigned.headers) {
        for (const [headerName, headerValue] of Object.entries(presigned.headers)) {
          xhr.setRequestHeader(headerName, headerValue);
        }
      }
  
      // Progress
      if (opts && opts.onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            opts?.onProgress?.(e.loaded / e.total);
          }
        };
      }
  
      // Abort
      const onAbort = () => {
        try { xhr.abort(); } catch {}
        reject(new DOMException('Upload aborted', 'AbortError'));
      };
      opts?.signal?.addEventListener('abort', onAbort, { once: true });
  
      xhr.onload = () => {
        opts?.signal?.removeEventListener('abort', onAbort);
  
        const ok = xhr.status >= 200 && xhr.status < 300;
        if (!ok) {
          const body = (typeof xhr.responseText === 'string' ? xhr.responseText : '') || '';
          return reject(new Error(`Upload failed for ${file.name} (HTTP ${xhr.status}) ${body}`));
        }
  
        const rawETag = xhr.getResponseHeader('ETag') || undefined;
        const etag = rawETag?.replace(/^"(.*)"$/, '$1');
  
        // Prefer the signed header value for content type; fallback to file.type if absent.
        const ct =
          presigned.headers?.['Content-Type'] ??
          presigned.headers?.['content-type'] ??
          (file.type || 'application/octet-stream');
  
        resolve({
          name: file.name,
          size: file.size,
          contentType: ct,
          etag,
        });
      };
  
      xhr.onerror = () => {
        opts?.signal?.removeEventListener('abort', onAbort);
        reject(new Error(`Network/CORS error while uploading ${file.name}`));
      };
  
      xhr.send(file);
    });
  }

  async function handleStartUpload(): Promise<void> {
    try {
      setIsUploading(true);
      setErrorMessage(null);

      // Generate a unique lesson ID for this upload session
      const lessonId = generateLessonId();
      console.log('Generated lesson ID:', lessonId);

      const assetFiles = sortedFiles.filter((file) => file.name !== 'metadata.json');
      const uploadedFiles: UploadedFile[] = [];

      for (const assetFile of assetFiles) {
        const presigned = await requestPresignedUpload(assetFile, lessonId);
        console.log('Presigned URL:', presigned);
        console.log('Asset file:', assetFile);
        const uploaded = await uploadWithPresignedUrl(assetFile, presigned);
        uploadedFiles.push(uploaded);
      }

      const metadataPayload = {
        lessonId,
        createdAt: new Date().toISOString(),
        files: uploadedFiles,
      };

      const request: PresignRequest = {
        kind: PresignKind.METADATA,
        lessonId,
      };

      const metadataResponse = await fetch('/api/s3-upload-presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to presign metadata.json');
      }

      const metadataPresigned = (await metadataResponse.json()) as PresignedUpload;
      const metadataBlob = new Blob([JSON.stringify(metadataPayload, null, 2)], {
        type: 'application/json',
      });

      await uploadWithPresignedUrl(
        new File([metadataBlob], 'metadata.json', { type: 'application/json' }),
        metadataPresigned
      );

      window.location.href = '/status';
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message);
      setIsUploading(false);
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const fileList = event.target.files;
    const filesArray = fileList ? Array.from(fileList) : [];
    setSelectedFiles(filesArray);
  }

  return (
    <div className="pt-20 pb-12">
      <Container>
        <Card className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Upload</h1>
          <p className="text-sm text-zinc-600 mb-6">
            Select files to upload. We'll presign each file, then upload a summary{' '}
            <code>metadata.json</code>.
          </p>

          <Dropzone onFiles={(files) => setSelectedFiles(files)} multiple />

          {selectedFiles.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No files selected"
                description="Drag files above or browse from your computer."
              />
            </div>
          ) : (
            <ul className="mt-6 space-y-2" aria-label="Selected files">
              {sortedFiles.map((file) => (
                <FileRow key={`${file.name}-${file.size}-${file.lastModified}`} file={file} />
              ))}
            </ul>
          )}

          <div className="mt-6 flex gap-3 items-center">
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedFiles([])}
              disabled={isUploading}
            >
              Reset
            </button>
            <button
              className="btn btn-primary"
              onClick={handleStartUpload}
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading ? 'Uploading…' : 'Start upload'}
            </button>
            {isUploading && <Progress value={50} label="Uploading..." />}
          </div>

          {errorMessage && (
            <div className="mt-4 text-sm text-red-600" role="alert">
              {errorMessage}
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
}
