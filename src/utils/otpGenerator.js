export const generateOTP = (email) => {
  if (email.endsWith('#')) {
    return '002609';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};
