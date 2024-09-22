export interface Todo {
    id: string;
    title: string;
    content: string;
}

export interface TodoList {
    todos: Todo[];
}