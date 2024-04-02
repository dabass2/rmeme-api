import { memes } from "./../db/schema/memes";
import {
  Context,
  body,
  path,
  request,
  responsesAll,
  summary,
  tagsAll,
} from "koa-swagger-decorator";
import { db } from "..";
import { desc, eq, sql } from "drizzle-orm";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";

@responsesAll({
  200: { description: "success" },
  400: { description: "bad request" },
  500: { description: "server error" },
})
@tagsAll(["meme"])
export class MemeService {
  @request("post", "/")
  @summary("Uploads a new meme")
  @body({
    url: { type: "string", description: "URL of the file to upload" },
  })
  static async uploadMemeFromUrl(ctx: Context) {
    const body = ctx.request.body as { url: string };
    const url = body.url;

    const PICTURE_EXTENSIONS = ["png", "jpg", "jpeg", "apng", "webp"];
    const VIDEO_EXTENSIONS = ["mp4", "webm", "mov"];
    const GIF_EXTENSIONS = ["gif"];

    const fileExt = url.split(".").pop()?.split("?")[0].trim();

    if (!fileExt) {
      ctx.status = 400;
      ctx.body = {
        message: `Failed to get extension of file from url: ${url}`,
      };
      return;
    }

    const IS_IMAGE = PICTURE_EXTENSIONS.includes(fileExt);
    const IS_VIDEO = VIDEO_EXTENSIONS.includes(fileExt);
    const IS_GIF = GIF_EXTENSIONS.includes(fileExt);

    if (!IS_IMAGE && !IS_VIDEO && !IS_GIF) {
      ctx.status = 400;
      ctx.body = { message: `Unallowed file format '${fileExt}' provided` };
      return;
    }

    let memeFmt = "unknown";
    if (IS_IMAGE) memeFmt = "image";
    if (IS_VIDEO) memeFmt = "video";
    if (IS_GIF) memeFmt = "gif";

    const filename = randomUUID();

    const fileResponse = await fetch(url);
    const buff = Buffer.from(await fileResponse.arrayBuffer());
    await writeFile(
      `${process.env.FILE_STORE_BASE_PATH}/${filename}.${fileExt}`,
      buff
    );

    const newMeme = {
      filename: filename,
      extension: fileExt,
      format: memeFmt,
      uploadedBy: 1,
      score: 0,
    } as typeof memes.$inferInsert;
    const response = await db.insert(memes).values(newMeme);

    if (!response || !response[0]) {
      ctx.status = 500;
      ctx.body = { message: "Error when uploading meme" };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      url: `${process.env.HOSTED_FILE_BASE_PATH}/${filename}.${fileExt}`,
      meme_id: response[0].insertId,
      ...newMeme,
    };
  }

  @request("get", "/:id")
  @summary("Gets a specific meme by ID")
  @path({
    id: {
      type: "number",
      required: "true",
      description: "ID of the meme to get",
    },
  })
  static async getMemeById(ctx: Context) {
    let meme_id = Number(ctx.params.id);

    if (meme_id < 0) {
      const max_query = await db
        .select({ max_id: memes.meme_id })
        .from(memes)
        .orderBy(desc(memes.meme_id))
        .limit(1);

      const { max_id } = max_query[0];
      console.log(max_id);
      if (max_id != undefined) {
        meme_id = max_id + meme_id;
      } else {
        throw new Error("Failed getting max query");
      }
    }

    const response = await db
      .select()
      .from(memes)
      .where(eq(memes.meme_id, meme_id));

    if (!response) {
      ctx.status = 500;
      ctx.body = { message: "Error when getting meme by ID." };
      return;
    }

    if (!response.length) {
      ctx.status = 404;
      ctx.body = { message: `No meme with id ${meme_id} found.` };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      url: `${process.env.HOSTED_FILE_BASE_PATH}/${response[0].filename}.${response[0].extension}`,
      ...response[0],
    };
  }

  @request("put", "/:id")
  @summary("Updates a meme by id")
  @path({
    id: {
      type: "number",
      required: "true",
      description: "ID of the meme to update",
    },
  })
  @body({
    votes: {
      type: "number",
      required: "true",
      description: "The votes to apply to the meme",
    },
  })
  static async updateMemeById(ctx: Context) {
    const meme_id = Number(ctx.params.id);
    const reqBody = ctx.request.body as { votes: number };
    const votes = reqBody.votes;

    const response = await db
      .update(memes)
      .set({ score: sql`${memes.score} + ${votes}` })
      .where(eq(memes.meme_id, meme_id));

    if (!response || !response[0].affectedRows) {
      ctx.status = 500;
      ctx.body = { message: "Failed to update score of meme" };
      return;
    }

    const updatedRowRes = await db
      .select()
      .from(memes)
      .where(eq(memes.meme_id, meme_id));

    if (!response || !response[0]) {
      ctx.status = 500;
      ctx.body = { message: "Failed to get updated row" };
      return;
    }

    const updatedRow = updatedRowRes[0];
    ctx.status = 200;
    ctx.body = {
      message: `Updated score for meme ${meme_id}`,
      meme_id: updatedRow.meme_id,
      score: updatedRow.score,
    };
  }

  @request("delete", "/:id")
  @summary("Deletes a meme by id")
  @path({
    id: {
      type: "number",
      required: "true",
      description: "ID of the meme to delete",
    },
  })
  static async deleteMemeById(ctx: Context) {
    const meme_id = Number(ctx.params.id);

    const response = await db.delete(memes).where(eq(memes.meme_id, meme_id));

    if (!response || !response[0]) {
      ctx.status = 500;
      ctx.body = { message: `Failed to delete meme with id: ${meme_id}` };
      return;
    }

    ctx.status = 200;
    ctx.body = { message: `Deleted meme with id: ${meme_id}` };
  }
}
