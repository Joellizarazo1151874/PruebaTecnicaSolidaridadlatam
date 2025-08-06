// Tipos para la aplicación de gestión de licencias

export interface License {
  id: string;
  softwareName: string;
  renewalDate: string; 
  amount: number;
  responsible: string;
  email?: string;
  notes?: string;
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
  createdAt: string;
  updatedAt: string; 
}

export interface LicenseFormData {
  softwareName: string;
  renewalDate: string;
  amount: number;
  responsible: string;
  email: string;
  notes: string;
}

export interface DashboardStats {
  total: number;
  expiring: number;
  expired: number;
}

export interface NotificationConfig {
  enabled: boolean;
  checkInterval: number; 
  reminderDays: number[]; 
}

export interface ToastNotification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface FilterOptions {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'expiring' | 'expired';
} 