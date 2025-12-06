export type DeliveryStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';

export interface Customer {
  id: number;
  name: string;
}

export interface Driver {
  id: number;
  name: string;
  phone?: string;
  status: 'active' | 'suspended' | 'offline';
  current_latitude?: number;
  current_longitude?: number;
  rating?: number;
  last_update?: string;
}

export interface Delivery {
  id: number;
  pickup_address: string;
  dropoff_address: string;
  customer: Customer;
  driver?: Driver | null;
  status: DeliveryStatus;
  estimated_price: number;
  created_at: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface DeliveryStat {
  status: DeliveryStatus;
  count: number;
}

export interface DashboardStats {
  total_deliveries: number;
  active_deliveries: number;
  active_drivers: number;
  total_revenue: number;
  recent_deliveries: Delivery[];
  top_rated_drivers: Driver[];
  top_delivery_drivers: { id: number; name: string; count: number }[];
}

export interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export interface Wallet {
  balance: number;
  currency: string;
}

export interface Dispute {
  id: number;
  delivery_id: number;
  reason: string;
  description: string;
  status: 'open' | 'resolved' | 'closed';
  created_at: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  phone: string;
  support_email: string;
}

export interface PriceTier {
  id: number;
  name: string;
  min_weight: number;
  max_weight: number;
  base_price: number;
  price_per_km: number;
}

export interface DistanceZone {
  id: number;
  name: string;
  min_distance: number;
  max_distance: number;
  surcharge_amount: number;
  price_multiplier: number;
}

export interface ChatParticipant {
  username: string;
  id?: number; 
  avatar?: string;
  type?: 'rider' | 'customer' | 'admin';
}

export interface ChatMessage {
  id: number;
  conversation: number;
  sender: ChatParticipant;
  content: string;
  timestamp: string;
  is_read: boolean;
}

export interface Conversation {
  id: number;
  participants: ChatParticipant[];
  last_message?: {
    content: string;
    timestamp: string;
  };
  updated_at: string;
  unread_count?: number;
}
