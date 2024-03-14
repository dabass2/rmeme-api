import { SwaggerRouter } from "koa-swagger-decorator";
import { RmemeService } from "../services/rmeme";

const rmemeRouter = new SwaggerRouter({ prefix: "/rmeme" });

// Gets a completely random meme
rmemeRouter.get("/", RmemeService.getRandomMeme);

rmemeRouter.swagger({ title: "rmeme", version: "2.0.0" });
rmemeRouter.mapDir(__dirname);

export { rmemeRouter };
