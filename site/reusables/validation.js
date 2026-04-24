/**
 * Form Validation Utilities
 * 
 * Provides validation functions for different form input types.
 * Used across the application for consistent form validation.
 * 
 * @module reusables/validation
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Minimum stock quantity allowed
 * @constant {number}
 */
const MIN_STOCK = 1;

/**
 * Maximum stock quantity allowed
 * @constant {number}
 */
const MAX_STOCK = 999999;

/**
 * Minimum price allowed in Naira
 * @constant {number}
 */
const MIN_PRICE = 50;

/**
 * Maximum price allowed in Naira
 * @constant {number}
 */
const MAX_PRICE = 100000000;

/**
 * Minimum words required for product title
 * @constant {number}
 */
const MIN_TITLE_WORDS = 2;

/**
 * Maximum words allowed for product title
 * @constant {number}
 */
const MAX_TITLE_WORDS = 20;

/**
 * Minimum words required for product description
 * @constant {number}
 */
const MIN_DESCRIPTION_WORDS = 10;

/**
 * Maximum words allowed for product description
 * @constant {number}
 */
const MAX_DESCRIPTION_WORDS = 500;

/**
 * Maximum file size in bytes (5MB)
 * @constant {number}
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed file types for uploads
 * @constant {string[]}
 */
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a validation result object
 * 
 * @param {string} err - Error message (empty if valid)
 * @param {boolean} bool - Whether validation passed
 * @param {string} name - Field name
 * @param {Object} element - Element reference
 * @returns {Object} Validation result object
 */
function createValidationResult(err, bool, name, element) {
  return {
    err,
    bool,
    name,
    element,
  };
}

/**
 * Counts words in a string, handling edge cases
 * 
 * @param {string} text - Text to count words in
 * @returns {number} Number of words
 */
function countWords(text) {
  if (!text || typeof text !== "string") {
    return 0;
  }
  
  // Trim and split by whitespace, filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Checks if a value is empty or only whitespace
 * 
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  
  return false;
}

/**
 * Checks if a string is a valid number
 * 
 * @param {string} value - Value to check
 * @returns {boolean} True if valid number
 */
function isValidNumber(value) {
  if (isEmpty(value)) {
    return false;
  }
  
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validates form inputs based on their type
 * 
 * @param {string} inputType - Type of input ('select' | 'input' | 'textarea')
 * @param {Array} list - Array of input items to validate
 * @param {Array} [file=[]] - Array of file inputs (for file validation)
 * @returns {Array} Array of validation results
 */
export function validate_inputs(inputType, list, file = []) {
  // Guard clause for invalid parameters
  if (!inputType || !Array.isArray(list)) {
    console.warn("validate_inputs: Invalid parameters provided");
    return [];
  }

  switch (inputType) {
    case "select":
      return list.map((item) => validateSelect(item?.value, item?.name, item));

    case "input":
      return list.map((item) => validateInput(item?.value, item?.name, item, file));

    case "textarea":
      return list.map((item) => validateTextarea(item?.value, item?.name, item));

    default:
      console.warn(`Unknown input type: ${inputType}`);
      return [];
  }
}

// ============================================================================
// SELECT VALIDATION
// ============================================================================

/**
 * Validates select input fields
 * 
 * @param {string} value - The selected value
 * @param {string} name - The field name
 * @param {Object} element - The element reference
 * @returns {Object} Validation result with error message and boolean
 */
function validateSelect(value, name, element) {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return createValidationResult(
      `Product ${name || "field"} cannot be empty`,
      false,
      name,
      element
    );
  }

  const isEmptyValue = isEmpty(value);
  
  return createValidationResult(
    isEmptyValue ? `Product ${name || "field"} cannot be empty` : "",
    !isEmptyValue,
    name,
    element
  );
}

// ============================================================================
// INPUT VALIDATION
// ============================================================================

/**
 * Validates text/number input fields
 * 
 * @param {string} value - The input value
 * @param {string} name - The field name
 * @param {Object} element - The element reference
 * @param {Array} file - File array for file validation
 * @returns {Object} Validation result with error message and boolean
 */
