'use client';
import { useCallback, useRef, useState } from 'react';

type DropzoneProps = {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
};

export function Dropzone({ onFiles, accept, multiple = true }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      onFiles(Array.from(fileList));
    },
    [onFiles]
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={[
          'rounded-xl border-2 border-dashed p-6 text-center cursor-pointer',
          isOver ? 'border-brand-600 bg-brand-600/5' : 'border-zinc-300 hover:bg-zinc-50',
          'focus-ring',
        ].join(' ')}
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <p className="text-sm text-zinc-700">
          Drag and drop files here, or <span className="text-brand-700 font-medium">browse</span>
        </p>
        <p className="text-xs text-zinc-500 mt-1">Accepted: {accept || 'any'}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
