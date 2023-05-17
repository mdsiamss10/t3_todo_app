import { api } from "~/utils/api";
import Todo from "./Todo";

function Todos() {
  const { data: todos, isLoading, isError } = api.todo.getAllTodos.useQuery();
  if (isLoading) return <h1>Loading todos 🔃</h1>;
  if (isError) return <h1>Bad Luck 👨‍🦰</h1>;
  return (
    <>
      {todos.length ? (
        <>
          {todos.map((todo) => (
            <>
              <Todo key={todo.id} todo={todo} />
            </>
          ))}
        </>
      ) : (
        <>
          <h1>Create your first todo...</h1>
        </>
      )}
    </>
  );
}

export default Todos;