function validateInput(value, name, element, file) {
  // Stock validation
  if (name === "stock") {
    return validateStock(value, name, element);
  }
  
  // Price validation
  if (name === "price") {
    return validatePrice(value, name, element);
  }
  
  // File/Sample validation (default)
  return validateFileSamples(value, name, element, file);
}

/**
 * Validates stock quantity
 * 
 * @param {string} value - Stock value
 * @param {string} name - Field name
 * @param {Object} element - Element reference
 * @returns {Object} Validation result
 */
function validateStock(value, name, element) {
  // Check for empty value
  if (isEmpty(value)) {
    return createValidationResult(
      `Sorry, ${name} cannot be empty`,
      false,
      name,
      element
    );
  }
  
  // Check for valid number
  if (!isValidNumber(value)) {
    return createValidationResult(
      "Please enter a valid number for stock",
      false,
      name,
      element
    );
  }
  
  const stockValue = parseInt(value, 10);
  
  // Check minimum
  if (stockValue < MIN_STOCK) {
    return createValidationResult(
      `Sorry, stock can't be less than ${MIN_STOCK}`,
      false,
      name,
      element
    );
  }
  
  // Check maximum
  if (stockValue > MAX_STOCK) {
    return createValidationResult(
      `Sorry, stock can't exceed ${MAX_STOCK.toLocaleString()}`,
      false,
      name,
      element
    );
  }
  
  return createValidationResult("", true, name, element);
}

/**
 * Validates price value
 * 
 * @param {string} value - Price value
 * @param {string} name - Field name
 * @param {Object} element - Element reference
 * @returns {Object} Validation result
 */
function validatePrice(value, name, element) {
  // Check for empty value
  if (isEmpty(value)) {
    return createValidationResult(
      `Sorry, ${name} cannot be empty`,
      false,
      name,
      element
    );
  }
  
  // Check for valid number
  if (!isValidNumber(value)) {
    return createValidationResult(
      "Please enter a valid price",
      false,
      name,
      element
    );
  }
  
  const priceValue = parseFloat(value);
  
  // Check for negative values
  if (priceValue < 0) {
    return createValidationResult(
      "Price cannot be negative",
      false,
      name,
      element
    );
  }
  
  // Check minimum
  if (priceValue < MIN_PRICE) {
    return createValidationResult(
      `Sorry, price can't be less than ₦${MIN_PRICE}`,
      false,
      name,
      element
    );
  }
  
  // Check maximum
  if (priceValue > MAX_PRICE) {
    return createValidationResult(
      `Sorry, price can't exceed ₦${MAX_PRICE.toLocaleString()}`,
      false,
      name,
      element
    );
  }
  
  return createValidationResult("", true, name, element);
}

/**
 * Validates file/sample uploads
 * 
 * @param {string} value - Input value
 * @param {string} name - Field name
 * @param {Object} element - Element reference
 * @param {Array|FileList} file - File array
 * @returns {Object} Validation result
 */
function validateFileSamples(value, name, element, file) {
  // Check if files exist
  if (!file || file.length < 1) {
    return createValidationResult(
      `Sorry, ${name} samples cannot be empty`,
      false,
      name,
      element
    );
  }
  
  // Validate each file
  for (let i = 0; i < file.length; i++) {
    const currentFile = file[i];
    
    // Check file size
    if (currentFile.size > MAX_FILE_SIZE) {
      return createValidationResult(
        `File "${currentFile.name}" exceeds maximum size of 5MB`,
        false,
        name,
        element
      );
    }
    
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(currentFile.type)) {
      return createValidationResult(
        `File "${currentFile.name}" has an unsupported format. Use JPEG, PNG, WebP, or GIF`,
        false,
        name,
        element
      );
    }
  }
  
  return createValidationResult("", true, name, element);
}

// ============================================================================
// TEXTAREA VALIDATION
// ============================================================================

/**
 * Validates textarea fields
 * 
 * @param {string} value - The textarea value
 * @param {string} name - The field name
 * @param {Object} element - The element reference
 * @returns {Object} Validation result with error message and boolean
 */
