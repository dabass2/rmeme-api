import { SwaggerRouter } from "koa-swagger-decorator";
import { MemeService } from "../services/meme";

const memeRouter = new SwaggerRouter({ prefix: "/meme" });

// Upload a new meme
memeRouter.post("/", MemeService.uploadMemeFromUrl);

// Get a meme by a specific id
memeRouter.get("/:id", MemeService.getMemeById);

// Update a meme by a specific id
memeRouter.put("/:id", MemeService.updateMemeById);

// Delete meme by a specific id
memeRouter.delete("/:id", MemeService.deleteMemeById);

memeRouter.swagger({
  title: "meme",
  description: "CRUD Endpoints for the meme operations",
  version: "2.0.0",
});
memeRouter.mapDir(__dirname);

export { memeRouter };
