import { Link } from "react-router-dom";
import { OntarioIconNewWindow } from "@ongov/ontario-design-system-component-library-react";
import {
  openUploadedFile,
  type ReviewFileLink,
} from "../shared/uploadedFilePreview";
import styles from "./Form7SummaryList.module.scss";

export type Form7SummaryListItem = {
  name: string;
  description: string;
  /** Uploaded files shown as links that open a preview in a new tab instead of `description`. */
  files?: ReviewFileLink[];
};

type Form7SummaryListProps = {
  caption: string;
  headingLevel?: "h2" | "h3" | "h4";
  /** Section-level Edit link (ODS captionActionLink equivalent). */
  captionActionLink?: { href: string; label?: string };
  items: Form7SummaryListItem[];
  columnRatio?: "1-1" | "1-2" | "1-3" | "2-1" | "2-3";
};

/**
 * ODS Summary List pattern for review pages.
 * OntarioSummaryList / OntarioSummaryListItem are not exported in ODS React 8.1.0 —
 * compose the documented HTML/CSS structure with tokens until the package ships them.
 * @see https://designsystem.ontario.ca/developer-docs/components/ontario-summary-list/
 */
export function Form7SummaryList({
  caption,
  headingLevel = "h3",
  captionActionLink,
  items,
  columnRatio = "1-2",
}: Form7SummaryListProps) {
  const HeadingTag = headingLevel;
  const actionLabel = captionActionLink?.label ?? "Change";
  const ratioClass =
    columnRatio === "1-2"
      ? styles.ratio1_2
      : columnRatio === "1-3"
        ? styles.ratio1_3
        : columnRatio === "2-1"
          ? styles.ratio2_1
          : columnRatio === "2-3"
            ? styles.ratio2_3
            : undefined;

  return (
    <div className={styles.summaryList}>
      <div className={styles.headingContainer}>
        <HeadingTag className={styles.heading}>{caption}</HeadingTag>
        {captionActionLink ? (
          <div className={styles.headingButtons}>
            <Link className={styles.changeButton} to={captionActionLink.href}>
              {actionLabel}
              <span className={styles.srOnly}>
                {" "}
                your answers for: <q>{caption}</q>
              </span>
            </Link>
          </div>
        ) : null}
      </div>

      {items.length > 0 ? (
        <dl className={`${styles.container} ${ratioClass ?? ""}`.trim()}>
          {items.map((item) => (
            <div
              key={`${item.name}-${item.description}`}
              className={styles.row}
            >
              <dt className={styles.key}>{item.name}</dt>
              <dd className={styles.value}>
                <span className={styles.srOnly}>Your answer is: </span>
                {item.files?.length
                  ? item.files.map((file, fileIndex) => (
                      <div key={`${item.name}-file-${fileIndex}`}>
                        <a
                          className={styles.fileLink}
                          href={`#${item.name}-file-${fileIndex}`}
                          onClick={(event) => {
                            event.preventDefault();
                            openUploadedFile(file);
                          }}
                        >
                          <OntarioIconNewWindow
                            colour="blue"
                            iconWidth={24}
                            isDecorative
                          />
                          <span className={styles.fileLinkText}>{file.name}</span>
                          <span className={styles.srOnly}> (opens in a new tab)</span>
                        </a>
                      </div>
                    ))
                  : item.description.split("\n").map((line, lineIndex) => (
                      <div key={`${item.name}-line-${lineIndex}`}>{line}</div>
                    ))}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
