export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

export const isValidPhone = (phone) => {
  return /^[0-9+\-\s()]{7,20}$/.test(String(phone).trim());
};

export const isValidISBN = (isbn) => {
  // Accepts standard ISBN-10, ISBN-13 with or without hyphens
  const cleaned = String(isbn).replace(/[-\s]/g, '');
  return cleaned.length === 10 || cleaned.length === 13;
};

export const isPositiveInt = (val) => {
  const num = Number(val);
  return Number.isInteger(num) && num > 0;
};
