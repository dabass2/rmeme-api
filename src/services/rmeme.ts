import {
  Context,
  request,
  responsesAll,
  summary,
  tagsAll,
} from "koa-swagger-decorator";
import { db } from "..";
import { count, eq, sql } from "drizzle-orm";
import { memes } from "../db/schema/memes";
import { meme_tags } from "../db/schema/meme_tags";

@responsesAll({
  200: { description: "success" },
  400: { description: "bad request" },
  500: { description: "server error" },
})
@tagsAll(["rmeme"])
export class RmemeService {
  @request("get", "/")
  @summary("Get a random meme")
  static async getRandomMeme(ctx: Context) {
    // tHIs isNT pERfoRMAnT
    const result = await db
      .select({
        meme_id: memes.meme_id,
        filename: memes.filename,
        extension: memes.extension,
        format: memes.format,
        score: memes.score,
        tags: sql<string | null>`(select GROUP_CONCAT(${
          meme_tags.tag
        }) from ${meme_tags} where ${eq(meme_tags.meme_id, memes.meme_id)})`,
      })
      .from(memes)
      .orderBy(sql`RAND()`)
      .limit(1);

    if (!result || !result[0]) {
      ctx.status = 500;
      ctx.body = { message: "Failed to get random meme" };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      ...result[0],
      url: `${process.env.HOSTED_FILE_BASE_PATH}/${result[0].filename}.${result[0].extension}`,
    };
  }

  @request("get", "/total")
  @summary("Get total amount of memes")
  static async getTotalMemes(ctx: Context) {
    const response = await db.select({ value: count() }).from(memes);

    if (!response || !response.length) {
      ctx.status = 500;
      ctx.body = { message: "Failed to get total number of memes" };
      return;
    }

    ctx.status = 200;
    ctx.body = { total: response[0].value };
  }
}
