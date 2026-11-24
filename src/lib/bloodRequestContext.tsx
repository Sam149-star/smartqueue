import React, { createContext, useContext, useState, useEffect } from 'react'
import { BloodRequest, BloodGroup, BloodComponent, UrgencyLevel, RevertedDonor } from './types'

interface BloodRequestContextType {
  requests: BloodRequest[]
  activeRequest: BloodRequest | null
  setActiveRequestId: (id: string) => void
  submitNewRequest: (data: {
    patient_name: string
    blood_group: BloodGroup
    component: BloodComponent
    units_needed: number
    urgency: UrgencyLevel
    hospital_name: string
    hospital_city: string
    hospital_room?: string
    doctor_name?: string
    requisition_attached: boolean
    requester_name?: string
    requester_phone?: string
  }) => BloodRequest
  verifyRequest: (requestId: string, verifierName: string, notes?: string) => void
  rejectRequest: (requestId: string, reason: string) => void
  revertAsDonor: (requestId: string, donor: {
    name: string
    bloodGroup: BloodGroup
    city: string
    area: string
    phone: string
    distanceKm?: number
    etaMinutes?: number
    message?: string
  }) => void
  resetToDefaults: () => void
}

const STORAGE_KEY = 'raktify_blood_requests_v1'

const DEFAULT_REQUESTS: BloodRequest[] = [
  {
    id: 'req_1',
    code: 'RK-8921',
    requester_id: 'user_req_1',
    requester_name: 'Aakash Sharma',
    requester_phone: '+91 98200 11223',
    share_token: 'RK-8921',
    patient_name: 'Meera Sharma',
    blood_group: 'O+',
    component: 'packed_rbc',
    units_needed: 2,
    units_confirmed: 2,
    urgency: 'critical',
    needed_by: 'Urgent (Within 4 hours)',
    hospital_name: 'Lilavati Hospital & Research Centre',
    hospital_city: 'Mumbai',
    hospital_room: 'ICU Ward 3, Bed 12',
    doctor_name: 'Dr. Ramesh Kulkarni, MS Orthopedics',
    requisition_attached: true,
    status: 'matching',
    verified_by: 'Dr. Priya Sen (MMC-2018-09124, Lilavati Blood Bank)',
    verified_at: 'Today at 10:49 AM',
    verification_notes: 'Requisition verified with blood bank crossmatch lab. Hospital code verified.',
    created_at: 'Today at 10:45 AM',
    reverted_donors: [
      {
        id: 'rev_1',
        requestId: 'req_1',
        donorName: 'Rahul Varma',
        bloodGroup: 'O+',
        city: 'Mumbai',
        area: 'Andheri West',
        distanceKm: 4.2,
        phone: '+91 98201 44892',
        etaMinutes: 25,
        revertedAt: '10:54 AM',
        message: 'On my way to Lilavati Blood Bank counter now.'
      },
      {
        id: 'rev_2',
        requestId: 'req_1',
        donorName: 'Vikram Sethi',
        bloodGroup: 'O-',
        city: 'Mumbai',
        area: 'Bandra West',
        distanceKm: 1.8,
        phone: '+91 97692 33104',
        etaMinutes: 15,
        revertedAt: '11:02 AM',
        message: 'Universal O- donor, reached hospital reception.'
      }
    ]
  },
  {
    id: 'req_2',
    code: 'RK-5042',
    requester_id: 'user_req_2',
    requester_name: 'Karan Roy',
    requester_phone: '+91 98333 44556',
    share_token: 'RK-5042',
    patient_name: 'Ananya Roy',
    blood_group: 'B+',
    component: 'platelets',
    units_needed: 1,
    units_confirmed: 0,
    urgency: 'critical',
    needed_by: 'Urgent (Dengue platelet drop < 20,000)',
    hospital_name: 'KEM Hospital & Seth GS Medical College',
    hospital_city: 'Mumbai',
    hospital_room: 'Pediatric Hematology Dept',
    doctor_name: 'Dr. Anjali Mehta, MD Pediatrics',
    requisition_attached: true,
    status: 'pending_verification',
    created_at: 'Today at 11:20 AM',
    reverted_donors: [
      {
        id: 'rev_3',
        requestId: 'req_2',
        donorName: 'Dr. Sneha Patel',
        bloodGroup: 'B+',
        city: 'Mumbai',
        area: 'Dadar East',
        distanceKm: 2.1,
        phone: '+91 98210 55901',
        etaMinutes: 20,
        revertedAt: '11:28 AM',
        message: 'Platelet donor ready. Waiting for medical verification.'
      }
    ]
  }
]

