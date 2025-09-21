export const env = {
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  CLIENT_SERVICE_URL: process.env.CLIENT_SERVICE_URL || 'http://localhost:3002',
  PATIENT_SERVICE_URL: process.env.PATIENT_SERVICE_URL || 'http://localhost:3003',
  APPOINTMENT_SERVICE_URL: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3004',
  BILLING_SERVICE_URL: process.env.BILLING_SERVICE_URL || 'http://localhost:3005',
  MEDICAL_RECORD_SERVICE_URL: process.env.MEDICAL_RECORD_SERVICE_URL || 'http://localhost:3006',
};
