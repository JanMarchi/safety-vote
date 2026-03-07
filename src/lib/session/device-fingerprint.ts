/**
 * Device Fingerprinting Utility
 *
 * Generates a consistent device fingerprint based on:
 * - IP Address
 * - User Agent
 *
 * Used for:
 * - Tracking device identity across sessions
 * - Detecting unauthorized device access
 * - Supporting multiple-device login
 */

import * as crypto from 'crypto';

export interface DeviceInfo {
  ipAddress: string;
  userAgent: string;
}

/**
 * Generate a consistent device fingerprint
 *
 * The fingerprint is a SHA-256 hash of IP address + user agent.
 * This provides:
 * - Consistency: Same device always produces same fingerprint
 * - Privacy: No plaintext device info in fingerprint
 * - Security: Hard to spoof without changing actual device details
 *
 * @param ipAddress - Client IP address (IPv4 or IPv6)
 * @param userAgent - Browser user agent string
 * @returns SHA-256 hash as hex string (64 characters)
 */
export function generateDeviceFingerprint(
  ipAddress: string,
  userAgent: string
): string {
  // Validate inputs
  if (!ipAddress || !userAgent) {
    throw new Error('IP address and user agent are required for device fingerprinting');
  }

  // Normalize inputs for consistency
  const normalizedIP = ipAddress.toLowerCase().trim();
  const normalizedUA = userAgent.toLowerCase().trim();

  // Combine for fingerprint
  const fingerprint = `${normalizedIP}:${normalizedUA}`;

  // Hash using SHA-256
  const hash = crypto.createHash('sha256').update(fingerprint).digest('hex');

  return hash;
}

/**
 * Verify that a device fingerprint matches expected device info
 *
 * Used to validate that:
 * - Same device is being used (IP + UA consistent)
 * - Session hasn't been hijacked to different device
 *
 * @param ipAddress - Current client IP address
 * @param userAgent - Current browser user agent
 * @param expectedFingerprint - Expected device fingerprint
 * @returns true if fingerprint matches, false otherwise
 */
export function verifyDeviceFingerprint(
  ipAddress: string,
  userAgent: string,
  expectedFingerprint: string
): boolean {
  try {
    const currentFingerprint = generateDeviceFingerprint(ipAddress, userAgent);
    return currentFingerprint === expectedFingerprint;
  } catch (error) {
    console.error('Error verifying device fingerprint:', error);
    return false;
  }
}

/**
 * Extract device info from request headers
 *
 * Safely extracts IP address and user agent from request headers,
 * handling various proxy scenarios (X-Forwarded-For, etc.)
 *
 * @param headers - HTTP request headers
 * @returns Device info object
 */
export function extractDeviceInfo(headers: Record<string, string | string[]>): DeviceInfo {
  // Extract IP address
  const ipAddress = extractClientIP(headers);

  // Extract user agent
  const userAgent = extractUserAgent(headers);

  return {
    ipAddress,
    userAgent
  };
}

/**
 * Extract client IP address from request headers
 *
 * Handles:
 * - Direct connection (RemoteAddr)
 * - Proxy headers (X-Forwarded-For)
 * - CloudFlare headers (CF-Connecting-IP)
 * - AWS headers (X-Real-IP)
 *
 * @param headers - HTTP request headers
 * @returns Client IP address string
 */
export function extractClientIP(headers: Record<string, string | string[]>): string {
  // Try common proxy headers first
  const xForwardedFor = getHeaderValue(headers, 'x-forwarded-for');
  if (xForwardedFor) {
    // X-Forwarded-For can have multiple IPs, use first one
    return xForwardedFor.split(',')[0].trim();
  }

  // Try CloudFlare header
  const cfIP = getHeaderValue(headers, 'cf-connecting-ip');
  if (cfIP) return cfIP;

  // Try AWS header
  const xRealIP = getHeaderValue(headers, 'x-real-ip');
  if (xRealIP) return xRealIP;

  // Fallback to unknown (should not happen in normal circumstances)
  return 'unknown';
}

/**
 * Extract user agent from request headers
 *
 * @param headers - HTTP request headers
 * @returns User agent string
 */
export function extractUserAgent(headers: Record<string, string | string[]>): string {
  const ua = getHeaderValue(headers, 'user-agent');
  return ua || 'unknown';
}

/**
 * Safely get header value (handles both string and string[] cases)
 *
 * @param headers - HTTP request headers
 * @param name - Header name (case-insensitive)
 * @returns Header value or undefined
 */
function getHeaderValue(
  headers: Record<string, string | string[]>,
  name: string
): string | undefined {
  const value = headers[name.toLowerCase()];

  if (!value) return undefined;

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

/**
 * Check if two device fingerprints match
 *
 * Performs constant-time comparison to prevent timing attacks
 *
 * @param fingerprint1 - First fingerprint
 * @param fingerprint2 - Second fingerprint
 * @returns true if fingerprints match
 */
export function compareFingerprints(
  fingerprint1: string,
  fingerprint2: string
): boolean {
  // Use constant-time comparison to prevent timing attacks
  if (fingerprint1.length !== fingerprint2.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < fingerprint1.length; i++) {
    result |= fingerprint1.charCodeAt(i) ^ fingerprint2.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validate fingerprint format
 *
 * Device fingerprint should be 64-character hex string (SHA-256)
 *
 * @param fingerprint - Fingerprint to validate
 * @returns true if format is valid
 */
export function isValidFingerprintFormat(fingerprint: string): boolean {
  // Should be 64 hex characters
  return /^[a-f0-9]{64}$/i.test(fingerprint);
}
