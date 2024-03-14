"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memes = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const users_1 = require("./users");
exports.memes = (0, mysql_core_1.mysqlTable)("memes", {
    meme_id: (0, mysql_core_1.int)("meme_id").primaryKey().notNull().autoincrement(),
    filename: (0, mysql_core_1.varchar)("filename", { length: 255 }).notNull(),
    extension: (0, mysql_core_1.varchar)("extension", { length: 255 }).notNull(),
    format: (0, mysql_core_1.varchar)("format", { length: 255 }).notNull(),
    uploadedBy: (0, mysql_core_1.int)("uploadedBy").references(() => users_1.users.user_id),
    score: (0, mysql_core_1.int)("score").notNull().default(0),
});
