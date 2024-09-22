import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

import { serverConfig, logger } from './config';
import { Todo, TodoList } from './types/Todo.types';
import { todos } from './data/todo.data';

const packageDefinition = protoLoader.loadSync('./todo.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const todoProto = grpc.loadPackageDefinition(packageDefinition).todoPackage as any;

const server = new grpc.Server();

server.addService(todoProto.TodoService.service, {
    ListTodos: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<TodoList>) => {
        const todoList: TodoList = { todos };
        callback(null, todoList);
    },
    createTodo: (call: grpc.ServerUnaryCall<Todo, Todo>, callback: grpc.sendUnaryData<Todo>) => {
        const incomingNewTodo = call.request;
        todos.push(incomingNewTodo);
        logger.info(`New Todo Added: ${incomingNewTodo}`);
        callback(null, incomingNewTodo);
    },
    getTodo: (call: grpc.ServerUnaryCall<{ id: string; }, Todo>, callback: grpc.sendUnaryData<Todo | grpc.ServiceError>) => {
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

const address = `127.0.0.1:${serverConfig.PORT}`;
server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        logger.error(`Server failed to bind: ${err.message}`);
        return;
    }
    logger.info(`Server started at ${address}`);
});