export type ClaimExtractionErrorCode =
  | "not_configured"
  | "unavailable"
  | "api_error"
  | "incomplete"
  | "refused"
  | "invalid_output";

export class ClaimExtractionError extends Error {
  constructor(
    public readonly code: ClaimExtractionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ClaimExtractionError";
  }
}

export class PassageExtractionError extends ClaimExtractionError {
  constructor(
    code: ClaimExtractionErrorCode,
    message: string,
    public readonly passageIds: string[],
  ) {
    super(code, message);
    this.name = "PassageExtractionError";
  }
}
