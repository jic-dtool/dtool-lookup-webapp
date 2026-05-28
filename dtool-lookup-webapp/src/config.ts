/**
 * Build-time webapp configuration flags.
 *
 * Centralised so views/stores import from one place rather than reading
 * `process.env` directly.
 */

export const authEnabled = process.env.VUE_APP_AUTH_ENABLED !== "false";
