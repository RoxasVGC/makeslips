interface FileSystemFileHandle {
    getFile(): Promise<File>;
}

interface Window {
    showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
}
