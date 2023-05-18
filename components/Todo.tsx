import { type allTodosOutput } from "types";
import { api } from "~/utils/api";
interface Todo {
  todo: allTodosOutput[number];
}
function Todo({ todo }: Todo) {
  const { id, done, text } = todo;
  const trpc = api.useContext();

  // Handling done toggle todo
  const { mutate: doneMutation } = api.todo.toggleTodo.useMutation({
    onMutate: async ({ id, done }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await trpc.todo.getAllTodos.cancel();

      // Snapshot the previous value
      const previousTodos = trpc.todo.getAllTodos.getData();

      // Optimistically update to the new value
      trpc.todo.getAllTodos.setData(undefined, (prev) => {
        if (!prev) return previousTodos;
        return prev.map((t) => {
          if (t.id === id) {
            return { ...t, done: !done };
          }
          return t;
        });
      });

      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    onError: (err, done, context) => {
      alert(err);
      if (!context) return;
      trpc.todo.getAllTodos.setData(undefined, () => context.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.getAllTodos.invalidate();
    },
  });

  // Handling delete todo
  const { mutate: deleteMutation } = api.todo.deleteTodo.useMutation({
    onMutate: async (deleteId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await trpc.todo.getAllTodos.cancel();

      // Snapshot the previous value
      const previousTodos = trpc.todo.getAllTodos.getData();

      // Optimistically update to the new value
      trpc.todo.getAllTodos.setData(undefined, (prev) => {
        if (!prev) return previousTodos;
        return prev.filter((todo) => todo.id !== deleteId);
      });

      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    onError: (err, done, context) => {
      alert(err);
      if (!context) return;
      trpc.todo.getAllTodos.setData(undefined, () => context.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.getAllTodos.invalidate();
    },
  });

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div>
          <input
            id={id}
            checked={done}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            onChange={(e) => {
              doneMutation({ id, done: !e.target.checked });
            }}
          />
        </div>

        <label
          htmlFor={id}
          style={{ textDecorationLine: `${done ? "line-through" : ""}` }}
        >
          {text}
        </label>
      </div>
      <button
        style={{ padding: "4px 7px" }}
        className="w-full rounded-lg bg-blue-700 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
        onClick={() => {
          if (confirm("Are you want to delete this todo?")) {
            deleteMutation(id);
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}

export default Todo;
