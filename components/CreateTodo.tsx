import { useState, type FormEvent } from "react";
import { api } from "~/utils/api";

function CreateTodo() {
  const [todoText, setTodoText] = useState("");
  const trpc = api.useContext();

  // Handling create todo
  const { mutate: createMutation } = api.todo.createTodos.useMutation({
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await trpc.todo.getAllTodos.cancel();

      // Snapshot the previous value
      const previousTodos = trpc.todo.getAllTodos.getData();

      // Optimistically update to the new value
      trpc.todo.getAllTodos.setData(undefined, (prev) => {
        const optimisticTodo = {
          id: "optimistic-todo-id",
          text: newTodo,
          done: false,
        };
        if (!prev) return [optimisticTodo];
        return [...prev, optimisticTodo];
      });

      // Clear input
      setTodoText("");

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
  const handleCreateTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!todoText.length) return;
    createMutation(todoText);
    setTodoText("");
  };

  return (
    <div>
      <form onSubmit={handleCreateTodo} className="flex gap-2">
        <input
          style={{ padding: "5px 10px", color: "black" }}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="New Todo..."
          type="text"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
        />
        <button className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto">
          Create
        </button>
      </form>
    </div>
  );
}

export default CreateTodo;
