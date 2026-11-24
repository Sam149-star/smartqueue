import { UserRole } from './authContext'

export interface DemoAccount {
  id: string
  fullName: string
  email: string
  phone: string
  city: string
  roles: UserRole[]
  bloodGroup?: string
  badge: string
  description: string
  category: 'donor' | 'requester' | 'verifier'
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo_donor_o_pos',
    fullName: 'Rahul Varma',
    email: 'rahul.donor@raktify.org',
    phone: '+91 98201 44892',
    city: 'Mumbai',
    roles: ['donor'],
    bloodGroup: 'O+',
    badge: 'O+ Regular Donor',
    description: 'Consenting whole-blood donor with 8 verified donations. Ready for urgent alerts in Mumbai.',
    category: 'donor'
  },
  {
    id: 'demo_donor_o_neg',
    fullName: 'Vikram Sethi',
    email: 'vikram.universal@raktify.org',
    phone: '+91 97692 33104',
    city: 'Mumbai',
    roles: ['donor'],
    bloodGroup: 'O-',
    badge: 'O- Universal Donor',
    description: 'Rare universal red-cell lifesaver with 15 verified donations. Alerted for critical trauma cases.',
    category: 'donor'
  },
  {
    id: 'demo_donor_platelets',
    fullName: 'Dr. Sneha Patel',
    email: 'sneha.platelets@raktify.org',
    phone: '+91 98210 55901',
    city: 'Mumbai',
    roles: ['donor'],
    bloodGroup: 'B+',
    badge: 'B+ Apheresis Donor',
    description: 'Specialized Single Donor Platelets (SDP) apheresis donor for dengue and oncology emergencies.',
    category: 'donor'
  },
  {
    id: 'demo_requester_lilavati',
    fullName: 'Aakash Sharma',
    email: 'aakash.requester@raktify.org',
    phone: '+91 98200 11223',
    city: 'Mumbai',
    roles: ['receiver'],
    badge: 'Lilavati ICU Requester',
    description: 'Caregiver for Meera Sharma (Request #RK-8921, 2 Units O+ PRBC at Lilavati Hospital).',
    category: 'requester'
  },
  {
    id: 'demo_requester_kem',
    fullName: 'Karan Roy',
    email: 'karan.kem@raktify.org',
    phone: '+91 98333 44556',
    city: 'Mumbai',
    roles: ['receiver'],
    badge: 'KEM Emergency Requester',
    description: 'Family member seeking urgent B+ platelets for pediatric dengue patient Ananya Roy (#RK-5042).',
    category: 'requester'
  },
  {
    id: 'demo_verifier_lilavati',
    fullName: 'Dr. Priya Sen',
    email: 'dr.priya.verifier@raktify.org',
    phone: '+91 98199 77889',
    city: 'Mumbai',
    roles: ['verifier'],
    badge: 'MMC-2018-09124 • Lilavati',
    description: 'Authorized Duty Blood Bank Officer. Reviews and verifies hospital blood requisitions.',
    category: 'verifier'
  },
  {
    id: 'demo_verifier_kem',
    fullName: 'Dr. Rajesh Kulkarni',
    email: 'dr.rajesh.kem@raktify.org',
    phone: '+91 98205 66778',
    city: 'Mumbai',
    roles: ['verifier'],
    badge: 'MMC-2012-04512 • KEM Head',
    description: 'Senior Professor & Head of Transfusion Medicine at KEM Hospital & Seth GS Medical College.',
    category: 'verifier'
  }
]
