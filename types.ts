import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
type RouterOutputs = inferRouterOutputs<AppRouter>;
export type allTodosOutput = RouterOutputs["todo"]["getAllTodos"];
