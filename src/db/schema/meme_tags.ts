import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { memes } from "./memes";

export const meme_tags = sqliteTable("meme_tags", {
  tag_id: integer("tag_id", { mode: "number" })
    .primaryKey({ autoIncrement: true })
    .notNull(),
  tag: text("tag").notNull(),
  meme_id: integer("meme_id", { mode: "number" }).references(
    () => memes.meme_id,
  ),
});
