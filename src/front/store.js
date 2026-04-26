const readStoredUser = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser || storedUser === "undefined" || storedUser === "null") {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const initialStore = () => {
  const token = localStorage.getItem("access_token");
  const user = readStoredUser();

  return {
    message: null,
    complejos: [],
    auth: {
      token: token && token !== "undefined" && token !== "null" ? token : null,
      user,
      isAuthenticated: Boolean(
        token && token !== "undefined" && token !== "null",
      ),
    },
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };
    case "set_complejos":
      return {
        ...store,
        complejos: action.payload,
      };
    case "add_complejo":
      return {
        ...store,
        complejos: [...store.complejos, action.payload],
      };
    case "delete_complejo":
      return {
        ...store,
        complejos: store.complejos.filter((c) => c.id !== action.payload),
      };

    case "add_task":

    case "set_auth": {
      const { token, user } = action.payload || {};

      return {
        ...store,
        auth: {
          token: token || null,
          user: user || null,
          isAuthenticated: Boolean(token),
        },
      };
    }

    case "clear_auth":
      return {
        ...store,
        auth: {
          token: null,
          user: null,
          isAuthenticated: false,
        },
      };

    case "add_task":
      const { id, color } = action.payload;

      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo,
        ),
      };
    default:
      throw Error("Unknown action.");
  }
}
