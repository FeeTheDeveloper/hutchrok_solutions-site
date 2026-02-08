import { NextResponse } from "next/server";

/**
 * Standardized API error response shape:
 * { ok: false, error: { code: string, message: string } }
 *
 * Also supports field-level validation errors:
 * { ok: false, error: { code: "VALIDATION_ERROR", message: "...", fields: { ... } } }
 */

export interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export interface ApiSuccessBody {
  ok: true;
  [key: string]: unknown;
}

/** Common error codes */
export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  BAD_REQUEST: "BAD_REQUEST",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export function apiError(
  code: string,
  message: string,
  status: number,
  fields?: Record<string, string>
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      ok: false as const,
      error: { code, message, ...(fields ? { fields } : {}) },
    },
    { status }
  );
}

export function apiSuccess(
  data: Record<string, unknown>,
  status = 200
): NextResponse<ApiSuccessBody> {
  return NextResponse.json({ ok: true as const, ...data }, { status });
}
