/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Leads from './components/Leads.tsx';
import Inventory from './components/Inventory.tsx';
import Quotations from './components/Quotations.tsx';
import Invoices from './components/Invoices.tsx';
import SiteVisits from './components/SiteVisits.tsx';
import UserManagement from './components/UserManagement.tsx';
import Settings from './components/Settings.tsx';
import Analyze from './components/Analyze.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { Menu } from 'lucide-react';
import type {
  AdvancePayment,
  CallLog,
  CustomerProfile,
  GRNRecord,
  InventoryItem,
  Invoice,
  InvoiceHistoryEntry,
  PurchasePayment,
  Quotation,
  QuotationHistoryEntry,
  QuotationItem,
  SiteVisit,
  StockHistoryEntry,
  StaffUser
} from './types';

type ActiveTab = 'dashboard' | 'leads' | 'inventory' | 'quotations' | 'invoices' | 'site-visits' | 'user-management' | 'settings' | 'analyze';

interface StoredCrmState {
  customers: CustomerProfile[];
  quotations: Quotation[];
  invoices: Invoice[];
  inventoryItems: InventoryItem[];
  grnRecords: GRNRecord[];
  purchasePayments: PurchasePayment[];
  siteVisits: SiteVisit[];
  advancePayments: AdvancePayment[];
  stockHistory: StockHistoryEntry[];
}

const STORAGE_KEY = 'crm-group-project:v2';
const DEFAULT_SALESPERSON_NAME = 'Nimal Perera';

const initialStaffUsers: StaffUser[] = [
  {
    id: 'u-1',
    name: 'Adele Dias',
    role: 'Manager',
    phone: '0774001223',
    email: 'adele@pantrysolutions.com',
    status: 'Active',
    createdAt: '2024-01-08T09:00:00Z',
    permissions: ['Dashboard', 'Customer Management', 'Quotations', 'Site Visits', 'Inventory', 'User Management']
  },
  {
    id: 'u-2',
    name: 'Nimal Perera',
    role: 'Sales Person',
    phone: '0779881122',
    email: 'nimal@pantrysolutions.com',
    status: 'Active',
    createdAt: '2024-02-12T10:30:00Z',
    permissions: ['Dashboard', 'Customer Management', 'Quotations']
  },
  {
    id: 'u-3',
    name: 'Kasun Silva',
    role: 'Sales Person',
    phone: '0776655443',
    email: 'kasun@pantrysolutions.com',
    status: 'Active',
    createdAt: '2024-03-05T09:45:00Z',
    permissions: ['Dashboard', 'Customer Management', 'Quotations']
  }
];

const now = () => new Date().toISOString();

const createInitialCustomer = (
  id: string,
  name: string,
  phone: string,
  address: string,
  ownerName = DEFAULT_SALESPERSON_NAME
): CustomerProfile => ({
  id,
  name,
  phone,
  address,
  ownerName,
  createdAt: now(),
  updatedAt: now(),
  history: [
    {
      id: `${id}-history-1`,
      timestamp: now(),
      user: 'System',
      action: 'Customer registered',
      note: 'Initial customer profile created.',
      type: 'profile'
    }
  ],
  callLogs: [],
  quotationIds: [],
  invoiceIds: []
});

const sarahSeedCustomer: CustomerProfile = {
  ...createInitialCustomer('c-1', 'Sarah Jenkins', '0771234567', '123 Main St, Colombo', 'Nimal Perera'),
  updatedAt: '2026-04-09T11:15:00.000Z',
  quotationIds: ['QT-2026-001'],
  invoiceIds: ['INV-2026-001'],
  callLogs: [
    {
      id: 'call-seed-1',
      customerId: 'c-1',
      timestamp: '2026-04-08T09:40:00.000Z',
      agent: 'Nimal Perera',
      summary: 'Customer confirmed budget range and requested site measurement visit this week.',
      durationMinutes: 8,
      direction: 'Outgoing'
    },
    {
      id: 'call-seed-2',
      customerId: 'c-1',
      timestamp: '2026-04-07T15:15:00.000Z',
      agent: 'Nimal Perera',
      summary: 'Discussed preferred colors and shared catalog references over WhatsApp.',
      durationMinutes: 6,
      direction: 'Incoming'
    }
  ],
  history: [
    {
      id: 'hist-seed-1',
      timestamp: '2026-04-08T09:40:00.000Z',
      user: 'Nimal Perera',
      action: 'Call log added',
      note: 'Customer confirmed budget range and requested site measurement visit this week. (8 min).',
      type: 'call',
      refId: 'call-seed-1'
    },
    {
      id: 'hist-seed-2',
      timestamp: '2026-04-07T15:15:00.000Z',
      user: 'Nimal Perera',
      action: 'Call log added',
      note: 'Discussed preferred colors and shared catalog references over WhatsApp. (6 min).',
      type: 'call',
      refId: 'call-seed-2'
    },
    {
      id: 'hist-seed-4',
      timestamp: '2026-04-09T11:15:00.000Z',
      user: 'Nimal Perera',
      action: 'Invoice created',
      note: 'Invoice INV-2026-001 created from quotation QT-2026-001.',
      type: 'invoice',
      refId: 'INV-2026-001'
    },
    {
      id: 'hist-seed-5',
      timestamp: '2026-04-09T10:10:00.000Z',
      user: 'Nimal Perera',
      action: 'Quotation created',
      note: 'Quotation QT-2026-001 created for Sarah Jenkins.',
      type: 'quotation',
      refId: 'QT-2026-001'
    },
    ...createInitialCustomer('c-1', 'Sarah Jenkins', '0771234567', '123 Main St, Colombo', 'Nimal Perera').history
  ]
};

const michaelSeedCustomer: CustomerProfile = {
  ...createInitialCustomer('c-2', 'Michael Chen', '0779876543', '45 Park Ave, Kandy', 'Kasun Silva'),
  updatedAt: '2026-04-09T09:20:00.000Z',
  quotationIds: ['QT-2026-002'],
  invoiceIds: ['INV-2026-002'],
  callLogs: [
    {
      id: 'call-seed-3',
      customerId: 'c-2',
      timestamp: '2026-04-08T11:00:00.000Z',
      agent: 'Kasun Silva',
      summary: 'Followed up on quotation timeline; customer asked for final amount with delivery charges.',
      durationMinutes: 10,
      direction: 'Outgoing'
    }
  ],
  history: [
    {
      id: 'hist-seed-3',
      timestamp: '2026-04-08T11:00:00.000Z',
      user: 'Kasun Silva',
      action: 'Call log added',
      note: 'Followed up on quotation timeline; customer asked for final amount with delivery charges. (10 min).',
      type: 'call',
      refId: 'call-seed-3'
    },
    {
      id: 'hist-seed-6',
      timestamp: '2026-04-09T09:20:00.000Z',
      user: 'Kasun Silva',
      action: 'Invoice created',
      note: 'Invoice INV-2026-002 created from quotation QT-2026-002.',
      type: 'invoice',
      refId: 'INV-2026-002'
    },
    {
      id: 'hist-seed-7',
      timestamp: '2026-04-08T14:05:00.000Z',
      user: 'Kasun Silva',
      action: 'Quotation created',
      note: 'Quotation QT-2026-002 created for Michael Chen.',
      type: 'quotation',
      refId: 'QT-2026-002'
    },
    ...createInitialCustomer('c-2', 'Michael Chen', '0779876543', '45 Park Ave, Kandy', 'Kasun Silva').history
  ]
};

