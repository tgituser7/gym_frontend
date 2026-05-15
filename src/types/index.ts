export interface Gym {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  description?: string;
  logo?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionTier {
  _id: string;
  name: string;
  basePrice: number;
  memberLimit: number;
  serviceLimit: number;
  staffLimit: number;
  additionalMemberPrice: number;
  additionalMemberUnit: number;
  isActive: boolean;
}

export interface BranchSubscription {
  tierId: string;
  additionalMembers: number;
  additionalStaff: number;
  additionalServices: number;
  additionalAmount: number;
  status: 'active' | 'inactive';
  startDate: string;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  subscription: BranchSubscription;
  usage: { members: number; services: number; staff: number };
  limits: { members: number; services: number; staff: number };
  totalMonthlyAmount: number;
}

export interface Branch {
  _id: string;
  gym: string | Gym;
  name: string;
  address: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  manager?: Staff | string;
  status: 'active' | 'inactive';
  notes?: string;
  subscription?: BranchSubscription;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  _id: string;
  branch: Branch | string;
  name: string;
  email: string;
  phone?: string;
  role: 'Trainer' | 'Instructor' | 'Manager' | 'Receptionist' | 'Maintenance' | 'Nutritionist' | 'Other';
  specialization?: string;
  salary?: number;
  joinDate: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  branch: Branch | string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  instructor?: Staff | string;
  category: 'Yoga' | 'Cardio' | 'Strength' | 'Pilates' | 'Swimming' | 'Martial Arts' | 'Dance' | 'Nutrition' | 'Other';
  schedule?: string;
  maxCapacity?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  _id: string;
  branch: Branch | string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  membershipStartDate: string;
  membershipEndDate?: string;
  services: Service[] | string[];
  status: 'active' | 'inactive';
  emergencyContact?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Fee {
  _id: string;
  branch: Branch | string;
  member: Member | string;
  amount: number;
  description?: string;
  dueDate: string;
  settledOn?: string;
  status: 'settled' | 'due' | 'overdue';
  feesMethod?: 'cash' | 'card' | 'online' | 'other';
  services?: Service[] | string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalStaff: number;
  activeStaff: number;
  totalServices: number;
  monthlyRevenue: number;
  pendingAmount: number;
  recentMembers: Member[];
  upcomingDues: Fee[];
}
