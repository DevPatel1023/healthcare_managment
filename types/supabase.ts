export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: "doctor" | "patient"
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
          avatar_url: string | null
          specialization: string | null
          department: string | null
          enable_notifications: boolean
        }
        Insert: {
          id: string
          full_name: string
          role: "doctor" | "patient"
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
          specialization?: string | null
          department?: string | null
          enable_notifications?: boolean
        }
        Update: {
          id?: string
          full_name?: string
          role?: "doctor" | "patient"
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
          specialization?: string | null
          department?: string | null
          enable_notifications?: boolean
        }
      }
      doctors: {
        Row: {
          id: string
          doctor_id: string
          specialization: string
          department: string | null
          available: boolean
        }
        Insert: {
          id: string
          doctor_id?: string
          specialization: string
          department?: string | null
          available?: boolean
        }
        Update: {
          id?: string
          doctor_id?: string
          specialization?: string
          department?: string | null
          available?: boolean
        }
      }
      patients: {
        Row: {
          id: string
          patient_id: string
          date_of_birth: string | null
          blood_group: string | null
          allergies: string[] | null
        }
        Insert: {
          id: string
          patient_id?: string
          date_of_birth?: string | null
          blood_group?: string | null
          allergies?: string[] | null
        }
        Update: {
          id?: string
          patient_id?: string
          date_of_birth?: string | null
          blood_group?: string | null
          allergies?: string[] | null
        }
      }
      conditions: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      patient_conditions: {
        Row: {
          id: string
          patient_id: string
          condition_id: string
          diagnosed_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          condition_id: string
          diagnosed_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          condition_id?: string
          diagnosed_at?: string
          notes?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          doctor_id: string
          patient_id: string
          title: string
          appointment_date: string
          appointment_time: string
          status: "upcoming" | "completed" | "cancelled"
          reason: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          patient_id: string
          title: string
          appointment_date: string
          appointment_time: string
          status: "upcoming" | "completed" | "cancelled"
          reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          patient_id?: string
          title?: string
          appointment_date?: string
          appointment_time?: string
          status?: "upcoming" | "completed" | "cancelled"
          reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          title: string
          description: string | null
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          title: string
          description?: string | null
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          title?: string
          description?: string | null
          file_url?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          patient_id: string
          doctor_id: string
          amount: number
          tax_rate: number
          tax_amount: number
          total_amount: number
          status: "paid" | "unpaid" | "overdue"
          due_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          patient_id: string
          doctor_id: string
          amount: number
          tax_rate?: number
          tax_amount?: number
          total_amount: number
          status: "paid" | "unpaid" | "overdue"
          due_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          patient_id?: string
          doctor_id?: string
          amount?: number
          tax_rate?: number
          tax_amount?: number
          total_amount?: number
          status?: "paid" | "unpaid" | "overdue"
          due_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          amount: number
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          amount: number
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          amount?: number
        }
      }
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Insertables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type Updateables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
