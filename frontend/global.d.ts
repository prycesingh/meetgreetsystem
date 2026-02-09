declare module "*.css";

interface FileSystemWritableFileStream {
  write: (data: Blob | BufferSource | string) => Promise<void>;
  close: () => Promise<void>;
}

interface FileSystemFileHandle {
  kind: "file";
  name: string;
  createWritable: () => Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle {
  kind: "directory";
  name: string;
  getDirectoryHandle: (
    name: string,
    options?: { create?: boolean },
  ) => Promise<FileSystemDirectoryHandle>;
  getFileHandle: (
    name: string,
    options?: { create?: boolean },
  ) => Promise<FileSystemFileHandle>;
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

interface Window {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: "readwrite" | "read";
    startIn?: string | FileSystemHandle;
  }) => Promise<FileSystemDirectoryHandle>;
}
