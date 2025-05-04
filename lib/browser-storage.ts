// Types for our data models
export interface User {
  id: string
  email: string
  role: "doctor" | "patient" | "admin"
  fullName: string
  avatar?: string | null
}

export interface Profile {
  id: string
  fullName: string
  role: "doctor" | "patient" | "admin"
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
  avatarUrl?: string | null
  specialization?: string
  department?: string
  enableNotifications: boolean
}

export interface Doctor {
  id: string
  doctorId: string
  specialization: string
  department?: string
  available: boolean
}

export interface Patient {
  id: string
  patientId: string
  dateOfBirth?: string
  bloodGroup?: string
  allergies?: string[]
}

export interface Appointment {
  id: string
  doctorId: string
  patientId: string
  title: string
  appointmentDate: string
  appointmentTime: string
  status: "upcoming" | "completed" | "cancelled"
  reason?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Report {
  id: string
  patientId: string
  doctorId: string
  title: string
  description?: string
  fileUrl?: string
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  patientId: string
  doctorId: string
  amount: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  status: "paid" | "unpaid" | "overdue"
  dueDate: string
  createdAt: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  amount: number
}

export interface Prescription {
  id: string
  patientId: string
  doctorId: string
  date: string
  medications: Medication[]
  instructions: string
  createdAt: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
}

export interface MedicalCondition {
  id: string
  patientId: string
  name: string
  diagnosedAt: string
  notes?: string
}

// Storage keys
const STORAGE_KEYS = {
  CURRENT_USER: "hms_current_user",
  USERS: "hms_users",
  PROFILES: "hms_profiles",
  DOCTORS: "hms_doctors",
  PATIENTS: "hms_patients",
  APPOINTMENTS: "hms_appointments",
  REPORTS: "hms_reports",
  INVOICES: "hms_invoices",
  PRESCRIPTIONS: "hms_prescriptions",
  MEDICAL_CONDITIONS: "hms_medical_conditions",
}

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Generic get function
function getFromStorage<T>(key: string): T[] {
  if (!isBrowser) return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

// Generic set function
function setToStorage<T>(key: string, data: T[]): void {
  if (!isBrowser) return
  localStorage.setItem(key, JSON.stringify(data))
}

// Current user functions
export function getCurrentUser(): User | null {
  if (!isBrowser) return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return data ? JSON.parse(data) : null
}

export function setCurrentUser(user: User | null): void {
  if (!isBrowser) return
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
}

// User functions
export function getUsers(): User[] {
  return getFromStorage<User>(STORAGE_KEYS.USERS)
}

export function addUser(user: User): void {
  const users = getUsers()
  users.push(user)
  setToStorage(STORAGE_KEYS.USERS, users)
}

// Profile functions
export function getProfiles(): Profile[] {
  return getFromStorage<Profile>(STORAGE_KEYS.PROFILES)
}

export function getProfileById(id: string): Profile | null {
  const profiles = getProfiles()
  return profiles.find((profile) => profile.id === id) || null
}

export function addProfile(profile: Profile): void {
  const profiles = getProfiles()
  profiles.push(profile)
  setToStorage(STORAGE_KEYS.PROFILES, profiles)
}

export function updateProfile(updatedProfile: Profile): void {
  const profiles = getProfiles()
  const index = profiles.findIndex((profile) => profile.id === updatedProfile.id)
  if (index !== -1) {
    profiles[index] = updatedProfile
    setToStorage(STORAGE_KEYS.PROFILES, profiles)
  }
}

// Doctor functions
export function getDoctors(): Doctor[] {
  return getFromStorage<Doctor>(STORAGE_KEYS.DOCTORS)
}

export function getDoctorById(id: string): Doctor | null {
  const doctors = getDoctors()
  return doctors.find((doctor) => doctor.id === id) || null
}

export function addDoctor(doctor: Doctor): void {
  const doctors = getDoctors()
  doctors.push(doctor)
  setToStorage(STORAGE_KEYS.DOCTORS, doctors)
}

// Patient functions
export function getPatients(): Patient[] {
  return getFromStorage<Patient>(STORAGE_KEYS.PATIENTS)
}

export function getPatientById(id: string): Patient | null {
  const patients = getPatients()
  return patients.find((patient) => patient.id === id) || null
}

export function addPatient(patient: Patient): void {
  const patients = getPatients()
  patients.push(patient)
  setToStorage(STORAGE_KEYS.PATIENTS, patients)
}

// Appointment functions
export function getAppointments(): Appointment[] {
  return getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS)
}

export function getAppointmentsByDoctorId(doctorId: string): Appointment[] {
  const appointments = getAppointments()
  return appointments.filter((appointment) => appointment.doctorId === doctorId)
}

export function getAppointmentsByPatientId(patientId: string): Appointment[] {
  const appointments = getAppointments()
  return appointments.filter((appointment) => appointment.patientId === patientId)
}

export function addAppointment(appointment: Appointment): void {
  const appointments = getAppointments()
  appointments.push(appointment)
  setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments)
}

