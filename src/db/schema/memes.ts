import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { users } from "./users";

export const memes = mysqlTable("memes", {
  meme_id: int("meme_id").primaryKey().notNull().autoincrement(),
  filename: varchar("filename", { length: 255 }).notNull(),
  extension: varchar("extension", { length: 255 }).notNull(),
  format: varchar("format", { length: 255 }).notNull(),
  uploadedBy: int("uploadedBy").references(() => users.user_id),
  score: int("score").notNull().default(0),
});
