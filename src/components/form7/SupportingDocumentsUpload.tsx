/**
 * ODS catalog gap: no OntarioFileUpload — multi-file supporting docs for Form 7 Step 3.
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
import { formatFileBytes } from '../form1/FileUpload';
import fileStyles from '../form1/FileUpload.module.scss';
import {
  MAX_SUPPORTING_DOC_BYTES,
  type SupportingDocMeta,
} from './form7DraftStorage';

export const UNSUPPORTED_TYPE_ERROR =
  'The selected file must be a PDF.';
export const MAX_SIZE_ERROR =
  'The selected file is too large. Upload a smaller file.';
export const SECURITY_SCAN_ERROR =
  'The selected file could not be uploaded. Select a different file.';

const ACCEPTED_EXT = ['.pdf'];
const ACCEPTED_MIME = ['application/pdf'];
const ACCEPT_ATTR = '.pdf,application/pdf';
const DEFAULT_MAX_FILES = 10;

type SupportingDocumentsUploadProps = {
  label: string;
  hintText?: string;
  required?: boolean;
  maxFiles?: number;
  value: SupportingDocMeta[];
  errorMessage?: string;
  onChange: (files: SupportingDocMeta[]) => void;
  inputId?: string;
  /** Show the upload date next to file size in the list. */
  showUploadedAt?: boolean;
};

function isAcceptedFile(file: File) {
  const lower = file.name.toLowerCase();
  const extOk = ACCEPTED_EXT.some((ext) => lower.endsWith(ext));
  const mimeOk = !file.type || ACCEPTED_MIME.includes(file.type);
  return extOk && mimeOk;
}

/** Prototype stub for virus/security scanning — fails files whose name includes "failscan". */
function passesSecurityScan(file: File) {
  return !file.name.toLowerCase().includes('failscan');
}

function createDocMeta(file: File): SupportingDocMeta {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    uploadedAt: new Date().toISOString(),
  };
}

function formatUploadDate(iso: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function SupportingDocumentsUpload({
  label,
  hintText,
  required = false,
  maxFiles = DEFAULT_MAX_FILES,
  value,
  errorMessage,
  onChange,
  inputId,
  showUploadedAt = false,
}: SupportingDocumentsUploadProps) {
  const generatedId = useId();
  const id = inputId ?? `supporting-docs-${generatedId}`;
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const displayError = errorMessage || localError;
  const atMax = value.length >= maxFiles;

  function openPicker() {
    if (atMax) {
      return;
    }
    inputRef.current?.click();
  }

  function applyFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    if (atMax) {
      setLocalError(
        `You've reached the maximum of ${maxFiles} files. Remove a file to upload another.`,
      );
      return;
    }

    const next = [...value];
    let lastError: string | undefined;

    Array.from(fileList).forEach((file) => {
      if (next.length >= maxFiles) {
        lastError = `You've reached the maximum of ${maxFiles} files. Remove a file to upload another.`;
        return;
      }
      if (!isAcceptedFile(file)) {
        lastError = UNSUPPORTED_TYPE_ERROR;
        return;
      }
      if (file.size > MAX_SUPPORTING_DOC_BYTES) {
        lastError = MAX_SIZE_ERROR;
        return;
      }
      if (!passesSecurityScan(file)) {
        lastError = SECURITY_SCAN_ERROR;
        return;
      }
      next.push(createDocMeta(file));
    });

    setLocalError(lastError);
    onChange(next);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function removeDoc(docId: string) {
    setLocalError(undefined);
    onChange(value.filter((doc) => doc.id !== docId));
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
    applyFiles(event.dataTransfer.files);
  }

  return (
    <div className={fileStyles.root} id={id}>
      <label className={fileStyles.label} htmlFor={`${id}-input`}>
        {label}
        {required ? <span className={fileStyles.required}> (required)</span> : null}
      </label>

      {hintText ? <OntarioHintText hint={hintText} /> : null}

      {displayError ? (
        <div id={errorId} className={fileStyles.errorMessaging} role="alert">
          <OntarioIconAlertError iconWidth={24} isDecorative />
          <div className={fileStyles.errorContent}>{displayError}</div>
        </div>
      ) : null}

      <div
        className={`${fileStyles.dropZone} ${dragActive ? fileStyles.dropZoneActive : ''} ${
          displayError ? fileStyles.dropZoneError : ''
        } ${atMax ? fileStyles.dropZoneDisabled : ''}`}
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
        <p className={fileStyles.dropLead}>Drag and drop here or</p>
        <OntarioButton
          type="secondary"
          htmlType="button"
          label="Upload a file"
          onClick={(event) => {
            event.stopPropagation();
            openPicker();
          }}
        />
        <ul className={fileStyles.specs}>
          <li>
            You can upload up to <strong>{maxFiles}</strong> files
          </li>
          <li>
            Maximum file size:{' '}
            <strong>{Math.round(MAX_SUPPORTING_DOC_BYTES / (1024 * 1024))} MB</strong> per
            file
          </li>
          <li>
            Accepted file types: <strong>PDF</strong>
          </li>
        </ul>
      </div>

      {value.length > 0 ? (
        <>
          <p className={`ontario-h6 ${fileStyles.uploadCount}`}>
            {value.length} file{value.length === 1 ? '' : 's'} uploaded
          </p>
          {atMax ? (
            <div className={fileStyles.maxInfo} role="status">
              <OntarioIconAlertInformation iconWidth={24} isDecorative />
              <p className={fileStyles.maxInfoText}>
                You&apos;ve reached the maximum of {maxFiles} files. Remove a file to
                upload another.
              </p>
            </div>
          ) : null}
          <ul className={fileStyles.fileList}>
            {value.map((doc) => (
              <li key={doc.id} className={fileStyles.fileItem}>
                <div className={fileStyles.fileMain}>
                  <OntarioIconDocument colour="black" iconWidth={24} isDecorative />
                  <div className={fileStyles.fileMeta}>
                    <a
                      className={fileStyles.fileLink}
                      href={`#${id}-${doc.id}`}
                      onClick={(event) => event.preventDefault()}
                    >
                      {doc.name}
                    </a>
                    <span className={fileStyles.fileSize}>
                      {showUploadedAt && formatUploadDate(doc.uploadedAt)
                        ? `${formatUploadDate(doc.uploadedAt)} · ${formatFileBytes(doc.size)}`
                        : formatFileBytes(doc.size)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={fileStyles.removeButton}
                  aria-label={`Remove ${doc.name}`}
                  onClick={() => removeDoc(doc.id)}
                >
                  <OntarioIconClose colour="black" iconWidth={16} isDecorative />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <input
        ref={inputRef}
        id={`${id}-input`}
        className={fileStyles.hiddenInput}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        disabled={atMax}
        onChange={(event) => applyFiles(event.target.files)}
      />
    </div>
  );
}