export function updateAppointment(updatedAppointment: Appointment): void {
  const appointments = getAppointments()
  const index = appointments.findIndex((appointment) => appointment.id === updatedAppointment.id)
  if (index !== -1) {
    appointments[index] = updatedAppointment
    setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments)
  }
}

// Report functions
export function getReports(): Report[] {
  return getFromStorage<Report>(STORAGE_KEYS.REPORTS)
}

export function getReportsByPatientId(patientId: string): Report[] {
  const reports = getReports()
  return reports.filter((report) => report.patientId === patientId)
}

export function addReport(report: Report): void {
  const reports = getReports()
  reports.push(report)
  setToStorage(STORAGE_KEYS.REPORTS, reports)
}

// Invoice functions
export function getInvoices(): Invoice[] {
  return getFromStorage<Invoice>(STORAGE_KEYS.INVOICES)
}

export function getInvoicesByPatientId(patientId: string): Invoice[] {
  const invoices = getInvoices()
  return invoices.filter((invoice) => invoice.patientId === patientId)
}

export function addInvoice(invoice: Invoice): void {
  const invoices = getInvoices()
  invoices.push(invoice)
  setToStorage(STORAGE_KEYS.INVOICES, invoices)
}

// Prescription functions
export function getPrescriptions(): Prescription[] {
  return getFromStorage<Prescription>(STORAGE_KEYS.PRESCRIPTIONS)
}

export function getPrescriptionsByPatientId(patientId: string): Prescription[] {
  const prescriptions = getPrescriptions()
  return prescriptions.filter((prescription) => prescription.patientId === patientId)
}

export function getPrescriptionsByDoctorId(doctorId: string): Prescription[] {
  const prescriptions = getPrescriptions()
  return prescriptions.filter((prescription) => prescription.doctorId === doctorId)
}

export function addPrescription(prescription: Prescription): void {
  const prescriptions = getPrescriptions()
  prescriptions.push(prescription)
  setToStorage(STORAGE_KEYS.PRESCRIPTIONS, prescriptions)
}

// Medical condition functions
export function getMedicalConditions(): MedicalCondition[] {
  return getFromStorage<MedicalCondition>(STORAGE_KEYS.MEDICAL_CONDITIONS)
}

export function getMedicalConditionsByPatientId(patientId: string): MedicalCondition[] {
  const conditions = getMedicalConditions()
  return conditions.filter((condition) => condition.patientId === patientId)
}

export function addMedicalCondition(condition: MedicalCondition): void {
  const conditions = getMedicalConditions()
  conditions.push(condition)
  setToStorage(STORAGE_KEYS.MEDICAL_CONDITIONS, conditions)
}

// Generate a random ID
export function generateId(prefix = ""): string {
  return `${prefix}${Math.random().toString(36).substring(2, 11)}`
}

// Clear user session
export function clearUserSession(): void {
  if (!isBrowser) return
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}

