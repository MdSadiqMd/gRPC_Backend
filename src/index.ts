import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition = protoLoader.loadSync('./todo.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const todoProto = grpc.loadPackageDefinition(packageDefinition).todoPackage as any;

interface Todo {
    id: string;
    title: string;
    content: string;
}

const todos: Todo[] = [
    { id: '1', title: 'Todo - 1', content: 'Content - 1' },
    { id: '2', title: 'Todo - 2', content: 'Content - 2' },
    { id: '3', title: 'Todo - 3', content: 'Content - 3' },
];

const server = new grpc.Server();

server.addService(todoProto.TodoService.service, {
    listTodos: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<Todo[]>) => {
        callback(null, todos);
    },
    createTodo: (call: grpc.ServerUnaryCall<Todo, Todo>, callback: grpc.sendUnaryData<Todo>) => {
        const incomingNewTodo = call.request;
        todos.push(incomingNewTodo);
        callback(null, incomingNewTodo);
    },
    getTodo: (call: grpc.ServerUnaryCall<{ id: string; }, Todo[]>, callback: grpc.sendUnaryData<Todo | grpc.ServiceError>) => {
        const todoId = call.request.id;
        const response = todos.filter(todo => todo.id === todoId);
        if (response.length > 0) {
            callback(null, response[0]);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                message: 'Todo not found'
            }, null);
        }
    }
});

const address = '127.0.0.1:50051';
server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error(`Server failed to bind: ${err.message}`);
        return;
    }
    console.log(`Server started at ${address}`);
});