const aruniSeedCustomer: CustomerProfile = {
  ...createInitialCustomer('c-3', 'Aruni Fernando', '0774455123', '88 Lake Road, Gampaha', 'Kasun Silva'),
  updatedAt: '2026-04-09T08:00:00.000Z',
  quotationIds: ['QT-2026-003'],
  history: [
    {
      id: 'hist-seed-8',
      timestamp: '2026-04-09T08:00:00.000Z',
      user: 'Kasun Silva',
      action: 'Quotation created',
      note: 'Quotation QT-2026-003 created for Aruni Fernando.',
      type: 'quotation',
      refId: 'QT-2026-003'
    },
    ...createInitialCustomer('c-3', 'Aruni Fernando', '0774455123', '88 Lake Road, Gampaha', 'Kasun Silva').history
  ]
};

const quotationSeed: Quotation[] = [
  {
    id: 'QT-2026-001',
    leadId: 'c-1',
    customerId: 'c-1',
    customerName: 'Sarah Jenkins',
    customerPhone: '0771234567',
    items: [
      {
        itemId: 'itm-1',
        inventoryItemId: 'itm-1',
        sourceType: 'GRN',
        name: 'Aluminum Profile A',
        unit: 'Meters',
        quantity: 8,
        baseUnitPrice: 25,
        unitPrice: 25,
        lineDiscount: 0,
        editablePrice: false,
        total: 200
      },
      {
        itemId: 'itm-2',
        inventoryItemId: 'itm-2',
        sourceType: 'GRN',
        name: 'Granite Top - Black',
        unit: 'SqFt',
        quantity: 10,
        baseUnitPrice: 85,
        unitPrice: 85,
        lineDiscount: 0,
        editablePrice: false,
        total: 850
      },
      {
        itemId: 'itm-3',
        inventoryItemId: 'itm-3',
        sourceType: 'DIRECT',
        name: 'Installation Service - Pantry Unit',
        unit: 'Job',
        quantity: 1,
        baseUnitPrice: 120,
        unitPrice: 120,
        lineDiscount: 0,
        editablePrice: true,
        total: 120
      }
    ],
    totalAmount: 1100,
    discount: 70,
    status: 'Invoiced',
    createdAt: '2026-04-09T10:10:00.000Z',
    updatedAt: '2026-04-09T11:15:00.000Z',
    handoverInvoiceId: 'INV-2026-001',
    history: [
      {
        id: 'qhist-seed-1',
        timestamp: '2026-04-09T11:15:00.000Z',
        editor: 'Nimal Perera',
        note: 'Quotation handed over to invoice',
        totalAmount: 1100,
        discount: 70,
        status: 'Sent',
        items: [
          {
            itemId: 'itm-1',
            inventoryItemId: 'itm-1',
            sourceType: 'GRN',
            name: 'Aluminum Profile A',
            unit: 'Meters',
            quantity: 8,
            baseUnitPrice: 25,
            unitPrice: 25,
            lineDiscount: 0,
            editablePrice: false,
            total: 200
          },
          {
            itemId: 'itm-2',
            inventoryItemId: 'itm-2',
            sourceType: 'GRN',
            name: 'Granite Top - Black',
            unit: 'SqFt',
            quantity: 10,
            baseUnitPrice: 85,
            unitPrice: 85,
            lineDiscount: 0,
            editablePrice: false,
            total: 850
          },
          {
            itemId: 'itm-3',
            inventoryItemId: 'itm-3',
            sourceType: 'DIRECT',
            name: 'Installation Service - Pantry Unit',
            unit: 'Job',
            quantity: 1,
            baseUnitPrice: 120,
            unitPrice: 120,
            lineDiscount: 0,
            editablePrice: true,
            total: 120
          }
        ]
      }
    ]
  },
  {
    id: 'QT-2026-002',
    leadId: 'c-2',
    customerId: 'c-2',
    customerName: 'Michael Chen',
    customerPhone: '0779876543',
    items: [
      {
        itemId: 'itm-1',
        inventoryItemId: 'itm-1',
        sourceType: 'GRN',
        name: 'Aluminum Profile A',
        unit: 'Meters',
        quantity: 4,
        baseUnitPrice: 25,
        unitPrice: 25,
        lineDiscount: 0,
        editablePrice: false,
        total: 100
      },
      {
        itemId: 'adhoc-qt-2-1',
        sourceType: 'ADHOC',
        name: 'Premium Sink Unit (Custom)',
        unit: 'Piece',
        quantity: 1,
        baseUnitPrice: 200,
        unitPrice: 200,
        lineDiscount: 0,
        editablePrice: true,
        total: 200
      }
    ],
    totalAmount: 280,
    discount: 20,
    status: 'Invoiced',
    createdAt: '2026-04-08T14:05:00.000Z',
    updatedAt: '2026-04-09T09:20:00.000Z',
    handoverInvoiceId: 'INV-2026-002',
    history: [
      {
        id: 'qhist-seed-2',
        timestamp: '2026-04-09T09:20:00.000Z',
        editor: 'Kasun Silva',
        note: 'Quotation handed over to invoice',
        totalAmount: 280,
        discount: 20,
        status: 'Accepted',
        items: [
          {
            itemId: 'itm-1',
            inventoryItemId: 'itm-1',
            sourceType: 'GRN',
            name: 'Aluminum Profile A',
            unit: 'Meters',
            quantity: 4,
            baseUnitPrice: 25,
            unitPrice: 25,
            lineDiscount: 0,
            editablePrice: false,
            total: 100
          },
          {
            itemId: 'adhoc-qt-2-1',
            sourceType: 'ADHOC',
            name: 'Premium Sink Unit (Custom)',
            unit: 'Piece',
            quantity: 1,
            baseUnitPrice: 200,
            unitPrice: 200,
            lineDiscount: 0,
            editablePrice: true,
            total: 200
          }
        ]
      }
    ]
  },
  {
    id: 'QT-2026-003',
    leadId: 'c-3',
    customerId: 'c-3',
    customerName: 'Aruni Fernando',
    customerPhone: '0774455123',
    items: [
      {
        itemId: 'adhoc-qt-3-1',
        sourceType: 'ADHOC',
        name: 'Design Consultation & 3D Mockup',
        unit: 'Package',
        quantity: 1,
        baseUnitPrice: 150,
        unitPrice: 150,
        lineDiscount: 0,
        editablePrice: true,
        total: 150
      },
      {
        itemId: 'itm-3',
        inventoryItemId: 'itm-3',
        sourceType: 'DIRECT',
        name: 'Installation Service - Pantry Unit',
        unit: 'Job',
        quantity: 1,
        baseUnitPrice: 120,
        unitPrice: 120,
        lineDiscount: 0,
        editablePrice: true,
        total: 120
      }
    ],
    totalAmount: 270,
    discount: 0,
    status: 'Sent',
    createdAt: '2026-04-09T08:00:00.000Z',
    updatedAt: '2026-04-09T08:30:00.000Z',
    visitRequired: true,
    history: []
  }
];

