// Raktify Core Domain Types

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type BloodComponent = 'whole_blood' | 'packed_rbc' | 'platelets' | 'fresh_frozen_plasma' | 'cryoprecipitate'
export type UrgencyLevel = 'critical' | 'high' | 'standard'
export type RequestStatus = 'pending_verification' | 'verified' | 'matching' | 'fulfilled' | 'cancelled' | 'rejected'

export interface RevertedDonor {
  id: string
  requestId: string
  donorName: string
  bloodGroup: BloodGroup
  city: string
  area: string
  distanceKm: number
  phone: string
  etaMinutes: number
  revertedAt: string
  message?: string
}

export interface BloodRequest {
  id: string
  code: string
  requester_id: string
  requester_name?: string
  requester_phone?: string
  share_token: string
  patient_name: string
  blood_group: BloodGroup
  component: BloodComponent
  units_needed: number
  units_confirmed: number
  urgency: UrgencyLevel
  needed_by: string
  hospital_name: string
  hospital_city: string
  hospital_room?: string
  doctor_name?: string
  requisition_attached?: boolean
  status: RequestStatus
  verified_by?: string
  verified_at?: string
  verification_notes?: string
  created_at: string
  reverted_donors: RevertedDonor[]
}

export interface DonorProfile {
  id: string
  user_id: string
  full_name: string
  blood_group: BloodGroup
  city: string
  available: boolean
  last_donated_on?: string
  donation_count: number
  eligibility_status: 'eligible' | 'deferred' | 'ineligible'
}

// Retained for animations and mascot states
export type TurnState = 'waiting' | 'near' | 'now' | 'finished' | 'idle' | 'celebrating'
