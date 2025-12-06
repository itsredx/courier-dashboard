import { DashboardStats, Delivery, DeliveryStat, Driver, RevenueData, Transaction, Wallet, Dispute, CompanyProfile, PriceTier, DistanceZone, Conversation, ChatMessage } from '../types';

// Mock Data
const MOCK_DRIVERS: Driver[] = [
  { id: 10, name: "Driver Dave", phone: "+2348012345678", status: "active", current_latitude: 6.5244, current_longitude: 3.3792, rating: 4.8 },
  { id: 11, name: "Sarah Speed", phone: "+2348099999999", status: "active", current_latitude: 6.5300, current_longitude: 3.3800, rating: 4.9 },
  { id: 12, name: "Slow Joe", phone: "+2348000000000", status: "suspended", rating: 2.5 },
  { id: 13, name: "Mike Motor", phone: "+2348011111111", status: "offline", rating: 4.5 },
];

const MOCK_DELIVERIES: Delivery[] = [
  { id: 101, pickup_address: "123 Main St, Lagos", dropoff_address: "456 Elm St, Lagos", customer: { id: 5, name: "John Doe" }, driver: MOCK_DRIVERS[0], status: 'in_transit', estimated_price: 1500.00, created_at: "2023-10-25T10:00:00Z" },
  { id: 102, pickup_address: "Shop A, Market Sq", dropoff_address: "Block 5, Estate", customer: { id: 6, name: "Jane Smith" }, driver: null, status: 'pending', estimated_price: 2500.00, created_at: "2023-10-25T11:00:00Z" },
  { id: 103, pickup_address: "Office Tower 1", dropoff_address: "Residential Area", customer: { id: 7, name: "Corp Client" }, driver: MOCK_DRIVERS[1], status: 'delivered', estimated_price: 5000.00, created_at: "2023-10-24T15:00:00Z" },
  { id: 104, pickup_address: "Warehouse B", dropoff_address: "Port Complex", customer: { id: 8, name: "Logistics Inc" }, driver: null, status: 'pending', estimated_price: 12000.00, created_at: "2023-10-25T11:30:00Z" },
  { id: 105, pickup_address: "Restaurant X", dropoff_address: "Apt 2B", customer: { id: 9, name: "Hungry User" }, driver: MOCK_DRIVERS[0], status: 'delivered', estimated_price: 800.00, created_at: "2023-10-24T19:00:00Z" },
];

const MOCK_REVENUE: RevenueData[] = [
  { date: "2023-10-20", revenue: 50000 },
  { date: "2023-10-21", revenue: 45000 },
  { date: "2023-10-22", revenue: 60000 },
  { date: "2023-10-23", revenue: 55000 },
  { date: "2023-10-24", revenue: 75000 },
  { date: "2023-10-25", revenue: 65000 },
];

const MOCK_STATS: DeliveryStat[] = [
  { status: 'delivered', count: 150 },
  { status: 'pending', count: 10 },
  { status: 'in_transit', count: 25 },
  { status: 'cancelled', count: 5 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 501, type: 'credit', amount: 2000.00, description: "Earnings from Delivery #101", date: "2023-10-25T15:00:00Z" },
  { id: 502, type: 'debit', amount: 50000.00, description: "Payout to Bank Account", date: "2023-10-24T09:00:00Z" },
  { id: 503, type: 'credit', amount: 1500.00, description: "Earnings from Delivery #105", date: "2023-10-24T20:00:00Z" },
];

// Dynamic Data (Mutable for session)
let MOCK_PRICE_TIERS: PriceTier[] = [
  { id: 1, name: "Standard", min_weight: 0, max_weight: 5, base_price: 1000, price_per_km: 50 },
  { id: 2, name: "Heavy", min_weight: 5, max_weight: 20, base_price: 2500, price_per_km: 100 },
];

let MOCK_DISTANCE_ZONES: DistanceZone[] = [
  { id: 1, name: "Local", min_distance: 0, max_distance: 5, surcharge_amount: 0, price_multiplier: 1.0 },
  { id: 2, name: "Metro", min_distance: 5, max_distance: 20, surcharge_amount: 500, price_multiplier: 1.2 },
];

// Chat Data
const CURRENT_ADMIN_USER = { id: 999, username: "Admin", type: 'admin' as const };

let MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    participants: [CURRENT_ADMIN_USER, { id: 10, username: "Driver Dave", type: 'rider' }],
    last_message: { content: "I'm arriving at the pickup point.", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unread_count: 1
  },
  {
    id: 2,
    participants: [CURRENT_ADMIN_USER, { id: 5, username: "John Doe", type: 'customer' }],
    last_message: { content: "Where is my package?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unread_count: 0
  }
];

let MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, conversation: 1, sender: { id: 10, username: "Driver Dave" }, content: "Hello admin, starting my shift.", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), is_read: true },
  { id: 2, conversation: 1, sender: CURRENT_ADMIN_USER, content: "Great, stay safe!", timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), is_read: true },
  { id: 3, conversation: 1, sender: { id: 10, username: "Driver Dave" }, content: "I'm arriving at the pickup point.", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), is_read: false },
  
  { id: 4, conversation: 2, sender: { id: 5, username: "John Doe" }, content: "Where is my package?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), is_read: true },
];

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(500);

    // Sort drivers by rating
    const topRated = [...MOCK_DRIVERS]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);
    
    // Mock delivery counts (since real history is limited in mock)
    const topDeliveries = [
        { id: 11, name: "Sarah Speed", count: 245 },
        { id: 10, name: "Driver Dave", count: 189 },
        { id: 13, name: "Mike Motor", count: 134 }
    ];

    return {
      total_deliveries: 120,
      active_deliveries: 5,
      active_drivers: 8,
      total_revenue: 50000.00,
      recent_deliveries: MOCK_DELIVERIES.slice(0, 5),
      top_rated_drivers: topRated,
      top_delivery_drivers: topDeliveries
    };
  },

  getRevenueChart: async (): Promise<RevenueData[]> => {
    await delay(500);
    return MOCK_REVENUE;
  },

  getDeliveryStats: async (): Promise<DeliveryStat[]> => {
    await delay(500);
    return MOCK_STATS;
  },

  getDeliveries: async (statusFilter?: string): Promise<Delivery[]> => {
    await delay(600);
    if (statusFilter && statusFilter !== 'all') {
      return MOCK_DELIVERIES.filter(d => d.status === statusFilter);
    }
    return MOCK_DELIVERIES;
  },

  assignDriver: async (deliveryId: number, driverId: number): Promise<void> => {
    await delay(800);
    const delivery = MOCK_DELIVERIES.find(d => d.id === deliveryId);
    const driver = MOCK_DRIVERS.find(d => d.id === driverId);
    if (delivery && driver) {
      delivery.driver = driver;
      delivery.status = 'assigned';
    }
  },

  getDrivers: async (): Promise<Driver[]> => {
    await delay(500);
    return MOCK_DRIVERS;
  },

  inviteDriver: async (data: { email: string; name: string; phone: string }): Promise<void> => {
    await delay(1000);
    console.log("Invited:", data);
  },

  updateDriverStatus: async (id: number, status: Driver['status']): Promise<void> => {
    await delay(500);
    const driver = MOCK_DRIVERS.find(d => d.id === id);
    if (driver) driver.status = status;
  },

  getWalletBalance: async (): Promise<Wallet> => {
    await delay(400);
    return { balance: 150000.00, currency: "NGN" };
  },

  getTransactions: async (): Promise<Transaction[]> => {
    await delay(600);
    return MOCK_TRANSACTIONS;
  },

  requestPayout: async (amount: number): Promise<void> => {
    await delay(1000);
    console.log("Payout requested:", amount);
  },

  getCompanyProfile: async (): Promise<CompanyProfile> => {
    await delay(300);
    return {
      name: "Logistics Co",
      address: "789 HQ Blvd, Lagos",
      phone: "+234 800 123 4567",
      support_email: "support@logistics.co"
    };
  },

  updateCompanyProfile: async (data: CompanyProfile): Promise<void> => {
    await delay(800);
    console.log("Updated profile:", data);
  },

  getDisputes: async (): Promise<Dispute[]> => {
    await delay(500);
    return [
      {
        id: 1,
        delivery_id: 101,
        reason: "Late Delivery",
        description: "Driver was 2 hours late.",
        status: "open",
        created_at: "2023-10-25T16:00:00Z"
      }
    ];
  },

  // --- Price Tiers ---
  getPriceTiers: async (): Promise<PriceTier[]> => {
    await delay(400);
    return [...MOCK_PRICE_TIERS];
  },

  addPriceTier: async (tier: Omit<PriceTier, 'id'>): Promise<PriceTier> => {
    await delay(600);
    const newTier = { ...tier, id: Date.now() };
    MOCK_PRICE_TIERS.push(newTier);
    return newTier;
  },

  updatePriceTier: async (id: number, tier: Omit<PriceTier, 'id'>): Promise<PriceTier> => {
    await delay(600);
    const index = MOCK_PRICE_TIERS.findIndex(t => t.id === id);
    if (index !== -1) {
      MOCK_PRICE_TIERS[index] = { ...tier, id };
      return MOCK_PRICE_TIERS[index];
    }
    throw new Error("Tier not found");
  },

  deletePriceTier: async (id: number): Promise<void> => {
    await delay(500);
    MOCK_PRICE_TIERS = MOCK_PRICE_TIERS.filter(t => t.id !== id);
  },

  // --- Distance Zones ---
  getDistanceZones: async (): Promise<DistanceZone[]> => {
    await delay(400);
    return [...MOCK_DISTANCE_ZONES];
  },

  addDistanceZone: async (zone: Omit<DistanceZone, 'id'>): Promise<DistanceZone> => {
    await delay(600);
    const newZone = { ...zone, id: Date.now() };
    MOCK_DISTANCE_ZONES.push(newZone);
    return newZone;
  },

  updateDistanceZone: async (id: number, zone: Omit<DistanceZone, 'id'>): Promise<DistanceZone> => {
    await delay(600);
    const index = MOCK_DISTANCE_ZONES.findIndex(z => z.id === id);
    if (index !== -1) {
      MOCK_DISTANCE_ZONES[index] = { ...zone, id };
      return MOCK_DISTANCE_ZONES[index];
    }
    throw new Error("Zone not found");
  },

  deleteDistanceZone: async (id: number): Promise<void> => {
    await delay(500);
    MOCK_DISTANCE_ZONES = MOCK_DISTANCE_ZONES.filter(z => z.id !== id);
  },

  // --- Chat & Conversations ---
  
  getConversations: async (): Promise<Conversation[]> => {
    await delay(400);
    // Sort by updated_at desc
    return [...MOCK_CONVERSATIONS].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  getMessages: async (conversationId: number): Promise<ChatMessage[]> => {
    await delay(300);
    const msgs = MOCK_MESSAGES.filter(m => m.conversation === conversationId);
    
    // Mark as read when fetching
    const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    if (conversation) conversation.unread_count = 0;
    
    return msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  startConversation: async (userId: number): Promise<Conversation> => {
    await delay(500);
    
    // Check if conversation already exists
    const existing = MOCK_CONVERSATIONS.find(c => c.participants.some(p => p.id === userId));
    if (existing) return existing;

    // Find User Details (checking drivers first, then creating generic if not found)
    const driver = MOCK_DRIVERS.find(d => d.id === userId);
    const participant = driver 
      ? { id: driver.id, username: driver.name, type: 'rider' as const }
      : { id: userId, username: `User ${userId}`, type: 'customer' as const };

    const newConv: Conversation = {
      id: Date.now(),
      participants: [CURRENT_ADMIN_USER, participant],
      updated_at: new Date().toISOString(),
      unread_count: 0
    };
    
    MOCK_CONVERSATIONS.push(newConv);
    return newConv;
  },

  sendMessage: async (conversationId: number, content: string): Promise<ChatMessage> => {
    await delay(300);
    const newMessage: ChatMessage = {
      id: Date.now(),
      conversation: conversationId,
      sender: CURRENT_ADMIN_USER,
      content,
      timestamp: new Date().toISOString(),
      is_read: true
    };
    
    MOCK_MESSAGES.push(newMessage);
    
    // Update conversation last message
    const convIndex = MOCK_CONVERSATIONS.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      MOCK_CONVERSATIONS[convIndex].last_message = { content, timestamp: newMessage.timestamp };
      MOCK_CONVERSATIONS[convIndex].updated_at = newMessage.timestamp;
    }

    return newMessage;
  }
};