const invoiceSeed: Invoice[] = [
  {
    id: 'INV-2026-001',
    quotationId: 'QT-2026-001',
    customerId: 'c-1',
    customerName: 'Sarah Jenkins',
    customerPhone: '0771234567',
    items: [
      {
        itemId: 'itm-1',
        inventoryItemId: 'itm-1',
        sourceType: 'GRN',
        name: 'Aluminum Profile A',
        unit: 'Meters',
        quantity: 8,
        baseUnitPrice: 25,
        unitPrice: 25,
        lineDiscount: 0,
        editablePrice: false,
        total: 200
      },
      {
        itemId: 'itm-2',
        inventoryItemId: 'itm-2',
        sourceType: 'GRN',
        name: 'Granite Top - Black',
        unit: 'SqFt',
        quantity: 10,
        baseUnitPrice: 85,
        unitPrice: 85,
        lineDiscount: 0,
        editablePrice: false,
        total: 850
      },
      {
        itemId: 'itm-3',
        inventoryItemId: 'itm-3',
        sourceType: 'DIRECT',
        name: 'Installation Service - Pantry Unit',
        unit: 'Job',
        quantity: 1,
        baseUnitPrice: 120,
        unitPrice: 120,
        lineDiscount: 0,
        editablePrice: true,
        total: 120
      }
    ],
    subtotal: 1170,
    discount: 70,
    totalAmount: 1100,
    status: 'Printed',
    createdAt: '2026-04-09T11:15:00.000Z',
    updatedAt: '2026-04-09T12:00:00.000Z',
    history: [
      {
        id: 'ihist-seed-1',
        timestamp: '2026-04-09T12:00:00.000Z',
        editor: 'Nimal Perera',
        note: 'Invoice PDF downloaded',
        subtotal: 1170,
        discount: 70,
        totalAmount: 1100,
        status: 'Printed',
        items: [
          {
            itemId: 'itm-1',
            inventoryItemId: 'itm-1',
            sourceType: 'GRN',
            name: 'Aluminum Profile A',
            unit: 'Meters',
            quantity: 8,
            baseUnitPrice: 25,
            unitPrice: 25,
            lineDiscount: 0,
            editablePrice: false,
            total: 200
          },
          {
            itemId: 'itm-2',
            inventoryItemId: 'itm-2',
            sourceType: 'GRN',
            name: 'Granite Top - Black',
            unit: 'SqFt',
            quantity: 10,
            baseUnitPrice: 85,
            unitPrice: 85,
            lineDiscount: 0,
            editablePrice: false,
            total: 850
          },
          {
            itemId: 'itm-3',
            inventoryItemId: 'itm-3',
            sourceType: 'DIRECT',
            name: 'Installation Service - Pantry Unit',
            unit: 'Job',
            quantity: 1,
            baseUnitPrice: 120,
            unitPrice: 120,
            lineDiscount: 0,
            editablePrice: true,
            total: 120
          }
        ]
      }
    ],
    printCount: 1,
    revisionNo: 2,
    advancePaid: 400,
    balanceDue: 700,
    emailLog: ['Sent on 4/9/2026, 5:15:00 PM']
  },
  {
    id: 'INV-2026-002',
    quotationId: 'QT-2026-002',
    customerId: 'c-2',
    customerName: 'Michael Chen',
    customerPhone: '0779876543',
    items: [
      {
        itemId: 'itm-1',
        inventoryItemId: 'itm-1',
        sourceType: 'GRN',
        name: 'Aluminum Profile A',
        unit: 'Meters',
        quantity: 4,
        baseUnitPrice: 25,
        unitPrice: 25,
        lineDiscount: 0,
        editablePrice: false,
        total: 100
      },
      {
        itemId: 'adhoc-qt-2-1',
        sourceType: 'ADHOC',
        name: 'Premium Sink Unit (Custom)',
        unit: 'Piece',
        quantity: 1,
        baseUnitPrice: 200,
        unitPrice: 200,
        lineDiscount: 0,
        editablePrice: true,
        total: 200
      }
    ],
    subtotal: 300,
    discount: 20,
    totalAmount: 280,
    status: 'Draft',
    createdAt: '2026-04-09T09:20:00.000Z',
    updatedAt: '2026-04-09T09:45:00.000Z',
    history: [],
    printCount: 0,
    revisionNo: 1,
    advancePaid: 100,
    balanceDue: 180,
    emailLog: []
  }
];

const advancePaymentSeed: AdvancePayment[] = [
  {
    id: 'adv-seed-1',
    invoiceId: 'INV-2026-001',
    amount: 250,
    method: 'Bank Transfer',
    reference: 'ADV-BT-1101',
    paidAt: '2026-04-09T12:20:00.000Z'
  },
  {
    id: 'adv-seed-2',
    invoiceId: 'INV-2026-001',
    amount: 150,
    method: 'Cash',
    reference: 'ADV-CS-1102',
    paidAt: '2026-04-09T13:10:00.000Z'
  },
  {
    id: 'adv-seed-3',
    invoiceId: 'INV-2026-002',
    amount: 100,
    method: 'Card',
    reference: 'ADV-CD-2201',
    paidAt: '2026-04-09T10:00:00.000Z'
  }
];

const inventorySeed: InventoryItem[] = [
  {
    id: 'itm-1',
    name: 'Aluminum Profile A',
    category: 'Hardware',
    unit: 'Meters',
    costPrice: 15.5,
    sellingPrice: 25,
    stockLevel: 12,
    minimumStockLevel: 6,
    sourceType: 'GRN',
    lastGrnId: 'GRN-2026-001',
    lastUpdatedAt: '2026-04-06T09:00:00.000Z'
  },
  {
    id: 'itm-2',
    name: 'Granite Top - Black',
    category: 'Surfaces',
    unit: 'SqFt',
    costPrice: 45,
    sellingPrice: 85,
    stockLevel: 18,
    minimumStockLevel: 8,
    sourceType: 'GRN',
    lastGrnId: 'GRN-2026-002',
    lastUpdatedAt: '2026-04-08T11:10:00.000Z'
  },
  {
    id: 'itm-3',
    name: 'Installation Service - Pantry Unit',
    category: 'Services',
    unit: 'Job',
    costPrice: 0,
    sellingPrice: 120,
    stockLevel: 999,
    minimumStockLevel: 0,
    sourceType: 'DIRECT',
    lastUpdatedAt: '2026-04-08T10:00:00.000Z'
  }
];

