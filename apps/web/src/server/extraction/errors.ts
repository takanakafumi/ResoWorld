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
