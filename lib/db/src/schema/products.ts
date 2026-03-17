import {
  pgTable,
  serial,
  text,
  doublePrecision,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  originalPrice: doublePrecision("original_price"),
  category: text("category").notNull(),
  image: text("image").notNull(),
  images: jsonb("images").notNull().$type<string[]>().default([]),
  stock: integer("stock").notNull().default(0),
  rating: doublePrecision("rating").notNull().default(0),
  numReviews: integer("num_reviews").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  tags: jsonb("tags").notNull().$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