const BloodRequestContext = createContext<BloodRequestContextType | undefined>(undefined)

export const BloodRequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<BloodRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to parse saved blood requests:', e)
    }
    return DEFAULT_REQUESTS
  })

  const [activeRequestId, setActiveRequestId] = useState<string>(DEFAULT_REQUESTS[0].id)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
    } catch (e) {
      console.warn('Failed to save blood requests:', e)
    }
  }, [requests])

  const submitNewRequest = (data: {
    patient_name: string
    blood_group: BloodGroup
    component: BloodComponent
    units_needed: number
    urgency: UrgencyLevel
    hospital_name: string
    hospital_city: string
    hospital_room?: string
    doctor_name?: string
    requisition_attached: boolean
    requester_name?: string
    requester_phone?: string
  }): BloodRequest => {
    const codeNum = Math.floor(1000 + Math.random() * 9000)
    const newReq: BloodRequest = {
      id: 'req_' + Date.now(),
      code: `RK-${codeNum}`,
      requester_id: 'user_current',
      requester_name: data.requester_name || 'Requester Caregiver',
      requester_phone: data.requester_phone || '+91 98000 00000',
      share_token: `RK-${codeNum}`,
      patient_name: data.patient_name,
      blood_group: data.blood_group,
      component: data.component,
      units_needed: data.units_needed,
      units_confirmed: 0,
      urgency: data.urgency,
      needed_by: data.urgency === 'critical' ? 'Urgent (Within 4 hours)' : 'Standard (Within 24 hours)',
      hospital_name: data.hospital_name,
      hospital_city: data.hospital_city,
      hospital_room: data.hospital_room || 'General Emergency Ward',
      doctor_name: data.doctor_name || 'Attending Physician',
      requisition_attached: data.requisition_attached,
      status: 'pending_verification',
      created_at: 'Just now',
      reverted_donors: []
    }

    setRequests((prev) => [newReq, ...prev])
    setActiveRequestId(newReq.id)
    return newReq
  }

  const verifyRequest = (requestId: string, verifierName: string, notes?: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'matching',
            verified_by: verifierName,
            verified_at: 'Just now',
            verification_notes: notes || 'Hospital blood requisition slip verified and authentic.'
          }
        }
        return r
      })
    )
  }

  const rejectRequest = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'rejected',
            verification_notes: reason
          }
        }
        return r
      })
    )
  }

  const revertAsDonor = (
    requestId: string,
    donor: {
      name: string
      bloodGroup: BloodGroup
      city: string
      area: string
      phone: string
      distanceKm?: number
      etaMinutes?: number
      message?: string
    }
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          // Check if already reverted
          if (r.reverted_donors.some((d) => d.phone === donor.phone || d.donorName === donor.name)) {
            return r
          }
          const newRevert: RevertedDonor = {
            id: 'rev_' + Date.now(),
            requestId: r.id,
            donorName: donor.name,
            bloodGroup: donor.bloodGroup,
            city: donor.city,
            area: donor.area,
            distanceKm: donor.distanceKm || 3.5,
            phone: donor.phone,
            etaMinutes: donor.etaMinutes || 25,
            revertedAt: 'Just now',
            message: donor.message || 'I am voluntary and ready to donate at the hospital.'
          }
          return {
            ...r,
            units_confirmed: Math.min(r.units_needed, r.units_confirmed + 1),
            reverted_donors: [newRevert, ...r.reverted_donors]
          }
        }
        return r
      })
    )
  }

  const resetToDefaults = () => {
    setRequests(DEFAULT_REQUESTS)
    setActiveRequestId(DEFAULT_REQUESTS[0].id)
    localStorage.removeItem(STORAGE_KEY)
  }

  const activeRequest = requests.find((r) => r.id === activeRequestId) || requests[0] || null

  return (
    <BloodRequestContext.Provider
      value={{
        requests,
        activeRequest,
        setActiveRequestId,
        submitNewRequest,
        verifyRequest,
        rejectRequest,
        revertAsDonor,
        resetToDefaults
      }}
    >
      {children}
    </BloodRequestContext.Provider>
  )
}

export const useBloodRequests = () => {
  const context = useContext(BloodRequestContext)
  if (!context) {
    throw new Error('useBloodRequests must be used within a BloodRequestProvider')
  }
  return context
}
