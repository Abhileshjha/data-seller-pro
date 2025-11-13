// Customer Purchase Tracking Service
// Stores customer data in localStorage for demo purposes
// In production, this would be a real backend API

export interface CustomerPurchase {
  id: string;
  timestamp: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productId: number;
  productName: string;
  amount: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentId?: string;
  orderId?: string;
}

export interface CustomerLead {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  productInterest?: number;
  status: 'lead' | 'payment_initiated' | 'purchased';
}

const STORAGE_KEYS = {
  PURCHASES: 'customer_purchases',
  LEADS: 'customer_leads'
};

// Purchase Tracking Functions
export const savePurchase = (purchase: Omit<CustomerPurchase, 'id' | 'timestamp'>): CustomerPurchase => {
  const purchases = getAllPurchases();
  const newPurchase: CustomerPurchase = {
    ...purchase,
    id: `PURCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  purchases.push(newPurchase);
  localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  return newPurchase;
};

export const getAllPurchases = (): CustomerPurchase[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
  return data ? JSON.parse(data) : [];
};

export const updatePurchaseStatus = (
  purchaseId: string, 
  status: 'success' | 'failed', 
  paymentId?: string
): void => {
  const purchases = getAllPurchases();
  const index = purchases.findIndex(p => p.id === purchaseId);
  if (index !== -1) {
    purchases[index].paymentStatus = status;
    if (paymentId) {
      purchases[index].paymentId = paymentId;
    }
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }
};

// Lead Tracking Functions
export const saveLead = (lead: Omit<CustomerLead, 'id' | 'timestamp'>): CustomerLead => {
  const leads = getAllLeads();
  const newLead: CustomerLead = {
    ...lead,
    id: `LEAD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  leads.push(newLead);
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  return newLead;
};

export const getAllLeads = (): CustomerLead[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LEADS);
  return data ? JSON.parse(data) : [];
};

export const updateLeadStatus = (
  leadId: string, 
  status: CustomerLead['status']
): void => {
  const leads = getAllLeads();
  const index = leads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    leads[index].status = status;
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  }
};

// Analytics Functions
export const getAnalytics = () => {
  const purchases = getAllPurchases();
  const leads = getAllLeads();

  const successfulPurchases = purchases.filter(p => p.paymentStatus === 'success');
  const totalRevenue = successfulPurchases.reduce((sum, p) => sum + p.amount, 0);
  
  const productSales = successfulPurchases.reduce((acc, p) => {
    acc[p.productId] = (acc[p.productId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const recentPurchases = purchases
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const recentLeads = leads
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return {
    totalPurchases: purchases.length,
    successfulPurchases: successfulPurchases.length,
    failedPurchases: purchases.filter(p => p.paymentStatus === 'failed').length,
    pendingPurchases: purchases.filter(p => p.paymentStatus === 'pending').length,
    totalRevenue,
    totalLeads: leads.length,
    productSales,
    recentPurchases,
    recentLeads,
    conversionRate: leads.length > 0 ? ((successfulPurchases.length / leads.length) * 100).toFixed(2) : '0'
  };
};

// Export Data as CSV
export const exportPurchasesCSV = (): string => {
  const purchases = getAllPurchases();
  const headers = ['Purchase ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Product', 'Amount', 'Status', 'Payment ID'];
  const rows = purchases.map(p => [
    p.id,
    new Date(p.timestamp).toLocaleString(),
    p.customerName,
    p.customerEmail,
    p.customerPhone,
    p.productName,
    `₹${p.amount}`,
    p.paymentStatus,
    p.paymentId || 'N/A'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const exportLeadsCSV = (): string => {
  const leads = getAllLeads();
  const headers = ['Lead ID', 'Date', 'Name', 'Email', 'Phone', 'Product Interest', 'Status'];
  const rows = leads.map(l => [
    l.id,
    new Date(l.timestamp).toLocaleString(),
    l.name,
    l.email,
    l.phone,
    l.productInterest?.toString() || 'N/A',
    l.status
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

// Clear all data (for testing)
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PURCHASES);
  localStorage.removeItem(STORAGE_KEYS.LEADS);
};
