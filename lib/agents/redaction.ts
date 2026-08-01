const MAX_DEPTH = 6;
const MAX_KEYS = 75;
const MAX_ARRAY_ITEMS = 25;
const MAX_STRING_LENGTH = 1500;

const SECRET_KEY_RE =
  /(api[_-]?key|authorization|bearer|token|secret|password|private[_-]?key|cookie|session)/i;
const FINANCIAL_KEY_RE =
  /(routing|account.?number|bank|card|cvv|cvc|payment.?method)/i;
const GOVERNMENT_ID_RE =
  /(ssn|social.?security|ein|tin|tax.?id|driver.?license|passport)/i;
const DOCUMENT_KEY_RE =
  /(dd[-_ ]?214|discharge[_-]?document|signature|raw[_-]?document|document[_-]?content|file[_-]?bytes|base64)/i;
const CONTACT_KEY_RE =
  /(email|phone|mobile|street.?address|mailing.?address|principal.?address|physical.?address|property.?address)/i;
const PERSON_KEY_RE =
  /(full.?name|client.?name|owner.?name|organizer.?name|contact.?name|date.?of.?birth|birth.?date|dob)/i;

const OPENAI_KEY_VALUE_RE = /\bsk-[A-Za-z0-9_-]{16,}\b/g;
const BEARER_VALUE_RE = /\bBearer\s+[A-Za-z0-9._~+\/-]{12,}=*/gi;
const EMAIL_VALUE_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const SSN_VALUE_RE = /\b\d{3}-\d{2}-\d{4}\b/g;
const EIN_VALUE_RE = /\b\d{2}-\d{7}\b/g;
const PHONE_VALUE_RE =
  /(?<!\d)(?:\+?1[ .-]?)?(?:\(\d{3}\)|\d{3})[ .-]?\d{3}[ .-]?\d{4}(?!\d)/g;
const LONG_NUMBER_RE = /(?<!\d)\d{12,19}(?!\d)/g;

function redactValueForKey(key: string): string | null {
  if (SECRET_KEY_RE.test(key)) return "[SECRET REDACTED]";
  if (FINANCIAL_KEY_RE.test(key)) return "[FINANCIAL DATA REDACTED]";
  if (GOVERNMENT_ID_RE.test(key)) return "[GOVERNMENT ID REDACTED]";
  if (DOCUMENT_KEY_RE.test(key)) return "[PRIVATE DOCUMENT REDACTED]";
  if (CONTACT_KEY_RE.test(key)) return "[CONTACT DATA REDACTED]";
  if (PERSON_KEY_RE.test(key)) return "[PERSONAL DATA REDACTED]";
  return null;
}

export function redactAgentText(value: string): string {
  const redacted = value
    .replace(OPENAI_KEY_VALUE_RE, "[OPENAI KEY REDACTED]")
    .replace(BEARER_VALUE_RE, "[BEARER TOKEN REDACTED]")
    .replace(EMAIL_VALUE_RE, "[EMAIL REDACTED]")
    .replace(SSN_VALUE_RE, "[SSN REDACTED]")
    .replace(EIN_VALUE_RE, "[EIN REDACTED]")
    .replace(PHONE_VALUE_RE, "[PHONE REDACTED]")
    .replace(LONG_NUMBER_RE, "[LONG NUMBER REDACTED]")
    .trim();

  if (redacted.length <= MAX_STRING_LENGTH) return redacted;
  return `${redacted.slice(0, MAX_STRING_LENGTH)}...[TRUNCATED]`;
}

function sanitizeUnknown(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) return "[MAX DEPTH REACHED]";
  if (value === null || value === undefined) return value ?? null;

  if (typeof value === "string") return redactAgentText(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeUnknown(item, depth + 1));
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).slice(
      0,
      MAX_KEYS,
    );
    const output: Record<string, unknown> = {};

    for (const [key, nestedValue] of entries) {
      const replacement = redactValueForKey(key);
      output[key] = replacement ?? sanitizeUnknown(nestedValue, depth + 1);
    }

    return output;
  }

  return redactAgentText(String(value));
}

/**
 * Minimize and redact agent input before it is stored or sent to a model.
 * Callers should still supply the least data necessary for the task.
 */
export function redactAgentInput(value: unknown): unknown {
  return sanitizeUnknown(value, 0);
}

/** Persist only a short, redacted error message in the task ledger. */
export function redactAgentError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return redactAgentText(message).slice(0, 1500);
}
