export type LeadStatus = 'New' | 'In Progress' | 'Production Started' | 'Installation' | 'Completed' | 'Payment Pending';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string;
  salesperson: string;
  status: LeadStatus;
  createdAt: string;
  history: HistoryEntry[];
  callLogs: CallLog[];
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  note: string;
}

export interface CallLog {
  id: string;
  timestamp: string;
  agent: string;
  summary: string;
  durationMinutes: number;
}

export type UserPermission =
  | 'Dashboard'
  | 'Customer Management'
  | 'Quotations'
  | 'Site Visits'
  | 'Inventory'
  | 'User Management';

export interface StaffUser {
  id: string;
  name: string;
  role: 'Accountment' | 'Manager' | 'Sales Person' | 'Designer';
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  permissions: UserPermission[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockLevel: number;
}

export interface Quotation {
  id: string;
  leadId: string;
  customerName?: string;
  customerPhone?: string;
  items: QuotationItem[];
  totalAmount: number;
  discount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  createdAt: string;
}

export interface QuotationItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SiteVisit {
  id: string;
  leadId: string;
  designer: string;
  visitDate: string;
  notes: string;
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  designUrl?: string;
}
