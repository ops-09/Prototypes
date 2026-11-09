import { useSearchParams } from 'react-router-dom';
import type { ContinuanceFormId } from './continuanceDraftStorage';

export const REVIEW_RETURN_PARAM = 'returnTo';
export const REVIEW_RETURN_VALUE = 'review';

export function continuanceReviewPath(formId: ContinuanceFormId) {
  return `/form-${formId}/step-10`;
}

export function isReviewReturn(searchParams: URLSearchParams) {
  return searchParams.get(REVIEW_RETURN_PARAM) === REVIEW_RETURN_VALUE;
}

export function withReviewReturn(href: string, returnToReview: boolean) {
  if (!returnToReview) {
    return href;
  }
  const joiner = href.includes('?') ? '&' : '?';
  return `${href}${joiner}${REVIEW_RETURN_PARAM}=${REVIEW_RETURN_VALUE}`;
}

export function coverLetterReviewHref(formId: ContinuanceFormId) {
  return withReviewReturn(`/form-${formId}/step-1`, true);
}

export function isCoverLetterReviewReturn(
  value: string | null,
): value is '/form-14/step-10' | '/form-15/step-10' {
  return value === '/form-14/step-10' || value === '/form-15/step-10';
}

export function continuanceContinueTarget(
  formId: ContinuanceFormId,
  defaultHref: string,
  searchParams: URLSearchParams,
) {
  return isReviewReturn(searchParams) ? continuanceReviewPath(formId) : defaultHref;
}

export function useContinuanceReviewReturn(formId: ContinuanceFormId) {
  const [searchParams] = useSearchParams();
  const returnToReview = isReviewReturn(searchParams);

  function afterSave(defaultHref: string) {
    return continuanceContinueTarget(formId, defaultHref, searchParams);
  }

  function hrefWithReturn(href: string) {
    return withReviewReturn(href, returnToReview);
  }

  return { returnToReview, afterSave, hrefWithReturn };
}
