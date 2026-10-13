export class KashRockError extends Error {
  constructor(message, { status = null, body = null } = {}) {
    super(message)
    this.name = "KashRockError"
    this.status = status
    this.body = body
  }
}

export class KashRockAuthError extends KashRockError {
  constructor(message, opts = {}) {
    super(message, opts)
    this.name = "KashRockAuthError"
  }
}

export class KashRockPlanError extends KashRockError {
  constructor(message, opts = {}) {
    super(message, opts)
    this.name = "KashRockPlanError"
    this.upgradeUrl = opts.upgradeUrl || "https://www.kashrock.com/pricing"
  }
}

export class KashRockRateLimitError extends KashRockError {
  constructor(message, opts = {}) {
    super(message, opts)
    this.name = "KashRockRateLimitError"
  }
}

export function raiseForStatus(status, body) {
  // A V7 refusal nests one shape under "error"; V6 serves a flat "detail".
  const code = typeof body?.error?.code === "string" ? body.error.code : ""
  const text =
    typeof body?.error?.message === "string"
      ? body.error.message
      : typeof body?.detail === "string"
      ? body.detail
      : body?.detail
        ? JSON.stringify(body.detail)
        : typeof body === "string"
          ? body
          : JSON.stringify(body)
  const opts = { status, body, upgradeUrl: body?.error?.upgrade_url }
  if (code === "rate_limited" || code === "quota_exceeded") {
    throw new KashRockRateLimitError(text, opts)
  }
  if (code === "plan_required" || ((status === 401 || status === 403) && /plan/i.test(text))) {
    throw new KashRockPlanError(text, opts)
  }
  if (status === 401 || status === 403) throw new KashRockAuthError(text, opts)
  if (status === 429) throw new KashRockRateLimitError(text, opts)
  throw new KashRockError(text, opts)
}
