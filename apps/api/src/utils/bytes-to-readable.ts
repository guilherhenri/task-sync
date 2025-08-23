/**
 * Converts a number of bytes into a human-readable format with appropriate units.
 * @param {number} bytes - The number of bytes to convert.
 * @param {number} [fractionDigits=0] - The number of decimal places to include in the result.
 * @returns {string} A string representing the bytes in a human-readable format (e.g., "1.23MB").
 * @example
 * console.log(bytesToReadable(10024 * 1024 * 2)); // Output: "20MB"
 * console.log(bytesToReadable(1500000, 2)); // Output: "1.43MB"
 * console.log(bytesToReadable(3000000000, 1)); // Output: "2.8GB"
 */
export function bytesToReadable(
  bytes: number,
  fractionDigits: number = 0,
): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }

  return `${value.toFixed(fractionDigits)}${units[unitIndex]}`
}
