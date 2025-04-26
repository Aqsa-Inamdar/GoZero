import { 
  users, type User, type InsertUser,
  items, type Item, type InsertItem,
  chats, type Chat, type InsertChat,
  messages, type Message, type InsertMessage,
  disposalCenters, type DisposalCenter, type InsertDisposalCenter,
  events, type Event, type InsertEvent
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Item operations
  getItem(id: number): Promise<Item | undefined>;
  getItemsByUserId(userId: number): Promise<Item[]>;
  getNearbyItems(latitude: number, longitude: number, radius: number, category?: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, data: Partial<Item>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
  
  // Chat operations
  getChat(id: number): Promise<Chat | undefined>;
  getChatsByUserId(userId: number): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;
  updateChat(id: number, data: Partial<Chat>): Promise<Chat | undefined>;
  
  // Message operations
  getMessagesByChatId(chatId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Disposal center operations
  getDisposalCenter(id: number): Promise<DisposalCenter | undefined>;
  getDisposalCentersByType(type: string): Promise<DisposalCenter[]>;
  getNearbyDisposalCenters(latitude: number, longitude: number, radius: number, type?: string): Promise<DisposalCenter[]>;
  createDisposalCenter(center: InsertDisposalCenter): Promise<DisposalCenter>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getUpcomingEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private items: Map<number, Item>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private disposalCenters: Map<number, DisposalCenter>;
  private events: Map<number, Event>;
  
  private userId: number;
  private itemId: number;
  private chatId: number;
  private messageId: number;
  private centerId: number;
  private eventId: number;

  constructor() {
    this.users = new Map();
    this.items = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.disposalCenters = new Map();
    this.events = new Map();
    
    this.userId = 1;
    this.itemId = 1;
    this.chatId = 1;
    this.messageId = 1;
    this.centerId = 1;
    this.eventId = 1;
    
    // Initialize with sample data
    this.seedDisposalCenters();
    this.seedItems();
    this.seedEvents();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      greenPoints: 0,
      itemsShared: 0,
      itemsRecycled: 0,
      donationsMade: 0,
      co2Saved: 0,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Item operations
  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }
  
  async getItemsByUserId(userId: number): Promise<Item[]> {
    return Array.from(this.items.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async getNearbyItems(latitude: number, longitude: number, radius: number, category?: string): Promise<Item[]> {
    // In a real database, this would use a geospatial query
    // For our in-memory implementation, we'll return items filtered by category
    let filteredItems = Array.from(this.items.values()).filter(
      (item) => item.status === "available"
    );
    
    if (category && category !== "All") {
      filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    return filteredItems;
  }
  
  async createItem(item: InsertItem): Promise<Item> {
    const id = this.itemId++;
    const now = new Date();
    const newItem: Item = {
      ...item,
      id,
      views: 0,
      inquiries: 0,
      createdAt: now
    };
    
    this.items.set(id, newItem);
    
    // Update user stats
    const user = this.users.get(newItem.userId);
    if (user) {
      if (newItem.type === 'donate') {
        user.donationsMade++;
        user.greenPoints += 10; // Award points for donation
      }
      user.itemsShared++;
      this.users.set(user.id, user);
    }
    
    return newItem;
  }
  
  async updateItem(id: number, data: Partial<Item>): Promise<Item | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...data };
    this.items.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteItem(id: number): Promise<boolean> {
    return this.items.delete(id);
  }
  
  // Chat operations
  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }
  
  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      (chat) => chat.userId1 === userId || chat.userId2 === userId
    );
  }
  
  async createChat(chat: InsertChat): Promise<Chat> {
    const id = this.chatId++;
    const now = new Date();
    const newChat: Chat = {
      ...chat,
      id,
      lastMessageAt: now
    };
    
    this.chats.set(id, newChat);
    return newChat;
  }
  
  async updateChat(id: number, data: Partial<Chat>): Promise<Chat | undefined> {
    const chat = this.chats.get(id);
    if (!chat) return undefined;
    
    const updatedChat = { ...chat, ...data };
    this.chats.set(id, updatedChat);
    return updatedChat;
  }
  
  // Message operations
  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.chatId === chatId
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date();
    const newMessage: Message = {
      ...message,
      id,
      createdAt: now
    };
    
    this.messages.set(id, newMessage);
    
    // Update the chat's lastMessageAt
    const chat = this.chats.get(message.chatId);
    if (chat) {
      chat.lastMessageAt = now;
      this.chats.set(chat.id, chat);
    }
    
    return newMessage;
  }
  
  // Disposal center operations
  async getDisposalCenter(id: number): Promise<DisposalCenter | undefined> {
    return this.disposalCenters.get(id);
  }
  
  async getDisposalCentersByType(type: string): Promise<DisposalCenter[]> {
    return Array.from(this.disposalCenters.values()).filter(
      (center) => center.type === type
    );
  }
  
  async getNearbyDisposalCenters(latitude: number, longitude: number, radius: number, type?: string): Promise<DisposalCenter[]> {
    // For our in-memory implementation, we'll return centers filtered by type
    if (type) {
      return Array.from(this.disposalCenters.values()).filter(
        (center) => center.type === type
      );
    }
    
    return Array.from(this.disposalCenters.values());
  }
  
  async createDisposalCenter(center: InsertDisposalCenter): Promise<DisposalCenter> {
    const id = this.centerId++;
    const newCenter: DisposalCenter = {
      ...center,
      id
    };
    
    this.disposalCenters.set(id, newCenter);
    return newCenter;
  }
  
  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values()).filter(
      (event) => event.date > now
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const newEvent: Event = {
      ...event,
      id
    };
    
    this.events.set(id, newEvent);
    return newEvent;
  }
  
  // Seed data
  private seedDisposalCenters() {
    const centers: InsertDisposalCenter[] = [
      {
        name: "GreenTech Recycling Center",
        description: "E-waste recycling center accepting computers, phones, and batteries",
        type: "e-waste",
        address: "123 Green Street",
        latitude: 37.7749,
        longitude: -122.4194,
        openHours: "9AM - 6PM",
        acceptedItems: ["Computers", "Phones", "Batteries"],
        contactInfo: "info@greentech.example.com",
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b"
      },
      {
        name: "EcoElectronics Depot",
        description: "Electronics recycling center specializing in TVs and appliances",
        type: "e-waste",
        address: "456 Eco Avenue",
        latitude: 37.7833,
        longitude: -122.4167,
        openHours: "10AM - 8PM",
        acceptedItems: ["TVs", "Appliances", "Cables"],
        contactInfo: "info@ecoelectronics.example.com",
        image: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a"
      },
      {
        name: "City Recycling Hub",
        description: "General recycling center accepting electronics and metals",
        type: "e-waste",
        address: "789 Recycle Road",
        latitude: 37.7694,
        longitude: -122.4862,
        openHours: "8AM - 5PM",
        acceptedItems: ["All Electronics", "Metals"],
        contactInfo: "info@cityrecycling.example.com",
        image: "https://images.unsplash.com/photo-1567177662154-dfeb4c93b6ae"
      },
      {
        name: "Furniture Donation Center",
        description: "Accepts used furniture for redistribution to those in need",
        type: "furniture",
        address: "101 Donation Drive",
        latitude: 37.7855,
        longitude: -122.4071,
        openHours: "9AM - 4PM",
        acceptedItems: ["Chairs", "Tables", "Sofas", "Desks"],
        contactInfo: "info@furnituredonation.example.com",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc"
      }
    ];
    
    centers.forEach(center => {
      this.createDisposalCenter(center);
    });
    
  }
  
  private seedItems() {
    // Create a demo user for items if there are no users yet
    const createDemoUser = async () => {
      const demoUser = await this.createUser({
        username: "demouser",
        password: "password123",
        name: "Demo User",
        email: "demo@example.com",
        location: "San Francisco, CA",
        profileImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"
      });
      return demoUser;
    };
    
    // Seed items
    const seedItemsForUser = async (userId: number) => {
      const items: InsertItem[] = [
        {
          userId,
          title: "Unused Kitchen Blender",
          description: "Barely used kitchen blender in great condition. Free to a good home.",
          category: "kitchen",
          type: "donate",
          status: "available",
          condition: "like_new",
          quantity: 1,
          images: ["https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=300&fit=crop"],
          tags: ["appliance", "kitchen", "blender"],
          latitude: 37.7749,
          longitude: -122.4194,
          estimatedValue: 50
        },
        {
          userId,
          title: "Office Chair",
          description: "Ergonomic office chair, adjustable height. Minor wear but still very comfortable.",
          category: "furniture",
          type: "sell",
          status: "available",
          condition: "good",
          quantity: 1,
          images: ["https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=400&h=300&fit=crop"],
          tags: ["furniture", "office", "chair"],
          latitude: 37.7749,
          longitude: -122.4194,
          estimatedValue: 75,
          price: 40
        },
        {
          userId,
          title: "Surplus Organic Apples",
          description: "Organic apples from my garden. Too many for me to eat!",
          category: "food",
          type: "donate",
          status: "available",
          condition: "new",
          quantity: 20,
          images: ["https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=400&h=300&fit=crop"],
          tags: ["food", "organic", "fruit"],
          latitude: 37.7749,
          longitude: -122.4194,
          estimatedValue: 15
        },
        {
          userId,
          title: "Unused Paint Cans",
          description: "Leftover paint from home renovation. Various colors, water-based.",
          category: "home_improvement",
          type: "sell",
          status: "available",
          condition: "new",
          quantity: 5,
          images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop"],
          tags: ["paint", "renovation", "home"],
          latitude: 37.7749,
          longitude: -122.4194,
          estimatedValue: 100,
          price: 50
        },
        {
          userId,
          title: "Children's Books",
          description: "Collection of children's books in excellent condition. Suitable for ages 3-8.",
          category: "books",
          type: "donate",
          status: "available",
          condition: "good",
          quantity: 15,
          images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop"],
          tags: ["books", "children", "education"],
          latitude: 37.7749,
          longitude: -122.4194,
          estimatedValue: 60
        }
      ];
      
      for (const item of items) {
        await this.createItem(item);
      }
    };
    
    // Execute seeding asynchronously
    (async () => {
      // Use existing user if available, otherwise create a demo user
      let user = Array.from(this.users.values())[0];
      if (!user) {
        user = await createDemoUser();
      }
      
      await seedItemsForUser(user.id);
    })();
  }
  
  private seedEvents() {
    const events: InsertEvent[] = [
      {
        title: "E-Waste Collection Drive",
        description: "Community center is hosting an electronics recycling event this weekend. Bring your old devices and earn double GreenPoints!",
        type: "collection_drive",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
        location: "City Community Center, 100 Main St",
        latitude: 37.7855,
        longitude: -122.4071,
        greenPointsReward: 20,
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b"
      },
      {
        title: "Neighborhood Clean-up Day",
        description: "Join us for a community clean-up event. We'll provide gloves and bags!",
        type: "cleanup",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Three days from now
        location: "Green Park, West Entrance",
        latitude: 37.7695,
        longitude: -122.4830,
        greenPointsReward: 15,
        image: "https://images.unsplash.com/photo-1567817886411-5d9c509e2b7e?w=800&h=600&fit=crop"
      },
      {
        title: "Furniture Upcycling Workshop",
        description: "Learn how to transform old furniture into beautiful new pieces. Materials provided.",
        type: "workshop",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Two weeks from now
        location: "Design Center, 200 Innovation Blvd",
        latitude: 37.7790,
        longitude: -122.4120,
        greenPointsReward: 10,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"
      }
    ];
    
    events.forEach(event => {
      this.createEvent(event);
    });
  }
}

export const storage = new MemStorage();