function validateTextarea(value, name, element) {
  // Title validation
  if (name === "title") {
    return validateTitle(value, name, element);
  }
  
  // Description validation
  if (name === "description") {
    return validateDescription(value, name, element);
  }
  
  // Default validation - just check if not empty
  if (isEmpty(value)) {
    return createValidationResult(
      `${name || "Field"} cannot be empty`,
      false,
      name,
      element
    );
  }
  
  return createValidationResult("", true, name, element);
}

/**
 * Validates product title
 * 
 * @param {string} value - Title value
 * @param {string} name - Field name
 * @param {Object} element - Element reference
 * @returns {Object} Validation result
 */
function validateTitle(value, name, element) {
  // Check for empty value
  if (isEmpty(value)) {
    return createValidationResult(
      "Sorry, title cannot be empty",
      false,
      name,
      element
    );
  }
  
  const wordCount = countWords(value);
  
  // Check minimum words
  if (wordCount < MIN_TITLE_WORDS) {
    return createValidationResult(
      `Sorry, your title must contain at least ${MIN_TITLE_WORDS} words`,
      false,
      name,
      element
    );
  }
  
  // Check maximum words
  if (wordCount > MAX_TITLE_WORDS) {
    return createValidationResult(
      `Sorry, your title cannot exceed ${MAX_TITLE_WORDS} words`,
      false,
      name,
      element
    );
  }
  
  return createValidationResult("", true, name, element);
}

/**
 * Validates product description
 * 
 * @param {string} value - Description value
 * @param {string} name - Field name
 * @param {Object} element - Element reference
 * @returns {Object} Validation result
 */
function validateDescription(value, name, element) {
  // Check for empty value
  if (isEmpty(value)) {
    return createValidationResult(
      "Sorry, description cannot be empty",
      false,
      name,
      element
    );
  }
  
  const wordCount = countWords(value);
  
  // Check minimum words
  if (wordCount < MIN_DESCRIPTION_WORDS) {
    return createValidationResult(
      `Sorry, your description must contain at least ${MIN_DESCRIPTION_WORDS} words`,
      false,
      name,
      element
    );
  }
  
  // Check maximum words
  if (wordCount > MAX_DESCRIPTION_WORDS) {
    return createValidationResult(
      `Sorry, your description cannot exceed ${MAX_DESCRIPTION_WORDS} words`,
      false,
      name,
      element
    );
  }
  
  return createValidationResult("", true, name, element);
}

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Validates an email address
 * 
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export function validateEmail(email) {
  if (isEmpty(email)) {
    return { valid: false, message: "Email cannot be empty" };
  }
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Please enter a valid email address" };
  }
  
  return { valid: true, message: "" };
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Validates a password
 * 
 * @param {string} password - Password to validate
 * @param {Object} [options={}] - Validation options
 * @param {number} [options.minLength=8] - Minimum length
 * @param {boolean} [options.requireUppercase=false] - Require uppercase letter
 * @param {boolean} [options.requireNumber=false] - Require number
 * @param {boolean} [options.requireSpecial=false] - Require special character
 * @returns {Object} Validation result
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = options;

  if (isEmpty(password)) {
    return { valid: false, message: "Password cannot be empty" };
  }
  
  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters` };
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  
  if (requireNumber && !/\d/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character" };
  }
  
  return { valid: true, message: "" };
}

// ============================================================================
// PHONE VALIDATION
// ============================================================================

/**
 * Validates a Nigerian phone number
 * 
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result
 */
export function validateNigerianPhone(phone) {
  if (isEmpty(phone)) {
    return { valid: false, message: "Phone number cannot be empty" };
  }
  
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, "");
  
  // Nigerian phone number patterns
  const nigerianRegex = /^(\+234|234|0)[789][01]\d{8}$/;
  
  if (!nigerianRegex.test(cleanPhone)) {
    return { valid: false, message: "Please enter a valid Nigerian phone number" };
  }
  
  return { valid: true, message: "" };
}
