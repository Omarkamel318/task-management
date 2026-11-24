import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../models/problem-details.model';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly title: string,
    readonly detail: string | null,
    readonly errors: Record<string, string[]>
  ) {
    super(detail ?? title);
    this.name = 'ApiError';
  }
}

export function toApiError(response: HttpErrorResponse): ApiError {
  const problem = isProblemDetails(response.error) ? response.error : null;
  return new ApiError(
    response.status,
    problem?.title ?? response.statusText ?? 'Error',
    problem?.detail ?? null,
    problem?.errors ?? {}
  );
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === 'object' && value !== null && ('title' in value || 'status' in value);
}
