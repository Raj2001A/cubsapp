/**
 * Validation utility functions for form inputs
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Phone number validation (international format)
export const isValidPhoneNumber = (phone: string): boolean => {
  // Allow +, spaces, and digits
  const phoneRegex = /^[+]?[\s./0-9]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return phoneRegex.test(phone) && phone.replace(/[\s()-]/g, '').length >= 8;
};

// Required field validation
export const isRequired = (value: string | undefined | null): boolean => {
  return !!value && value.trim() !== '';
};

// Date validation (YYYY-MM-DD format)
export const isValidDate = (date: string): boolean => {
  if (!date) return false;
  
  // Check format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Check if it's a valid date
  const d = new Date(date);
  const isValid = !isNaN(d.getTime());
  
  return isValid;
};

// Future date validation
export const isFutureDate = (date: string): boolean => {
  if (!isValidDate(date)) return false;
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
};

// Past date validation
export const isPastDate = (date: string): boolean => {
  if (!isValidDate(date)) return false;
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate < today;
};

// Employee ID validation (format: EMP followed by 4 digits)
export const isValidEmployeeId = (id: string): boolean => {
  const idRegex = /^EMP\d{4}$/;
  return idRegex.test(id);
};

// Name validation (letters, spaces, hyphens, apostrophes)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
};

// Password validation (min 8 chars, at least 1 letter and 1 number)
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

// Passport number validation (alphanumeric, 5-20 chars)
export const isValidPassportNumber = (passport: string): boolean => {
  const passportRegex = /^[A-Z0-9]{5,20}$/i;
  return passportRegex.test(passport);
};

// Validate form field and return error message if invalid
export const validateField = (
  fieldName: string,
  value: string,
  required: boolean = true
): string | null => {
  // Skip validation if field is not required and empty
  if (!required && (!value || value.trim() === '')) {
    return null;
  }
  
  // Required field check
  if (required && (!value || value.trim() === '')) {
    return `${fieldName} is required`;
  }
  
  // Field-specific validations
  switch (fieldName.toLowerCase()) {
    case 'email':
      return isValidEmail(value) ? null : 'Please enter a valid email address';
      
    case 'phone':
    case 'mobile number':
    case 'mobile':
    case 'phone number':
    case 'telephone':
      return isValidPhoneNumber(value) ? null : 'Please enter a valid phone number';
      
    case 'date of birth':
      return isValidDate(value) && isPastDate(value) 
        ? null 
        : 'Please enter a valid date of birth';
      
    case 'visa expiry date':
    case 'expiry date':
      return isValidDate(value) 
        ? null 
        : 'Please enter a valid date';
      
    case 'employee id':
      return isValidEmployeeId(value) 
        ? null 
        : 'Employee ID must be in format EMP followed by 4 digits';
      
    case 'name':
    case 'full name':
      return isValidName(value) 
        ? null 
        : 'Please enter a valid name (at least 2 characters)';
      
    case 'password':
      return isValidPassword(value) 
        ? null 
        : 'Password must be at least 8 characters with at least one letter and one number';
      
    case 'passport number':
      return isValidPassportNumber(value) 
        ? null 
        : 'Please enter a valid passport number (5-20 alphanumeric characters)';
      
    default:
      return null;
  }
};

// Validate entire form and return all errors
export const validateForm = (
  formData: Record<string, any>,
  requiredFields: string[],
  optionalFields: string[] = []
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validate required fields
  for (const field of requiredFields) {
    const error = validateField(field, formData[field], true);
    if (error) {
      errors[field] = error;
    }
  }
  
  // Validate optional fields (only if they have a value)
  for (const field of optionalFields) {
    if (formData[field]) {
      const error = validateField(field, formData[field], false);
      if (error) {
        errors[field] = error;
      }
    }
  }
  
  return errors;
};
