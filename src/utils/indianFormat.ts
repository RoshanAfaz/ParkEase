/**
 * Utility functions for Indian formatting standards
 */

/**
 * Format currency in Indian Rupees (₹)
 * Converts to Indian numbering system with lakhs and crores
 * @param amount - Amount in rupees
 * @returns Formatted string with ₹ symbol
 */
export function formatIndianCurrency(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Format currency without decimals (for whole rupee amounts)
 * @param amount - Amount in rupees
 * @returns Formatted string with ₹ symbol
 */
export function formatIndianCurrencyWhole(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

/**
 * Validate Indian vehicle registration number
 * Format: XX00XX0000 or XX-00-XX-0000
 * Examples: MH12AB1234, DL01CA9999, KA-05-MH-1234
 * @param vehicleNumber - Vehicle registration number
 * @returns true if valid, false otherwise
 */
export function validateIndianVehicleNumber(vehicleNumber: string): boolean {
  // Remove spaces and convert to uppercase
  const cleaned = vehicleNumber.replace(/[\s-]/g, '').toUpperCase();
  
  // Indian vehicle number format: 2 letters (state) + 2 digits (RTO) + 1-2 letters (series) + 1-4 digits (number)
  const pattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{1,4}$/;
  
  return pattern.test(cleaned);
}

/**
 * Format Indian vehicle registration number
 * Converts to standard format: XX-00-XX-0000
 * @param vehicleNumber - Vehicle registration number
 * @returns Formatted vehicle number
 */
export function formatIndianVehicleNumber(vehicleNumber: string): string {
  // Remove spaces and hyphens, convert to uppercase
  const cleaned = vehicleNumber.replace(/[\s-]/g, '').toUpperCase();
  
  // Check if it matches the pattern
  const match = cleaned.match(/^([A-Z]{2})([0-9]{2})([A-Z]{1,2})([0-9]{1,4})$/);
  
  if (match) {
    const [, state, rto, series, number] = match;
    return `${state}-${rto}-${series}-${number}`;
  }
  
  // Return as-is if doesn't match pattern
  return vehicleNumber.toUpperCase();
}

/**
 * Get placeholder text for Indian vehicle number input
 * @returns Placeholder text
 */
export function getVehicleNumberPlaceholder(): string {
  return 'e.g., MH-12-AB-1234 or DL01CA9999';
}

/**
 * Format Indian phone number
 * @param phone - Phone number
 * @returns Formatted phone number
 */
export function formatIndianPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +91-XXXXX-XXXXX for 10 digit numbers
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  // Format as +91-XXXXX-XXXXX if starts with 91
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91-${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Validate Indian phone number
 * @param phone - Phone number
 * @returns true if valid, false otherwise
 */
export function validateIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  
  // Should be 10 digits or 12 digits starting with 91
  if (cleaned.length === 10) {
    return /^[6-9][0-9]{9}$/.test(cleaned);
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^91[6-9][0-9]{9}$/.test(cleaned);
  }
  
  return false;
}

/**
 * Format Indian postal code (PIN code)
 * @param pincode - PIN code
 * @returns Formatted PIN code
 */
export function formatIndianPincode(pincode: string): string {
  const cleaned = pincode.replace(/\D/g, '');
  
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  
  return pincode;
}

/**
 * Validate Indian postal code (PIN code)
 * @param pincode - PIN code
 * @returns true if valid, false otherwise
 */
export function validateIndianPincode(pincode: string): boolean {
  const cleaned = pincode.replace(/\D/g, '');
  return /^[1-9][0-9]{5}$/.test(cleaned);
}