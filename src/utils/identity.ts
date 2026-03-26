import crypto from 'crypto';

// 34. Refactor ID Generation for Concurrency Support
// Pre-allocate buffer for better performance
export const generateClickId = (): string => {
  const timestampHex = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const buffer = Buffer.allocUnsafe(8);
  crypto.randomFillSync(buffer);
  const randomHex = buffer.toString('hex');
  return `${timestampHex}${randomHex}`;
};

// 9. Create Click ID Validation and Extraction Utility
export const validateClickId = (clickId: string): { isValid: boolean; timestamp?: number } => {
  const pattern = /^[0-9a-f]{24}$/i;
  if (!pattern.test(clickId)) {
    return { isValid: false };
  }

  const timestampHex = clickId.substring(0, 8);
  const timestamp = parseInt(timestampHex, 16);
  
  // Basic sanity check for timestamp (between 2020 and 2040)
  const minTime = Math.floor(new Date('2020-01-01').getTime() / 1000);
  const maxTime = Math.floor(new Date('2040-01-01').getTime() / 1000);

  if (timestamp < minTime || timestamp > maxTime) {
    return { isValid: false };
  }

  return { isValid: true, timestamp };
};
