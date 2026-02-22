import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Film, Music, Archive } from 'lucide-react';

type FileUploadSize = 'sm' | 'md' | 'lg';

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  size?: FileUploadSize;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
  showPreview?: boolean;
  className?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress?: number;
}

const SIZE_CONFIG: Record<FileUploadSize, {
  padding: string;
  fontSize: string;
  iconSize: number;
  labelSize: string;
}> = {
  sm: {
    padding: '1.5rem',
    fontSize: '0.8125rem',
    iconSize: 32,
    labelSize: '0.75rem',
  },
  md: {
    padding: '2rem',
    fontSize: '0.875rem',
    iconSize: 40,
    labelSize: '0.8125rem',
  },
  lg: {
    padding: '3rem',
    fontSize: '1rem',
    iconSize: 48,
    labelSize: '0.875rem',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    color: '#ccc',
    fontWeight: '500',
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dropzoneActive: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.1)',
  },
  dropzoneDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  dropzoneError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  icon: {
    color: '#666',
    marginBottom: '0.75rem',
  },
  text: {
    color: '#888',
    textAlign: 'center',
  },
  highlight: {
    color: '#6366f1',
    fontWeight: '500',
  },
  subtext: {
    color: '#666',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  input: {
    display: 'none',
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  fileIcon: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '8px',
    color: '#6366f1',
    flexShrink: 0,
  },
  filePreview: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileSize: {
    color: '#666',
    fontSize: '0.75rem',
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  helperText: {
    fontSize: '0.75rem',
    color: '#888',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
  },
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  if (type.includes('zip') || type.includes('archive')) return Archive;
  return File;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  accept,
  multiple = false,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  size = 'md',
  disabled = false,
  label,
  helperText,
  errorText,
  showPreview = true,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [hoveredRemove, setHoveredRemove] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sizeConfig = SIZE_CONFIG[size];

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles || disabled) return;

    const validFiles: UploadedFile[] = [];
    const fileArray = Array.from(newFiles);

    for (const file of fileArray) {
      if (maxSize && file.size > maxSize) continue;
      if (files.length + validFiles.length >= maxFiles) break;

      const uploadedFile: UploadedFile = { file };

      if (showPreview && file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      validFiles.push(uploadedFile);
    }

    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(updatedFiles);
    onFilesSelected?.(updatedFiles.map((f) => f.file));
  }, [disabled, files, maxFiles, maxSize, multiple, onFilesSelected, showPreview]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesSelected?.(updatedFiles.map((f) => f.file));
  };

  return (
    <div style={styles.container} className={className}>
      {label && (
        <label style={{ ...styles.label, fontSize: sizeConfig.labelSize }}>
          {label}
        </label>
      )}

      <div
        style={{
          ...styles.dropzone,
          ...(isDragging ? styles.dropzoneActive : {}),
          ...(disabled ? styles.dropzoneDisabled : {}),
          ...(errorText ? styles.dropzoneError : {}),
          padding: sizeConfig.padding,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Upload size={sizeConfig.iconSize} style={styles.icon} />
        <p style={{ ...styles.text, fontSize: sizeConfig.fontSize }}>
          <span style={styles.highlight}>Click to upload</span> or drag and drop
        </p>
        <p style={styles.subtext}>
          {accept ? `Accepted: ${accept}` : 'Any file type'} • Max {formatFileSize(maxSize)}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          style={styles.input}
          disabled={disabled}
        />
      </div>

      {files.length > 0 && (
        <div style={styles.fileList}>
          {files.map((uploadedFile, index) => {
            const FileIcon = getFileIcon(uploadedFile.file.type);
            return (
              <div key={index} style={styles.fileItem}>
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    style={styles.filePreview}
                  />
                ) : (
                  <div style={styles.fileIcon}>
                    <FileIcon size={20} />
                  </div>
                )}
                <div style={styles.fileInfo}>
                  <div style={styles.fileName}>{uploadedFile.file.name}</div>
                  <div style={styles.fileSize}>{formatFileSize(uploadedFile.file.size)}</div>
                </div>
                <button
                  style={{
                    ...styles.removeButton,
                    ...(hoveredRemove === index
                      ? { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }
                      : {}),
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  onMouseEnter={() => setHoveredRemove(index)}
                  onMouseLeave={() => setHoveredRemove(null)}
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {errorText && <span style={styles.errorText}>{errorText}</span>}
      {helperText && !errorText && <span style={styles.helperText}>{helperText}</span>}
    </div>
  );
};

export default FileUpload;
