import {
  Context,
  request,
  responsesAll,
  summary,
  tagsAll,
} from "koa-swagger-decorator";
import { db } from "..";
import { sql } from "drizzle-orm";
import { memes } from "../db/schema/memes";

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
      .select()
      .from(memes)
      .orderBy(sql`RAND()`)
      .limit(1);

    if (result || !result[0]) {
      ctx.status = 500;
      ctx.body = { message: "Failed to get random meme" };
    }

    ctx.status = 200;
    ctx.body = {
      ...result[0],
      url: `${process.env.HOSTED_FILE_BASE_PATH}/${result[0].filename}.${result[0].extension}`,
    };
  }
}
