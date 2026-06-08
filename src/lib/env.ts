const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "RESEND_API_KEY",
  "OPENAI_API_KEY",
] as const;

let validated = false;

export function validateServerEnv() {
  if (validated) {
    return;
  }

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  validated = true;
}
