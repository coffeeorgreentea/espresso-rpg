import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { enemyRouter } from "./routers/enemy";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  player: userRouter,
  enemy: enemyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
