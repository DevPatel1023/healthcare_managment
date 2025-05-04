// This is a development-only module to provide fake authentication data

export const FAKE_USER = {
  id: "fake-user-id-123",
  email: "doctor@example.com",
  user_metadata: {
    full_name: "Dr. John Smith",
    role: "doctor",
  },
}

export const FAKE_PROFILE = {
  id: FAKE_USER.id,
  full_name: FAKE_USER.user_metadata.full_name,
  role: FAKE_USER.user_metadata.role as "doctor" | "patient",
  phone: "+1 (555) 123-4567",
  address: "123 Medical Center Dr, Healthcare City",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  avatar_url: null,
  specialization: "Cardiology",
  department: "Cardiology Department",
  enable_notifications: true,
}

export const FAKE_DOCTOR = {
  id: FAKE_USER.id,
  doctor_id: "DOC-12345",
  specialization: "Cardiology",
  department: "Cardiology Department",
  available: true,
}

// For testing patient view
export const FAKE_PATIENT_USER = {
  id: "fake-patient-id-456",
  email: "patient@example.com",
  user_metadata: {
    full_name: "Sarah Johnson",
    role: "patient",
  },
}

export const FAKE_PATIENT_PROFILE = {
  id: FAKE_PATIENT_USER.id,
  full_name: FAKE_PATIENT_USER.user_metadata.full_name,
  role: FAKE_PATIENT_USER.user_metadata.role as "doctor" | "patient",
  phone: "+1 (555) 987-6543",
  address: "456 Patient Ave, Healthcare City",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  avatar_url: null,
  enable_notifications: true,
}

export const FAKE_PATIENT = {
  id: FAKE_PATIENT_USER.id,
  patient_id: "PAT-67890",
  date_of_birth: "1985-06-15",
  blood_group: "O+",
  allergies: ["Penicillin", "Peanuts"],
}

// Toggle this to switch between doctor and patient view
export const USE_DOCTOR_VIEW = true

export function getFakeUser() {
  return USE_DOCTOR_VIEW ? FAKE_USER : FAKE_PATIENT_USER
}

export function getFakeProfile() {
  return USE_DOCTOR_VIEW ? FAKE_PROFILE : FAKE_PATIENT_PROFILE
}

export function getFakeAdditionalData() {
  return USE_DOCTOR_VIEW ? FAKE_DOCTOR : FAKE_PATIENT
}
