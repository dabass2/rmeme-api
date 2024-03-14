import { Context, SwaggerRouter } from "koa-swagger-decorator";

const healthRouter = new SwaggerRouter({ prefix: "/health" });

// App health check endpoint
healthRouter.get("/", (ctx: Context) => {
  ctx.status = 200;
  ctx.body = "APP UP";
});

export { healthRouter };
