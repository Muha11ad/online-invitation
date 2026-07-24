"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/shared/ui/button";

export function MediaUploadSlot({
  slug,
  kind,
  accept,
  maxBytes,
  value,
  onChange,
}: MediaUploadSlotProps): React.JSX.Element {
  const [transient, setTransient] = useState<TransientState>({ type: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const disabled = slug.trim().length === 0;

  function handlePick(): void {
    inputRef.current?.click();
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const validationError = validateFile(file, accept, maxBytes);
    if (validationError) {
      setTransient({ type: "invalid", message: validationError });
      return;
    }

    void startUpload(file);
  }

  async function startUpload(file: File): Promise<void> {
    setTransient({ type: "uploading", progress: 0 });

    try {
      const { uploadUrl, publicUrl } = await requestPresignedUrl(slug, kind, file);
      await putFile(uploadUrl, file, xhrRef, (progress) => {
        setTransient({ type: "uploading", progress });
      });

      onChange(publicUrl);
      setTransient({ type: "idle" });
    } catch (error) {
      if (isAbortError(error)) {
        setTransient({ type: "idle" });
        return;
      }
      setTransient({ type: "error", file });
    }
  }

  function handleCancel(): void {
    xhrRef.current?.abort();
  }

  function handleRetry(file: File): void {
    void startUpload(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelected}
      />

      {transient.type === "uploading" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Uploading… {transient.progress}%</span>
          <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      )}

      {transient.type === "error" && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-destructive">Upload failed</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRetry(transient.file)}
          >
            Retry
          </Button>
        </div>
      )}

      {transient.type === "idle" && value && (
        <div className="flex flex-col gap-2">
          <MediaPreview kind={kind} url={value} />
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handlePick}>
              Replace
            </Button>
            <span className="truncate text-sm text-muted-foreground">{value}</span>
          </div>
        </div>
      )}

      {transient.type === "idle" && !value && (
        <div className="flex flex-col gap-1">
          <Button type="button" variant="outline" onClick={handlePick} disabled={disabled}>
            Choose file
          </Button>
          {disabled && (
            <p className="text-sm text-muted-foreground">
              Enter couple names and date to generate a URL first
            </p>
          )}
        </div>
      )}

      {transient.type === "invalid" && (
        <div className="flex flex-col gap-1">
          <Button type="button" variant="outline" onClick={handlePick} disabled={disabled}>
            Choose file
          </Button>
          <p className="text-sm text-destructive">{transient.message}</p>
        </div>
      )}
    </div>
  );
}

function MediaPreview({ kind, url }: { kind: MediaKind; url: string }): React.JSX.Element {
  if (kind === "audios") {
    return <audio controls src={url} className="w-full" />;
  }

  return (
    <div className="relative h-40 w-full">
      <Image src={url} alt="" fill sizes="320px" className="rounded-md object-contain" />
    </div>
  );
}

function validateFile(file: File, accept: string, maxBytes: number): string | null {
  const acceptedPrefixes = accept.split(",").map((entry) => entry.trim());
  const matchesType = acceptedPrefixes.some((prefix) =>
    prefix.endsWith("/*") ? file.type.startsWith(prefix.slice(0, -1)) : file.type === prefix,
  );
  if (!matchesType) {
    return "This file type is not supported.";
  }

  if (file.size > maxBytes) {
    return `File is too large (max ${Math.floor(maxBytes / (1024 * 1024))}MB).`;
  }

  return null;
}

async function requestPresignedUrl(
  slug: string,
  kind: MediaKind,
  file: File,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const response = await fetch("/api/admin/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug,
      kind,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to request an upload URL");
  }

  return response.json() as Promise<{ uploadUrl: string; publicUrl: string }>;
}

function putFile(
  uploadUrl: string,
  file: File,
  xhrRef: React.RefObject<XMLHttpRequest | null>,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      xhrRef.current = null;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => {
      xhrRef.current = null;
      reject(new Error("Upload failed"));
    };

    xhr.onabort = () => {
      xhrRef.current = null;
      reject(new DOMException("Upload aborted", "AbortError"));
    };

    xhr.send(file);
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

type MediaKind = "audios" | "images";

type TransientState =
  | { type: "idle" }
  | { type: "invalid"; message: string }
  | { type: "uploading"; progress: number }
  | { type: "error"; file: File };

interface MediaUploadSlotProps {
  slug: string;
  kind: MediaKind;
  accept: string;
  maxBytes: number;
  value?: string;
  onChange: (url: string) => void;
}
