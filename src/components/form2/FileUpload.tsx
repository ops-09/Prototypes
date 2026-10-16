/**
 * ODS catalog gap: no OntarioFileUpload component exists in v8.1.0.
 * Composed from OntarioIconUpload, OntarioIconDocument, OntarioIconClose,
 * OntarioButton, OntarioHintText + design tokens.
 */
import { useId, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import {
  OntarioButton,
  OntarioHintText,
  OntarioIconAlertError,
  OntarioIconAlertInformation,
  OntarioIconClose,
  OntarioIconDocument,
  OntarioIconUpload,
} from '@ongov/ontario-design-system-component-library-react';
import styles from './FileUpload.module.scss';

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_MIME = ['application/pdf'];
const ACCEPTED_EXT = ['.pdf'];

export type UploadedFileMeta = {
  name: string;
  size: number;
  type: string;
};

type FileUploadProps = {
  label: string;
  hintText?: string;
  required?: boolean;
  maxFiles?: number;
  errorMessage?: string;
  /** Drop-zone button label. Defaults to “Upload a file”. */
  buttonLabel?: string;
  value: UploadedFileMeta | null;
  onChange: (file: UploadedFileMeta | null, fileObject: File | null) => void;
  inputId?: string;
};

function isAcceptedFile(file: File) {
  const lower = file.name.toLowerCase();
  const extOk = ACCEPTED_EXT.some((ext) => lower.endsWith(ext));
  const mimeOk = !file.type || ACCEPTED_MIME.includes(file.type);
  return extOk && mimeOk;
}

export function formatFileBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  label,
  hintText,
  required = false,
  maxFiles = 1,
  errorMessage,
  buttonLabel = 'Upload a file',
  value,
  onChange,
  inputId,
}: FileUploadProps) {
  const generatedId = useId();
  const id = inputId ?? `file-upload-${generatedId}`;
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const displayError = errorMessage || localError;
  const fileCount = value ? 1 : 0;
  const atMax = fileCount >= maxFiles;

  function openPicker() {
    if (atMax) {
      return;
    }
    inputRef.current?.click();
  }

  function applyFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!isAcceptedFile(file)) {
      setLocalError('Upload a PDF file.');
      onChange(null, null);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setLocalError('Each file must be 20 MB or smaller.');
      onChange(null, null);
      return;
    }

    setLocalError(undefined);
    onChange({ name: file.name, size: file.size, type: file.type || 'application/pdf' }, file);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }
    if (atMax) {
      setLocalError(
        `You've reached the maximum of ${maxFiles} file${maxFiles === 1 ? '' : 's'}. Remove a file to upload another.`,
      );
      return;
    }
    if (files.length > maxFiles) {
      setLocalError(`You can upload up to ${maxFiles} file${maxFiles === 1 ? '' : 's'}.`);
      return;
    }
    applyFile(files[0]);
  }

  function removeFile() {
    setLocalError(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onChange(null, null);
  }

  function onDropZoneKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (atMax) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
    }
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!atMax) {
      setDragActive(true);
    }
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className={styles.root} id={id}>
      <label className={styles.label} htmlFor={`${id}-input`}>
        {label}
        {required ? <span className={styles.required}> (required)</span> : null}
      </label>

      {hintText ? <OntarioHintText hint={hintText} /> : null}

      {displayError ? (
        <div id={errorId} className={styles.errorMessaging} role="alert">
          <OntarioIconAlertError iconWidth={24} isDecorative />
          <div className={styles.errorContent}>{displayError}</div>
        </div>
      ) : null}

      <div
        className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''} ${
          displayError ? styles.dropZoneError : ''
        } ${atMax ? styles.dropZoneDisabled : ''}`}
        role="button"
        tabIndex={atMax ? -1 : 0}
        aria-disabled={atMax}
        aria-describedby={displayError ? errorId : undefined}
        onKeyDown={onDropZoneKeyDown}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openPicker}
      >
        <OntarioIconUpload colour="black" iconWidth={32} isDecorative />
        <p className={styles.dropLead}>Drag and drop here or</p>
        <OntarioButton
          type="secondary"
          htmlType="button"
          label={buttonLabel}
          onClick={(event) => {
            event.stopPropagation();
            openPicker();
          }}
        />
        <ul className={styles.specs}>
          <li>
            You can upload up to <strong>{maxFiles}</strong> file{maxFiles === 1 ? '' : 's'}
          </li>
          <li>
            Maximum file size: <strong>20 MB</strong> per file
          </li>
          <li>
            Accepted file types: <strong>PDF</strong>
          </li>
        </ul>
      </div>

      {value ? (
        <>
          <p className={`ontario-h6 ${styles.uploadCount}`}>
            {fileCount} file{fileCount === 1 ? '' : 's'} uploaded
          </p>
          {atMax ? (
            <div className={styles.maxInfo} role="status">
              <OntarioIconAlertInformation iconWidth={24} isDecorative />
              <p className={styles.maxInfoText}>
                You&apos;ve reached the maximum of {maxFiles} file
                {maxFiles === 1 ? '' : 's'}. Remove a file to upload another.
              </p>
            </div>
          ) : null}
          <ul className={styles.fileList}>
            <li className={styles.fileItem}>
              <div className={styles.fileMain}>
                <OntarioIconDocument colour="black" iconWidth={24} isDecorative />
                <div className={styles.fileMeta}>
                  <a
                    className={styles.fileLink}
                    href={`#${id}-file`}
                    onClick={(event) => event.preventDefault()}
                  >
                    {value.name}
                  </a>
                  <span className={styles.fileSize}>{formatFileBytes(value.size)}</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.removeButton}
                aria-label={`Remove ${value.name}`}
                onClick={removeFile}
              >
                <OntarioIconClose colour="black" iconWidth={16} isDecorative />
                Remove
              </button>
            </li>
          </ul>
        </>
      ) : null}

      <input
        ref={inputRef}
        id={`${id}-input`}
        className={styles.hiddenInput}
        type="file"
        accept=".pdf,application/pdf"
        disabled={atMax}
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
