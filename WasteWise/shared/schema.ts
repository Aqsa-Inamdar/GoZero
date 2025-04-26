import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  bio: text("bio"),
  location: text("location"),
  profileImage: text("profile_image"),
  greenPoints: integer("green_points").default(0),
  itemsShared: integer("items_shared").default(0),
  itemsRecycled: integer("items_recycled").default(0),
  donationsMade: integer("donations_made").default(0),
  co2Saved: doublePrecision("co2_saved").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Item model
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(), // 'sell' or 'donate'
  price: doublePrecision("price"),
  images: text("images").array(),
  tags: text("tags").array(),
  location: text("location").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  expiryDate: timestamp("expiry_date"),
  status: text("status").default("available"), // 'available', 'reserved', 'completed'
  views: integer("views").default(0),
  inquiries: integer("inquiries").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat model
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId1: integer("user_id_1").notNull(),
  userId2: integer("user_id_2").notNull(),
  itemId: integer("item_id"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
});

// Message model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// DisposalCenter model
export const disposalCenters = pgTable("disposal_centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'e-waste', 'furniture', 'clothes', etc.
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  openHours: text("open_hours"),
  acceptedItems: text("accepted_items").array(),
  contactInfo: text("contact_info"),
  image: text("image"),
});

// Event model
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'collection_drive', 'workshop', etc.
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  greenPointsReward: integer("green_points_reward"),
  image: text("image"),
});

// Schema insert types
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  greenPoints: true, 
  itemsShared: true, 
  itemsRecycled: true, 
  donationsMade: true,
  co2Saved: true,
  createdAt: true
});

export const insertItemSchema = createInsertSchema(items).omit({ 
  id: true, 
  views: true, 
  inquiries: true, 
  createdAt: true 
});

export const insertChatSchema = createInsertSchema(chats).omit({ 
  id: true, 
  lastMessageAt: true 
});

export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true, 
  createdAt: true 
});

export const insertDisposalCenterSchema = createInsertSchema(disposalCenters).omit({ 
  id: true 
});

export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true 
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type DisposalCenter = typeof disposalCenters.$inferSelect;
export type InsertDisposalCenter = z.infer<typeof insertDisposalCenterSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