const stockHistorySeed: StockHistoryEntry[] = [
  {
    id: 'stk-1',
    inventoryItemId: 'itm-1',
    itemName: 'Aluminum Profile A',
    changeType: 'GRN_IN',
    quantityChange: 12,
    previousStock: 0,
    newStock: 12,
    note: 'Stock received via GRN-2026-001',
    createdAt: '2026-04-06T09:00:00.000Z'
  },
  {
    id: 'stk-2',
    inventoryItemId: 'itm-2',
    itemName: 'Granite Top - Black',
    changeType: 'GRN_IN',
    quantityChange: 18,
    previousStock: 0,
    newStock: 18,
    note: 'Stock received via GRN-2026-002',
    createdAt: '2026-04-08T11:10:00.000Z'
  }
];

const grnSeed: GRNRecord[] = [
  {
    id: 'GRN-2026-001',
    supplierName: 'Lanka Hardware Imports',
    createdAt: '2026-04-06T09:00:00.000Z',
    items: [{ inventoryItemId: 'itm-1', quantity: 12, costPrice: 15.5 }],
    totalAmount: 186,
    paymentStatus: 'Paid'
  },
  {
    id: 'GRN-2026-002',
    supplierName: 'City Granite House',
    createdAt: '2026-04-08T11:10:00.000Z',
    items: [{ inventoryItemId: 'itm-2', quantity: 18, costPrice: 45 }],
    totalAmount: 810,
    paymentStatus: 'Partially Paid'
  }
];

const purchasePaymentSeed: PurchasePayment[] = [
  {
    id: 'pay-1',
    grnId: 'GRN-2026-002',
    supplierName: 'City Granite House',
    amount: 400,
    paymentMethod: 'Bank Transfer',
    paidAt: '2026-04-08T16:00:00.000Z',
    reference: 'BT-882221'
  }
];

const siteVisitSeed: SiteVisit[] = [
  {
    id: 'SV-001',
    leadId: 'c-1',
    customerId: 'c-1',
    customerName: 'Sarah Jenkins',
    customerPhone: '0771234567',
    designer: 'Field Officer - Ishan',
    visitDate: '2026-04-09T10:30:00.000Z',
    notes: 'Vehicle can access only through side lane. Pantry wall level check needed before granite top install.',
    difficultyRating: 3,
    attachments: ['site-photo-1.jpg']
  },
  {
    id: 'SV-002',
    leadId: 'c-2',
    customerId: 'c-2',
    customerName: 'Michael Chen',
    customerPhone: '0779876543',
    designer: 'Field Officer - Rashmi',
    visitDate: '2026-04-08T16:45:00.000Z',
    notes: 'Kitchen plumbing line sits 6 inches above standard cabinet level. Additional support frame required.',
    difficultyRating: 4,
    attachments: ['site-photo-2.jpg', 'measurement-sheet-2.pdf']
  }
];

const seedState: StoredCrmState = {
  customers: [sarahSeedCustomer, michaelSeedCustomer, aruniSeedCustomer],
  quotations: quotationSeed,
  invoices: invoiceSeed,
  inventoryItems: inventorySeed,
  grnRecords: grnSeed,
  purchasePayments: purchasePaymentSeed,
  siteVisits: siteVisitSeed,
  advancePayments: advancePaymentSeed,
  stockHistory: stockHistorySeed
};

const loadStoredState = (): StoredCrmState => {
  if (typeof window === 'undefined') {
    return seedState;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    return seedState;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<StoredCrmState>;
    const customersWithOwner = (parsed.customers ?? seedState.customers).map((customer) => {
      const normalizedOwnerName =
        !customer.ownerName || customer.ownerName === 'Sales Team'
          ? DEFAULT_SALESPERSON_NAME
          : customer.ownerName;

      return {
        ...customer,
        ownerName: normalizedOwnerName,
        history: customer.history.map((entry) => ({
          ...entry,
          user: entry.user === 'Sales Team' ? normalizedOwnerName : entry.user
        })),
        callLogs: customer.callLogs.map((log) => ({
          ...log,
          agent: log.agent === 'Sales Team' ? normalizedOwnerName : log.agent,
          direction: (log.direction === 'Incoming' ? 'Incoming' : 'Outgoing') as 'Incoming' | 'Outgoing'
        }))
      };
    });

    const shouldBackfillDemoTransactions =
      (parsed.quotations?.length ?? 0) === 0 &&
      (parsed.invoices?.length ?? 0) === 0 &&
      (parsed.advancePayments?.length ?? 0) === 0;

    const customersWithDemoLinks = shouldBackfillDemoTransactions
      ? customersWithOwner.map((customer) => {
          if (customer.phone === '0771234567') {
            return {
              ...customer,
              quotationIds: customer.quotationIds.length > 0 ? customer.quotationIds : ['QT-2026-001'],
              invoiceIds: customer.invoiceIds.length > 0 ? customer.invoiceIds : ['INV-2026-001']
            };
          }
          if (customer.phone === '0779876543') {
            return {
              ...customer,
              quotationIds: customer.quotationIds.length > 0 ? customer.quotationIds : ['QT-2026-002'],
              invoiceIds: customer.invoiceIds.length > 0 ? customer.invoiceIds : ['INV-2026-002']
            };
          }
          if (customer.phone === '0774455123') {
            return {
              ...customer,
              quotationIds: customer.quotationIds.length > 0 ? customer.quotationIds : ['QT-2026-003']
            };
          }
          return customer;
        })
      : customersWithOwner;

    const normalizedQuotations = ((shouldBackfillDemoTransactions ? seedState.quotations : parsed.quotations) ?? seedState.quotations).map((quotation) => ({
      ...quotation,
      history: quotation.history.map((entry) => ({
        ...entry,
        editor: entry.editor === 'Sales Team' ? DEFAULT_SALESPERSON_NAME : entry.editor
      }))
    }));

    const normalizedInvoices = ((shouldBackfillDemoTransactions ? seedState.invoices : parsed.invoices) ?? seedState.invoices).map((invoice) => ({
      ...invoice,
      history: invoice.history.map((entry) => ({
        ...entry,
        editor: entry.editor === 'Sales Team' ? DEFAULT_SALESPERSON_NAME : entry.editor
      }))
    }));

    const normalizedInventory = (parsed.inventoryItems ?? seedState.inventoryItems).map((item) => ({
      ...item,
      sourceType: item.sourceType ?? 'DIRECT',
      minimumStockLevel: item.minimumStockLevel ?? 5
    }));

    const normalizedGrn = parsed.grnRecords ?? seedState.grnRecords;
    const normalizedPurchasePayments = parsed.purchasePayments ?? seedState.purchasePayments;
    const normalizedSiteVisits = parsed.siteVisits ?? seedState.siteVisits;
    const parsedAdvancePayments = parsed.advancePayments;
    const normalizedAdvancePayments =
      (parsedAdvancePayments && parsedAdvancePayments.length > 0
        ? parsedAdvancePayments
        : seedState.advancePayments);
    const normalizedStockHistory = parsed.stockHistory ?? seedState.stockHistory;

    const hasAruniDemo = customersWithDemoLinks.some((customer) => customer.phone === aruniSeedCustomer.phone);

    return {
      customers: hasAruniDemo ? customersWithDemoLinks : [aruniSeedCustomer, ...customersWithDemoLinks],
      quotations: normalizedQuotations,
      invoices: normalizedInvoices,
      inventoryItems: normalizedInventory,
      grnRecords: normalizedGrn,
      purchasePayments: normalizedPurchasePayments,
      siteVisits: normalizedSiteVisits,
      advancePayments: normalizedAdvancePayments,
      stockHistory: normalizedStockHistory
    };
  } catch {
    return seedState;
  }
};

