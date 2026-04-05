import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const memes = sqliteTable("memes", {
  meme_id: integer("meme_id", { mode: "number" })
    .primaryKey({ autoIncrement: true })
    .notNull(),
  filename: text("filename").notNull(),
  extension: text("extension").notNull(),
  format: text("format").notNull(),
  uploadedBy: integer("uploadedBy", { mode: "number" }).references(
    () => users.user_id,
  ),
  score: integer("score", { mode: "number" }).notNull().default(0),
});
