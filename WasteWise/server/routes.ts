import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertItemSchema, insertMessageSchema, insertChatSchema } from "@shared/schema";
import { z } from "zod";

// Types for session management
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Set user ID in session
      req.session.userId = newUser.id;
      
      // Don't return password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error registering user" });
    }
  });
  
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user ID in session
      req.session.userId = user.id;
      
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  });
  
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/user", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user" });
    }
  });
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user" });
    }
  });
  
  // Item routes
  app.post("/api/items", isAuthenticated, async (req, res) => {
    try {
      const itemData = insertItemSchema.parse(req.body);
      const newItem = await storage.createItem(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating item" });
    }
  });
  
  app.get("/api/items", async (req, res) => {
    try {
      const latitude = parseFloat(req.query.latitude as string) || 0;
      const longitude = parseFloat(req.query.longitude as string) || 0;
      const radius = parseFloat(req.query.radius as string) || 5; // Default 5km
      const category = req.query.category as string;
      
      const items = await storage.getNearbyItems(latitude, longitude, radius, category);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving items" });
    }
  });
  
  app.get("/api/items/:id", async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Increment view count
      const updatedItem = await storage.updateItem(itemId, { views: (item.views || 0) + 1 });
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving item" });
    }
  });
  
  app.get("/api/users/:userId/items", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const items = await storage.getItemsByUserId(userId);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user items" });
    }
  });
  
  // Chat routes
  app.post("/api/chats", isAuthenticated, async (req, res) => {
    try {
      const chatData = insertChatSchema.parse(req.body);
      
      // Check if a chat already exists between these users for this item
      const existingChats = await storage.getChatsByUserId(chatData.userId1);
      const existingChat = existingChats.find(
        chat => (chat.userId1 === chatData.userId1 && chat.userId2 === chatData.userId2) || 
                (chat.userId1 === chatData.userId2 && chat.userId2 === chatData.userId1)
      );
      
      if (existingChat) {
        return res.status(200).json(existingChat);
      }
      
      const newChat = await storage.createChat(chatData);
      
      // Update item inquiries count if itemId is provided
      if (chatData.itemId) {
        const item = await storage.getItem(chatData.itemId);
        if (item) {
          await storage.updateItem(chatData.itemId, { inquiries: (item.inquiries || 0) + 1 });
        }
      }
      
      res.status(201).json(newChat);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating chat" });
    }
  });
  
  app.get("/api/users/:userId/chats", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const chats = await storage.getChatsByUserId(userId);
      
      // Get last message and other user for each chat
      const enrichedChats = await Promise.all(chats.map(async (chat) => {
        const messages = await storage.getMessagesByChatId(chat.id);
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        
        const otherUserId = chat.userId1 === userId ? chat.userId2 : chat.userId1;
        const otherUser = await storage.getUser(otherUserId);
        
        let item = null;
        if (chat.itemId) {
          item = await storage.getItem(chat.itemId);
        }
        
        return {
          ...chat,
          lastMessage,
          otherUser: otherUser ? {
            id: otherUser.id,
            name: otherUser.name,
            profileImage: otherUser.profileImage
          } : null,
          item: item ? {
            id: item.id,
            title: item.title,
            images: item.images
          } : null
        };
      }));
      
      // Sort by last message time, most recent first
      enrichedChats.sort((a, b) => {
        const aTime = a.lastMessageAt ? a.lastMessageAt.getTime() : 0;
        const bTime = b.lastMessageAt ? b.lastMessageAt.getTime() : 0;
        return bTime - aTime;
      });
      
      res.status(200).json(enrichedChats);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving chats" });
    }
  });
  
  // Message routes
  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const newMessage = await storage.createMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating message" });
    }
  });
  
  app.get("/api/chats/:chatId/messages", isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const messages = await storage.getMessagesByChatId(chatId);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving messages" });
    }
  });
  
  // Disposal center routes
  app.get("/api/disposal-centers", async (req, res) => {
    try {
      const type = req.query.type as string;
      const latitude = parseFloat(req.query.latitude as string) || 0;
      const longitude = parseFloat(req.query.longitude as string) || 0;
      const radius = parseFloat(req.query.radius as string) || 5; // Default 5km
      
      const centers = await storage.getNearbyDisposalCenters(latitude, longitude, radius, type);
      res.status(200).json(centers);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving disposal centers" });
    }
  });
  
  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getUpcomingEvents();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving events" });
    }
  });

  return httpServer;
}