const cloneItems = (items: QuotationItem[]) => items.map((item) => ({ ...item }));

export default function App() {
  const initialState = useMemo(() => loadStoredState(), []);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerProfile[]>(initialState.customers);
  const [quotations, setQuotations] = useState<Quotation[]>(initialState.quotations);
  const [invoices, setInvoices] = useState<Invoice[]>(initialState.invoices);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialState.inventoryItems);
  const [grnRecords, setGrnRecords] = useState<GRNRecord[]>(initialState.grnRecords);
  const [purchasePayments, setPurchasePayments] = useState<PurchasePayment[]>(initialState.purchasePayments);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(initialState.siteVisits);
  const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>(initialState.advancePayments);
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>(initialState.stockHistory);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(initialStaffUsers);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [openQuotationComposer, setOpenQuotationComposer] = useState(false);

  const currentUser = useMemo(
    () => staffUsers.find((user) => user.status === 'Active' && user.role === 'Manager') ?? staffUsers[0],
    [staffUsers]
  );

  const salespersonOptions = useMemo(
    () => staffUsers.filter((user) => user.status === 'Active' && user.role === 'Sales Person').map((user) => user.name),
    [staffUsers]
  );

  const [currentSalesperson, setCurrentSalesperson] = useState(DEFAULT_SALESPERSON_NAME);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const payload: StoredCrmState = {
      customers,
      quotations,
      invoices,
      inventoryItems,
      grnRecords,
      purchasePayments,
      siteVisits,
      advancePayments,
      stockHistory
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [customers, quotations, invoices, inventoryItems, grnRecords, purchasePayments, siteVisits, advancePayments, stockHistory]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  useEffect(() => {
    if (salespersonOptions.length === 0) {
      return;
    }

    if (!salespersonOptions.includes(currentSalesperson)) {
      setCurrentSalesperson(salespersonOptions[0]);
      return;
    }

  }, [currentSalesperson, salespersonOptions]);

  const createStaffUser = (user: StaffUser) => {
    setStaffUsers((prev) => [user, ...prev]);
  };

  const deleteStaffUser = (userId: string) => {
    setStaffUsers((prev) => {
      const target = prev.find((user) => user.id === userId);
      if (!target || target.role === 'Manager') {
        return prev;
      }
      return prev.filter((user) => user.id !== userId);
    });
  };

  const setActiveTabAndCloseSidebar = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const registerCustomer = (input: { name: string; phone: string; address: string }, actor: string) => {
    const timestamp = now();
    const cleanActor = actor.trim() || currentSalesperson || DEFAULT_SALESPERSON_NAME;
    const customer: CustomerProfile = {
      id: `c-${Date.now()}`,
      name: input.name.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      ownerName: cleanActor,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp,
          user: cleanActor,
          action: 'Customer registered',
          note: `Customer registered with telephone ${input.phone.trim()}.`,
          type: 'profile'
        }
      ],
      callLogs: [],
      quotationIds: [],
      invoiceIds: []
    };

    setCustomers((prev) => [customer, ...prev]);
    setSelectedCustomerId(customer.id);
    return customer;
  };

  const updateCustomer = (customerId: string, updates: { name: string; phone: string; address: string }, actor: string) => {
    const timestamp = now();
    const cleanActor = actor.trim() || currentSalesperson || DEFAULT_SALESPERSON_NAME;
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              name: updates.name.trim(),
              phone: updates.phone.trim(),
              address: updates.address.trim(),
              updatedAt: timestamp,
              history: [
                {
                  id: `hist-${Date.now()}`,
                  timestamp,
                  user: cleanActor,
                  action: 'Customer updated',
                  note: 'Customer profile details were updated.',
                  type: 'profile'
                },
                ...customer.history
              ]
            }
          : customer
      )
    );
  };

  const addCallLog = (
    customerId: string,
    callLog: Omit<CallLog, 'id' | 'customerId' | 'timestamp'> & { callTime?: string }
  ) => {
    const parsedCallTime = callLog.callTime ? new Date(callLog.callTime) : null;
    const timestamp = parsedCallTime && !Number.isNaN(parsedCallTime.valueOf())
      ? parsedCallTime.toISOString()
      : now();
    const entry: CallLog = {
      id: `call-${Date.now()}`,
      customerId,
      timestamp,
      agent: callLog.agent,
      summary: callLog.summary,
      durationMinutes: callLog.durationMinutes,
      direction: callLog.direction
    };

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              updatedAt: timestamp,
              callLogs: [entry, ...customer.callLogs],
              history: [
                {
                  id: `hist-${Date.now()}`,
                  timestamp,
                  user: callLog.agent,
                  action: `${callLog.direction} call logged`,
                  note: `${callLog.summary} (${callLog.durationMinutes} min).`,
                  type: 'call',
                  refId: entry.id
                },
                ...customer.history
              ]
            }
          : customer
      )
    );
  };

  const deleteCallLog = (customerId: string, callLogId: string) => {
    const timestamp = now();
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              updatedAt: timestamp,
              callLogs: customer.callLogs.filter((log) => log.id !== callLogId),
              history: customer.history.filter((entry) => !(entry.type === 'call' && entry.refId === callLogId))
            }
          : customer
      )
    );
  };

  const registerInventoryItem = (input: {
    name: string;
    category: string;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    openingStock: number;
    minimumStockLevel: number;
    sourceType: 'GRN' | 'DIRECT';
  }) => {
    const timestamp = now();
    const item: InventoryItem = {
      id: `itm-${Date.now()}`,
      name: input.name.trim(),
      category: input.category.trim(),
      unit: input.unit.trim(),
      costPrice: input.costPrice,
      sellingPrice: input.sellingPrice,
      stockLevel: input.openingStock,
      minimumStockLevel: input.minimumStockLevel,
      sourceType: input.sourceType,
      lastUpdatedAt: timestamp
    };

    setInventoryItems((prev) => [item, ...prev]);
    setStockHistory((prev) => [
      {
        id: `stk-${Date.now()}`,
        inventoryItemId: item.id,
        itemName: item.name,
        changeType: 'OPENING',
        quantityChange: input.openingStock,
        previousStock: 0,
        newStock: input.openingStock,
        note: 'Initial item registration with opening stock.',
        createdAt: timestamp
      },
      ...prev
    ]);
    return item;
  };

  const updateInventoryPricing = (input: { itemId: string; sellingPrice: number; costPrice: number; minimumStockLevel: number }) => {
    const timestamp = now();
    let updatedItemName = '';
    let costChangeNote = '';

    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id !== input.itemId) {
          return item;
        }

        const isGrnLocked = item.sourceType === 'GRN' || Boolean(item.lastGrnId);
        const nextCostPrice = isGrnLocked ? item.costPrice : input.costPrice;
        updatedItemName = item.name;
        costChangeNote = isGrnLocked ? 'Cost price locked after GRN.' : `Cost updated to $${nextCostPrice.toFixed(2)}.`;

        return {
          ...item,
          costPrice: nextCostPrice,
          sellingPrice: input.sellingPrice,
          minimumStockLevel: input.minimumStockLevel,
          lastUpdatedAt: timestamp
        };
      })
    );

    if (updatedItemName) {
      setStockHistory((prev) => [
        {
          id: `stk-${Date.now()}`,
          inventoryItemId: input.itemId,
          itemName: updatedItemName,
          changeType: 'PRICE_UPDATE',
          quantityChange: 0,
          previousStock: 0,
          newStock: 0,
          note: `${costChangeNote} Selling updated to $${input.sellingPrice.toFixed(2)}. Min stock ${input.minimumStockLevel}.`,
          createdAt: timestamp
        },
        ...prev
      ]);
    }
  };

  const createGrn = (input: { supplierName: string; inventoryItemId: string; quantity: number; costPrice: number }) => {
    const timestamp = now();
    const grnId = `GRN-${new Date().getFullYear()}-${String(grnRecords.length + 1).padStart(3, '0')}`;
    const totalAmount = input.quantity * input.costPrice;
    const grn: GRNRecord = {
      id: grnId,
      supplierName: input.supplierName.trim(),
      createdAt: timestamp,
      items: [{ inventoryItemId: input.inventoryItemId, quantity: input.quantity, costPrice: input.costPrice }],
      totalAmount,
      paymentStatus: 'Pending'
    };

    setGrnRecords((prev) => [grn, ...prev]);
    let historyItemName = '';
    let previousStock = 0;
    let nextStock = 0;
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id !== input.inventoryItemId) {
          return item;
        }

        historyItemName = item.name;
        previousStock = item.stockLevel;
        nextStock = item.stockLevel + input.quantity;

        return {
          ...item,
          costPrice: input.costPrice,
          stockLevel: nextStock,
          sourceType: 'GRN',
          lastGrnId: grnId,
          lastUpdatedAt: timestamp
        };
      })
    );
    if (historyItemName) {
      setStockHistory((prev) => [
        {
          id: `stk-${Date.now()}`,
          inventoryItemId: input.inventoryItemId,
          itemName: historyItemName,
          changeType: 'GRN_IN',
          quantityChange: input.quantity,
          previousStock,
          newStock: nextStock,
          note: `Stock received via ${grnId}.`,
          createdAt: timestamp
        },
        ...prev
      ]);
    }
  };

  const addPurchasePayment = (input: {
    grnId: string;
    supplierName: string;
    amount: number;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque';
    reference: string;
  }) => {
    const paidAt = now();
    const payment: PurchasePayment = {
      id: `pp-${Date.now()}`,
      grnId: input.grnId,
      supplierName: input.supplierName.trim(),
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      paidAt,
      reference: input.reference.trim()
    };

    setPurchasePayments((prev) => [payment, ...prev]);
    setGrnRecords((prev) =>
      prev.map((record) => {
        if (record.id !== input.grnId) {
          return record;
        }
        const paidTotal = purchasePayments
          .filter((entry) => entry.grnId === input.grnId)
          .reduce((sum, entry) => sum + entry.amount, 0) + input.amount;

        return {
          ...record,
          paymentStatus: paidTotal >= record.totalAmount ? 'Paid' : 'Partially Paid'
        };
      })
    );
  };

  const addSiteVisit = (visit: {
    customerId: string;
    designer: string;
    visitDate: string;
    notes: string;
    difficultyRating: 1 | 2 | 3 | 4 | 5;
    attachments: string[];
  }) => {
    const customer = customers.find((entry) => entry.id === visit.customerId);
    if (!customer) {
      return;
    }

    const timestamp = now();
    const siteVisit: SiteVisit = {
      id: `SV-${String(siteVisits.length + 1).padStart(3, '0')}`,
      leadId: visit.customerId,
      customerId: visit.customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      designer: visit.designer.trim(),
      visitDate: new Date(visit.visitDate).toISOString(),
      notes: visit.notes.trim(),
      difficultyRating: visit.difficultyRating,
      attachments: visit.attachments
    };

    setSiteVisits((prev) => [siteVisit, ...prev]);
    setCustomers((prev) =>
      prev.map((entry) =>
        entry.id === visit.customerId
          ? {
              ...entry,
              updatedAt: timestamp,
              history: [
                {
                  id: `hist-${Date.now()}`,
                  timestamp,
                  user: visit.designer.trim(),
                  action: 'Site visit note added',
                  note: visit.notes.trim(),
                  type: 'site-visit',
                  refId: siteVisit.id
                },
                ...entry.history
              ]
            }
          : entry
      )
    );
  };

  const createQuotation = (input: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    items: QuotationItem[];
    discount: number;
    totalAmount: number;
  }) => {
    const timestamp = now();
    const quotation: Quotation = {
      id: `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
      leadId: input.customerId,
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      items: cloneItems(input.items),
      totalAmount: input.totalAmount,
      discount: input.discount,
      status: 'Draft',
      createdAt: timestamp,
      updatedAt: timestamp,
      history: []
    };

    setQuotations((prev) => [quotation, ...prev]);
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === input.customerId
          ? {
              ...customer,
              updatedAt: timestamp,
              quotationIds: [quotation.id, ...customer.quotationIds],
              history: [
                {
                  id: `hist-${Date.now()}`,
                  timestamp,
                  user: currentSalesperson,
                  action: 'Quotation created',
                  note: `Quotation ${quotation.id} created for ${input.customerName}.`,
                  type: 'quotation',
                  refId: quotation.id
                },
                ...customer.history
              ]
            }
          : customer
      )
    );

    return quotation;
  };

  const updateQuotation = (quotationId: string, updates: Partial<Omit<Quotation, 'id' | 'createdAt' | 'history'>>) => {
    const timestamp = now();
    setQuotations((prev) =>
      prev.map((quotation) => {
        if (quotation.id !== quotationId) {
          return quotation;
        }

        const historyEntry: QuotationHistoryEntry = {
          id: `qhist-${Date.now()}`,
          timestamp,
          editor: currentSalesperson,
          note: 'Quotation edited',
          totalAmount: quotation.totalAmount,
          discount: quotation.discount,
          status: quotation.status,
          items: cloneItems(quotation.items)
        };

        return {
          ...quotation,
          ...updates,
          updatedAt: timestamp,
          history: [...quotation.history, historyEntry]
        };
      })
    );
  };

  const deleteQuotation = (quotationId: string) => {
    const quotation = quotations.find((item) => item.id === quotationId);
    if (!quotation) {
      return;
    }

    const relatedInvoiceIds = invoices
      .filter((invoice) => invoice.quotationId === quotationId)
      .map((invoice) => invoice.id);

    setQuotations((prev) => prev.filter((item) => item.id !== quotationId));
    setInvoices((prev) => prev.filter((invoice) => invoice.quotationId !== quotationId));
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === quotation.customerId
          ? {
              ...customer,
              quotationIds: customer.quotationIds.filter((id) => id !== quotationId),
              invoiceIds: customer.invoiceIds.filter((id) => !relatedInvoiceIds.includes(id)),
              history: customer.history.filter(
                (entry) => entry.refId !== quotationId && !relatedInvoiceIds.includes(entry.refId ?? '')
              )
            }
          : customer
      )
    );

    if (selectedQuotationId === quotationId) {
      setSelectedQuotationId('');
    }
    if (relatedInvoiceIds.includes(selectedInvoiceId)) {
      setSelectedInvoiceId('');
    }
  };

  const updateInvoice = (invoiceId: string, updates: Partial<Omit<Invoice, 'id' | 'quotationId' | 'createdAt' | 'history'>>) => {
    const timestamp = now();
    setInvoices((prev) =>
      prev.map((invoice) => {
        if (invoice.id !== invoiceId) {
          return invoice;
        }

        const historyEntry: InvoiceHistoryEntry = {
          id: `ihist-${Date.now()}`,
          timestamp,
          editor: currentSalesperson,
          note: 'Invoice edited',
          subtotal: invoice.subtotal,
          discount: invoice.discount,
          totalAmount: invoice.totalAmount,
          status: invoice.status,
          items: cloneItems(invoice.items)
        };

        return {
          ...invoice,
          ...updates,
          revisionNo: (invoice.revisionNo ?? 1) + 1,
          balanceDue: Math.max(0, (updates.totalAmount ?? invoice.totalAmount) - (updates.advancePaid ?? invoice.advancePaid ?? 0)),
          updatedAt: timestamp,
          history: [...invoice.history, historyEntry]
        };
      })
    );
  };

  const recordAdvancePayment = (invoiceId: string, input: { amount: number; method: 'Cash' | 'Card' | 'Bank Transfer'; reference: string }) => {
    const invoice = invoices.find((entry) => entry.id === invoiceId);
    if (!invoice || input.amount <= 0) {
      return;
    }

    const timestamp = now();
    const payment: AdvancePayment = {
      id: `adv-${Date.now()}`,
      invoiceId,
      amount: input.amount,
      method: input.method,
      reference: input.reference.trim(),
      paidAt: timestamp
    };

    setAdvancePayments((prev) => [payment, ...prev]);
    setInvoices((prev) =>
      prev.map((entry) => {
        if (entry.id !== invoiceId) {
          return entry;
        }
        const nextAdvance = (entry.advancePaid ?? 0) + input.amount;
        return {
          ...entry,
          advancePaid: nextAdvance,
          balanceDue: Math.max(0, entry.totalAmount - nextAdvance),
          updatedAt: timestamp,
          history: [
            ...entry.history,
            {
              id: `ihist-${Date.now()}`,
              timestamp,
              editor: currentSalesperson,
              note: `Advance payment recorded (${input.method}) ref ${input.reference || 'N/A'} for $${input.amount.toFixed(2)}.`,
              subtotal: entry.subtotal,
              discount: entry.discount,
              totalAmount: entry.totalAmount,
              status: entry.status,
              items: cloneItems(entry.items)
            }
          ]
        };
      })
    );
  };

  const sendInvoiceByEmail = (invoiceId: string) => {
    const timestamp = now();
    setInvoices((prev) =>
      prev.map((entry) =>
        entry.id === invoiceId
          ? {
              ...entry,
              updatedAt: timestamp,
              emailLog: [`Sent on ${new Date(timestamp).toLocaleString()}`, ...(entry.emailLog ?? [])]
            }
          : entry
      )
    );
  };

  const downloadInvoicePdf = (invoiceId: string) => {
    const timestamp = now();
    setInvoices((prev) =>
      prev.map((entry) =>
        entry.id === invoiceId
          ? {
              ...entry,
              updatedAt: timestamp,
              printCount: entry.printCount + 1,
              history: [
                ...entry.history,
                {
                  id: `ihist-${Date.now()}`,
                  timestamp,
                  editor: currentSalesperson,
                  note: 'Invoice PDF downloaded',
                  subtotal: entry.subtotal,
                  discount: entry.discount,
                  totalAmount: entry.totalAmount,
                  status: entry.status,
                  items: cloneItems(entry.items)
                }
              ]
            }
          : entry
      )
    );
  };

  const deleteInvoice = (invoiceId: string) => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) {
      return;
    }

    setInvoices((prev) => prev.filter((item) => item.id !== invoiceId));
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === invoice.customerId
          ? {
              ...customer,
              invoiceIds: customer.invoiceIds.filter((id) => id !== invoiceId),
              history: customer.history.filter((entry) => entry.refId !== invoiceId)
            }
          : customer
      )
    );
    setQuotations((prev) =>
      prev.map((quotation) =>
        quotation.id === invoice.quotationId
          ? {
              ...quotation,
              handoverInvoiceId: quotation.handoverInvoiceId === invoiceId ? undefined : quotation.handoverInvoiceId,
              status: quotation.handoverInvoiceId === invoiceId && quotation.status === 'Invoiced' ? 'Sent' : quotation.status
            }
          : quotation
      )
    );

    if (selectedInvoiceId === invoiceId) {
      setSelectedInvoiceId('');
    }
  };

  const deleteCustomer = (customerId: string) => {
    const quotationIdsToDelete = quotations.filter((quotation) => quotation.customerId === customerId).map((item) => item.id);
    const invoiceIdsToDelete = invoices.filter((invoice) => invoice.customerId === customerId).map((item) => item.id);

    setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
    setQuotations((prev) => prev.filter((quotation) => quotation.customerId !== customerId));
    setInvoices((prev) => prev.filter((invoice) => invoice.customerId !== customerId));

    if (selectedCustomerId === customerId) {
      setSelectedCustomerId('');
    }
    if (quotationIdsToDelete.includes(selectedQuotationId)) {
      setSelectedQuotationId('');
    }
    if (invoiceIdsToDelete.includes(selectedInvoiceId)) {
      setSelectedInvoiceId('');
    }
  };

  const handoverQuotationToInvoice = (quotationId: string) => {
    const quotation = quotations.find((item) => item.id === quotationId);
    if (!quotation) {
      return;
    }

    const customer = customers.find((item) => item.id === quotation.customerId);
    const subtotal = quotation.items.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = Math.max(0, subtotal - quotation.discount);
    const existingInvoice = invoices.find((item) => item.quotationId === quotation.id);
    const invoiceId = existingInvoice?.id ?? `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const timestamp = now();

    if (!existingInvoice) {
      const invoice: Invoice = {
        id: invoiceId,
        quotationId: quotation.id,
        customerId: quotation.customerId,
        customerName: quotation.customerName ?? customer?.name ?? 'Customer',
        customerPhone: quotation.customerPhone ?? customer?.phone ?? '',
        items: cloneItems(quotation.items),
        subtotal,
        discount: quotation.discount,
        totalAmount,
        status: 'Draft',
        createdAt: timestamp,
        updatedAt: timestamp,
        history: [],
        printCount: 0,
        revisionNo: 1,
        advancePaid: 0,
        balanceDue: totalAmount,
        emailLog: []
      };

      setInvoices((prev) => [invoice, ...prev]);
    }

    setQuotations((prev) =>
      prev.map((item) =>
        item.id === quotation.id
          ? {
              ...item,
              status: 'Invoiced',
              handoverInvoiceId: invoiceId,
              updatedAt: timestamp,
              history: [
                ...item.history,
                {
                  id: `qhist-${Date.now()}`,
                  timestamp,
                  editor: currentSalesperson,
                  note: 'Quotation handed over to invoice',
                  totalAmount: item.totalAmount,
                  discount: item.discount,
                  status: item.status,
                  items: cloneItems(item.items)
                }
              ]
            }
          : item
      )
    );

    setCustomers((prev) =>
      prev.map((item) =>
        item.id === quotation.customerId
          ? {
              ...item,
              updatedAt: timestamp,
              invoiceIds: item.invoiceIds.includes(invoiceId) ? item.invoiceIds : [invoiceId, ...item.invoiceIds],
              history: [
                {
                  id: `hist-${Date.now()}`,
                  timestamp,
                  user: currentSalesperson,
                  action: 'Invoice created',
                  note: `Invoice ${invoiceId} created from quotation ${quotation.id}.`,
                  type: 'invoice',
                  refId: invoiceId
                },
                ...item.history
              ]
            }
          : item
      )
    );

    setSelectedQuotationId(quotation.id);
    setSelectedInvoiceId(invoiceId);
    setSelectedCustomerId(quotation.customerId);
    setActiveTab('invoices');
    setSidebarOpen(false);
  };

  const openQuotationComposerForCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedQuotationId('');
    setOpenQuotationComposer(true);
    setActiveTab('quotations');
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            customers={customers}
            quotations={quotations}
            selectedCustomerId={selectedCustomerId}
            selectedCustomer={selectedCustomer}
            currentSalesperson={currentSalesperson}
            onSelectCustomer={setSelectedCustomerId}
            onRegisterCustomer={registerCustomer}
            onUpdateCustomer={updateCustomer}
            onAddCallLog={addCallLog}
            onDeleteCallLog={deleteCallLog}
            onDeleteCustomer={deleteCustomer}
            onOpenQuotationComposer={openQuotationComposerForCustomer}
          />
        );
      case 'leads':
        return (
          <Leads
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            currentSalesperson={currentSalesperson}
            salespersonOptions={salespersonOptions}
            onSelectCustomer={setSelectedCustomerId}
            onSetCurrentSalesperson={setCurrentSalesperson}
            onRegisterCustomer={registerCustomer}
            onAddCallLog={addCallLog}
            onDeleteCallLog={deleteCallLog}
            onDeleteCustomer={deleteCustomer}
          />
        );
      case 'inventory':
        return (
          <Inventory
            inventoryItems={inventoryItems}
            grnRecords={grnRecords}
            purchasePayments={purchasePayments}
            stockHistory={stockHistory}
            onRegisterItem={registerInventoryItem}
            onUpdateItemPricing={updateInventoryPricing}
            onCreateGrn={createGrn}
            onAddPurchasePayment={addPurchasePayment}
          />
        );
      case 'quotations':
        return (
          <Quotations
            customers={customers}
            quotations={quotations}
            inventoryItems={inventoryItems}
            selectedCustomerId={selectedCustomerId}
            selectedQuotationId={selectedQuotationId}
            openCreateOnMount={openQuotationComposer}
            onCreateQuotation={createQuotation}
            onUpdateQuotation={updateQuotation}
            onSelectCustomer={setSelectedCustomerId}
            onSelectQuotation={setSelectedQuotationId}
            onRequestInvoice={handoverQuotationToInvoice}
            onDeleteQuotation={deleteQuotation}
            onCloseComposer={() => setOpenQuotationComposer(false)}
          />
        );
      case 'invoices':
        return (
          <Invoices
            customers={customers}
            quotations={quotations}
            invoices={invoices}
            selectedCustomerId={selectedCustomerId}
            selectedQuotationId={selectedQuotationId}
            selectedInvoiceId={selectedInvoiceId}
            onSelectCustomer={setSelectedCustomerId}
            onSelectQuotation={setSelectedQuotationId}
            onSelectInvoice={setSelectedInvoiceId}
            onUpdateInvoice={updateInvoice}
            onPrintInvoice={(invoiceId: string) => setSelectedInvoiceId(invoiceId)}
            onDeleteInvoice={deleteInvoice}
            advancePayments={advancePayments}
            onRecordAdvancePayment={recordAdvancePayment}
            onSendInvoiceByEmail={sendInvoiceByEmail}
            onDownloadInvoicePdf={downloadInvoicePdf}
          />
        );
      case 'site-visits':
        return (
          <SiteVisits
            customers={customers}
            visits={siteVisits}
            onCreateVisit={addSiteVisit}
          />
        );
      case 'user-management':
        return (
          <UserManagement
            users={staffUsers}
            onCreateUser={createStaffUser}
            onDeleteUser={deleteStaffUser}
          />
        );
      case 'settings':
        return <Settings />;
      case 'analyze':
        return <Analyze />;
      default:
        return (
          <Dashboard
            customers={customers}
            quotations={quotations}
            selectedCustomerId={selectedCustomerId}
            selectedCustomer={selectedCustomer}
            currentSalesperson={currentSalesperson}
            onSelectCustomer={setSelectedCustomerId}
            onRegisterCustomer={registerCustomer}
            onUpdateCustomer={updateCustomer}
            onAddCallLog={addCallLog}
            onDeleteCallLog={deleteCallLog}
            onDeleteCustomer={deleteCustomer}
            onOpenQuotationComposer={openQuotationComposerForCustomer}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <Sidebar
          activeTab={activeTab}
          activeUser={currentUser}
          setActiveTab={(tab) => setActiveTabAndCloseSidebar(tab as ActiveTab)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden bg-white border-b border-brand-line px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">CRM Solutions</h1>
          <div className="w-8" />
        </div>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

