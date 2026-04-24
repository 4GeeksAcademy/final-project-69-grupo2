export const initialStore=()=>{
  return{
    message: null,
     complejos: [],
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ]
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };
        case 'set_complejos':
      return {
        ...store,
        complejos: action.payload
      };
    case 'add_complejo':
      return {
        ...store,
        complejos: [...store.complejos, action.payload]
      };
    case 'delete_complejo':
      return {
        ...store,
        complejos: store.complejos.filter(c => c.id !== action.payload)
      };
      
    case 'add_task':

      const { id,  color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
    default:
      throw Error('Unknown action.');
  }    
}