// Initialize with dummy data if storage is empty
export function initializeDummyData(): void {
  if (!isBrowser) return

  // Only initialize if no data exists
  if (getUsers().length === 0) {
    // Create admin user
    const adminUser: User = {
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
      fullName: "System Administrator",
    }

    const adminProfile: Profile = {
      id: "admin-1",
      fullName: "System Administrator",
      role: "admin",
      phone: "+1 (555) 789-0123",
      address: "500 Admin Building, Healthcare City",
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      enableNotifications: true,
    }

    // Create dummy doctors
    const doctorUsers: User[] = [
      {
        id: "doctor-1",
        email: "john.smith@example.com",
        role: "doctor",
        fullName: "Dr. John Smith",
      },
      {
        id: "doctor-2",
        email: "sarah.johnson@example.com",
        role: "doctor",
        fullName: "Dr. Sarah Johnson",
      },
      {
        id: "doctor-3",
        email: "robert.patel@example.com",
        role: "doctor",
        fullName: "Dr. Robert Patel",
      },
      {
        id: "doctor-4",
        email: "lisa.wong@example.com",
        role: "doctor",
        fullName: "Dr. Lisa Wong",
      },
    ]

    const doctorProfiles: Profile[] = [
      {
        id: "doctor-1",
        fullName: "Dr. John Smith",
        role: "doctor",
        phone: "+1 (555) 123-4567",
        address: "123 Medical Center Dr, Healthcare City",
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        specialization: "Cardiology",
        department: "Cardiology Department",
        enableNotifications: true,
      },
      {
        id: "doctor-2",
        fullName: "Dr. Sarah Johnson",
        role: "doctor",
        phone: "+1 (555) 987-6543",
        address: "456 Hospital Ave, Medical Town",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        specialization: "Neurology",
        department: "Neurology Department",
        enableNotifications: true,
      },
      {
        id: "doctor-3",
        fullName: "Dr. Robert Patel",
        role: "doctor",
        phone: "+1 (555) 567-8901",
        address: "789 Physician Lane, Healthcare City",
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        specialization: "Orthopedics",
        department: "Orthopedics Department",
        enableNotifications: true,
      },
      {
        id: "doctor-4",
        fullName: "Dr. Lisa Wong",
        role: "doctor",
        phone: "+1 (555) 234-5678",
        address: "321 Specialist Blvd, Medical Town",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        specialization: "Pediatrics",
        department: "Pediatrics Department",
        enableNotifications: true,
      },
    ]

    const doctors: Doctor[] = [
      {
        id: "doctor-1",
        doctorId: "DOC-12345",
        specialization: "Cardiology",
        department: "Cardiology Department",
        available: true,
      },
      {
        id: "doctor-2",
        doctorId: "DOC-67890",
        specialization: "Neurology",
        department: "Neurology Department",
        available: true,
      },
      {
        id: "doctor-3",
        doctorId: "DOC-24680",
        specialization: "Orthopedics",
        department: "Orthopedics Department",
        available: true,
      },
      {
        id: "doctor-4",
        doctorId: "DOC-13579",
        specialization: "Pediatrics",
        department: "Pediatrics Department",
        available: true,
      },
    ]

    // Create dummy patients
    const patientUsers: User[] = [
      {
        id: "patient-1",
        email: "michael.brown@example.com",
        role: "patient",
        fullName: "Michael Brown",
      },
      {
        id: "patient-2",
        email: "emily.davis@example.com",
        role: "patient",
        fullName: "Emily Davis",
      },
      {
        id: "patient-3",
        email: "david.wilson@example.com",
        role: "patient",
        fullName: "David Wilson",
      },
      {
        id: "patient-4",
        email: "sophia.martinez@example.com",
        role: "patient",
        fullName: "Sophia Martinez",
      },
      {
        id: "patient-5",
        email: "james.taylor@example.com",
        role: "patient",
        fullName: "James Taylor",
      },
    ]

    const patientProfiles: Profile[] = [
      {
        id: "patient-1",
        fullName: "Michael Brown",
        role: "patient",
        phone: "+1 (555) 234-5678",
        address: "789 Patient St, Healthcare City",
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        enableNotifications: true,
      },
      {
        id: "patient-2",
        fullName: "Emily Davis",
        role: "patient",
        phone: "+1 (555) 345-6789",
        address: "101 Wellness Blvd, Medical Town",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        enableNotifications: false,
      },
      {
        id: "patient-3",
        fullName: "David Wilson",
        role: "patient",
        phone: "+1 (555) 456-7890",
        address: "202 Health Ave, Healthcare City",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        enableNotifications: true,
      },
      {
        id: "patient-4",
        fullName: "Sophia Martinez",
        role: "patient",
        phone: "+1 (555) 567-8901",
        address: "303 Recovery Lane, Medical Town",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        enableNotifications: true,
      },
      {
        id: "patient-5",
        fullName: "James Taylor",
        role: "patient",
        phone: "+1 (555) 678-9012",
        address: "404 Wellness Court, Healthcare City",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        enableNotifications: false,
      },
    ]

    const patients: Patient[] = [
      {
        id: "patient-1",
        patientId: "PAT-12345",
        dateOfBirth: "1985-06-15",
        bloodGroup: "O+",
        allergies: ["Penicillin"],
      },
      {
        id: "patient-2",
        patientId: "PAT-67890",
        dateOfBirth: "1990-03-22",
        bloodGroup: "A-",
        allergies: ["Peanuts", "Shellfish"],
      },
      {
        id: "patient-3",
        patientId: "PAT-24680",
        dateOfBirth: "1978-11-30",
        bloodGroup: "B+",
        allergies: [],
      },
      {
        id: "patient-4",
        patientId: "PAT-13579",
        dateOfBirth: "1995-08-12",
        bloodGroup: "AB+",
        allergies: ["Latex", "Dairy"],
      },
      {
        id: "patient-5",
        patientId: "PAT-97531",
        dateOfBirth: "1982-04-05",
        bloodGroup: "O-",
        allergies: ["Sulfa Drugs"],
      },
    ]

    // Create dummy appointments
    const appointments: Appointment[] = [
      {
        id: "appointment-1",
        doctorId: "doctor-1",
        patientId: "patient-1",
        title: "Cardiology Consultation",
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        appointmentTime: "09:00",
        status: "upcoming",
        reason: "Regular checkup for heart condition",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "appointment-2",
        doctorId: "doctor-2",
        patientId: "patient-2",
        title: "Neurology Consultation",
        appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        appointmentTime: "14:30",
        status: "upcoming",
        reason: "Recurring headaches",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "appointment-3",
        doctorId: "doctor-1",
        patientId: "patient-3",
        title: "Cardiology Followup",
        appointmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        appointmentTime: "11:15",
        status: "completed",
        reason: "Post-surgery followup",
        notes: "Patient recovering well. Prescribed medication for 2 more weeks.",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "appointment-4",
        doctorId: "doctor-2",
        patientId: "patient-1",
        title: "Neurology Consultation",
        appointmentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        appointmentTime: "10:00",
        status: "cancelled",
        reason: "Dizziness and vertigo",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "appointment-5",
        doctorId: "doctor-3",
        patientId: "patient-4",
        title: "Orthopedic Evaluation",
        appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        appointmentTime: "13:00",
        status: "upcoming",
        reason: "Knee pain after sports injury",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "appointment-6",
        doctorId: "doctor-4",
        patientId: "patient-5",
        title: "Pediatric Checkup",
        appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        appointmentTime: "15:45",
        status: "upcoming",
        reason: "Annual wellness checkup",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "appointment-7",
        doctorId: "doctor-3",
        patientId: "patient-2",
        title: "Orthopedic Followup",
        appointmentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        appointmentTime: "09:30",
        status: "completed",
        reason: "Post-physical therapy evaluation",
        notes: "Patient showing good progress. Recommended continued exercises.",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "appointment-8",
        doctorId: "doctor-4",
        patientId: "patient-3",
        title: "Pediatric Consultation",
        appointmentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        appointmentTime: "16:15",
        status: "completed",
        reason: "Recurring cough and cold",
        notes: "Prescribed antibiotics for 7 days. Follow up if symptoms persist.",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    // Create dummy reports
    const reports: Report[] = [
      {
        id: "report-1",
        patientId: "patient-1",
        doctorId: "doctor-1",
        title: "Cardiac Stress Test Results",
        description: "Patient completed stress test with normal results. No significant abnormalities detected.",
        fileUrl: "/placeholder.svg?height=400&width=300",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "report-2",
        patientId: "patient-2",
        doctorId: "doctor-2",
        title: "MRI Brain Scan",
        description: "MRI shows no structural abnormalities. Minor inflammation noted in sinus cavity.",
        fileUrl: "/placeholder.svg?height=400&width=300",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "report-3",
        patientId: "patient-3",
        doctorId: "doctor-1",
        title: "Echocardiogram Results",
        description: "Normal heart function. Ejection fraction at 60%. No valve abnormalities.",
        fileUrl: "/placeholder.svg?height=400&width=300",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "report-4",
        patientId: "patient-4",
        doctorId: "doctor-3",
        title: "X-Ray Knee Joint",
        description:
          "No fractures or dislocations observed. Mild joint space narrowing consistent with early osteoarthritis.",
        fileUrl: "/placeholder.svg?height=400&width=300",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "report-5",
        patientId: "patient-5",
        doctorId: "doctor-4",
        title: "Complete Blood Count",
        description: "All values within normal range. No signs of infection or anemia.",
        fileUrl: "/placeholder.svg?height=400&width=300",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "report-6",
        patientId: "patient-1",
        doctorId: "doctor-2",
        title: "Neurological Assessment",
        description:
          "Patient shows normal neurological responses. No evidence of nerve damage or cognitive impairment.",
        fileUrl: "/placeholder.svg?height=400&width=300",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    // Create dummy invoices
    const invoices: Invoice[] = [
      {
        id: "invoice-1",
        invoiceNumber: "INV-2023-001",
        patientId: "patient-1",
        doctorId: "doctor-1",
        amount: 150.0,
        taxRate: 5,
        taxAmount: 7.5,
        totalAmount: 157.5,
        status: "paid",
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: "item-1",
            invoiceId: "invoice-1",
            description: "Cardiology Consultation",
            amount: 150.0,
          },
        ],
      },
      {
        id: "invoice-2",
        invoiceNumber: "INV-2023-002",
        patientId: "patient-2",
        doctorId: "doctor-2",
        amount: 250.0,
        taxRate: 5,
        taxAmount: 12.5,
        totalAmount: 262.5,
        status: "unpaid",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: "item-2",
            invoiceId: "invoice-2",
            description: "Neurology Consultation",
            amount: 200.0,
          },
          {
            id: "item-3",
            invoiceId: "invoice-2",
            description: "MRI Scan",
            amount: 50.0,
          },
        ],
      },
      {
        id: "invoice-3",
        invoiceNumber: "INV-2023-003",
        patientId: "patient-3",
        doctorId: "doctor-1",
        amount: 180.0,
        taxRate: 5,
        taxAmount: 9.0,
        totalAmount: 189.0,
        status: "paid",
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: "item-4",
            invoiceId: "invoice-3",
            description: "Cardiology Follow-up",
            amount: 180.0,
          },
        ],
      },
      {
        id: "invoice-4",
        invoiceNumber: "INV-2023-004",
        patientId: "patient-4",
        doctorId: "doctor-3",
        amount: 320.0,
        taxRate: 5,
        taxAmount: 16.0,
        totalAmount: 336.0,
        status: "overdue",
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: "item-5",
            invoiceId: "invoice-4",
            description: "Orthopedic Consultation",
            amount: 200.0,
          },
          {
            id: "item-6",
            invoiceId: "invoice-4",
            description: "X-Ray Procedure",
            amount: 120.0,
          },
        ],
      },
      {
        id: "invoice-5",
        invoiceNumber: "INV-2023-005",
        patientId: "patient-5",
        doctorId: "doctor-4",
        amount: 150.0,
        taxRate: 5,
        taxAmount: 7.5,
        totalAmount: 157.5,
        status: "unpaid",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: "item-7",
            invoiceId: "invoice-5",
            description: "Pediatric Checkup",
            amount: 150.0,
          },
        ],
      },
    ]

    // Create dummy prescriptions
    const prescriptions: Prescription[] = [
      {
        id: "prescription-1",
        patientId: "patient-1",
        doctorId: "doctor-1",
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        medications: [
          {
            id: "med-1",
            name: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            duration: "30 days",
          },
          {
            id: "med-2",
            name: "Aspirin",
            dosage: "81mg",
            frequency: "Once daily",
            duration: "30 days",
          },
        ],
        instructions: "Take with food. Avoid alcohol. Report any dizziness immediately.",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "prescription-2",
        patientId: "patient-2",
        doctorId: "doctor-2",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        medications: [
          {
            id: "med-3",
            name: "Sumatriptan",
            dosage: "50mg",
            frequency: "As needed for migraine",
            duration: "30 days",
          },
        ],
        instructions: "Take at first sign of migraine. Do not exceed 2 tablets in 24 hours.",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "prescription-3",
        patientId: "patient-3",
        doctorId: "doctor-1",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        medications: [
          {
            id: "med-4",
            name: "Atorvastatin",
            dosage: "20mg",
            frequency: "Once daily at bedtime",
            duration: "90 days",
          },
          {
            id: "med-5",
            name: "Metoprolol",
            dosage: "25mg",
            frequency: "Twice daily",
            duration: "30 days",
          },
        ],
        instructions: "Take Atorvastatin at bedtime. Take Metoprolol with food to minimize side effects.",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "prescription-4",
        patientId: "patient-4",
        doctorId: "doctor-3",
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        medications: [
          {
            id: "med-6",
            name: "Ibuprofen",
            dosage: "600mg",
            frequency: "Three times daily with food",
            duration: "10 days",
          },
          {
            id: "med-7",
            name: "Cyclobenzaprine",
            dosage: "10mg",
            frequency: "Once daily at bedtime",
            duration: "7 days",
          },
        ],
        instructions: "Take with food. Avoid driving or operating machinery while taking Cyclobenzaprine.",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "prescription-5",
        patientId: "patient-5",
        doctorId: "doctor-4",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        medications: [
          {
            id: "med-8",
            name: "Amoxicillin",
            dosage: "500mg",
            frequency: "Three times daily",
            duration: "10 days",
          },
        ],
        instructions: "Complete the full course even if symptoms improve. Take with or without food.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    // Create dummy medical conditions
    const medicalConditions: MedicalCondition[] = [
      {
        id: "condition-1",
        patientId: "patient-1",
        name: "Hypertension",
        diagnosedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Well-controlled with medication. Regular monitoring required.",
      },
      {
        id: "condition-2",
        patientId: "patient-2",
        name: "Migraine",
        diagnosedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Triggered by stress and lack of sleep. Prescribed abortive medication.",
      },
      {
        id: "condition-3",
        patientId: "patient-3",
        name: "Coronary Artery Disease",
        diagnosedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Post-stent placement. On dual antiplatelet therapy.",
      },
      {
        id: "condition-4",
        patientId: "patient-4",
        name: "Osteoarthritis",
        diagnosedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Affecting right knee. Physical therapy and pain management in progress.",
      },
      {
        id: "condition-5",
        patientId: "patient-5",
        name: "Asthma",
        diagnosedAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Mild, exercise-induced. Maintenance inhaler prescribed for use before physical activity.",
      },
      {
        id: "condition-6",
        patientId: "patient-1",
        name: "Type 2 Diabetes",
        diagnosedAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Diet-controlled. Regular blood glucose monitoring advised.",
      },
      {
        id: "condition-7",
        patientId: "patient-2",
        name: "Anxiety Disorder",
        diagnosedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Cognitive behavioral therapy recommended. Avoiding caffeine has helped reduce symptoms.",
      },
    ]

    // Save all dummy data to localStorage
    setToStorage(STORAGE_KEYS.USERS, [adminUser, ...doctorUsers, ...patientUsers])
    setToStorage(STORAGE_KEYS.PROFILES, [adminProfile, ...doctorProfiles, ...patientProfiles])
    setToStorage(STORAGE_KEYS.DOCTORS, doctors)
    setToStorage(STORAGE_KEYS.PATIENTS, patients)
    setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments)
    setToStorage(STORAGE_KEYS.REPORTS, reports)
    setToStorage(STORAGE_KEYS.INVOICES, invoices)
    setToStorage(STORAGE_KEYS.PRESCRIPTIONS, prescriptions)
    setToStorage(STORAGE_KEYS.MEDICAL_CONDITIONS, medicalConditions)
  }
}
