export type LeadStatus = 'New' | 'In Progress' | 'Production Started' | 'Installation' | 'Completed' | 'Payment Pending';

export type CustomerTimelineType = 'call' | 'quotation' | 'invoice' | 'profile' | 'site-visit' | 'activity';

export interface CustomerTimelineEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  note: string;
  type: CustomerTimelineType;
  refId?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  history: CustomerTimelineEntry[];
  callLogs: CallLog[];
  quotationIds: string[];
  invoiceIds: string[];
  status?: LeadStatus;
}

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
  customerId: string;
  timestamp: string;
  agent: string;
  summary: string;
  durationMinutes: number;
  direction: 'Incoming' | 'Outgoing';
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
  minimumStockLevel?: number;
  sourceType?: 'GRN' | 'DIRECT';
  lastGrnId?: string;
  lastUpdatedAt?: string;
}

export interface StockHistoryEntry {
  id: string;
  inventoryItemId: string;
  itemName: string;
  changeType: 'OPENING' | 'GRN_IN' | 'PRICE_UPDATE';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  note: string;
  createdAt: string;
}

export interface GRNItemLine {
  inventoryItemId: string;
  quantity: number;
  costPrice: number;
}

export interface GRNRecord {
  id: string;
  supplierName: string;
  createdAt: string;
  items: GRNItemLine[];
  totalAmount: number;
  paymentStatus: 'Pending' | 'Partially Paid' | 'Paid';
}

export interface PurchasePayment {
  id: string;
  grnId: string;
  supplierName: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque';
  paidAt: string;
  reference: string;
}

export interface Quotation {
  id: string;
  leadId: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  items: QuotationItem[];
  totalAmount: number;
  discount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Invoiced';
  createdAt: string;
  updatedAt: string;
  history: QuotationHistoryEntry[];
  handoverInvoiceId?: string;
  visitRequired?: boolean;
}

export interface QuotationHistoryEntry {
  id: string;
  timestamp: string;
  editor: string;
  note: string;
  totalAmount: number;
  discount: number;
  status: Quotation['status'];
  items: QuotationItem[];
}

export interface QuotationItem {
  itemId: string;
  inventoryItemId?: string;
  sourceType?: 'GRN' | 'DIRECT' | 'ADHOC';
  name: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  lineDiscount?: number;
  baseUnitPrice?: number;
  editablePrice?: boolean;
  note?: string;
  total: number;
}

export interface Invoice {
  id: string;
  quotationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  status: 'Draft' | 'Printed' | 'Paid';
  createdAt: string;
  updatedAt: string;
  history: InvoiceHistoryEntry[];
  printCount: number;
  revisionNo?: number;
  advancePaid?: number;
  balanceDue?: number;
  emailLog?: string[];
}

export interface AdvancePayment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'Cash' | 'Card' | 'Bank Transfer';
  reference: string;
  paidAt: string;
}

export interface InvoiceHistoryEntry {
  id: string;
  timestamp: string;
  editor: string;
  note: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  status: Invoice['status'];
  items: QuotationItem[];
}

export interface SiteVisit {
  id: string;
  leadId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  designer: string;
  visitDate: string;
  notes: string;
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  designUrl?: string;
  attachments?: string[];
}
