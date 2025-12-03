import { defineApp } from "convex/server";
import actionCache from "@convex-dev/action-cache/convex.config";

const app: ReturnType<typeof defineApp> = defineApp();
app.use(actionCache);

export default app;
