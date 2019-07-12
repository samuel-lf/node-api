"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jestCli = require("jest-cli");
const server_1 = require("./server/server");
const users_model_1 = require("./users/users.model");
const users_router_1 = require("./users/users.router");
const enviroment_1 = require("./common/enviroment");
const reviews_router_1 = require("./reviews/reviews.router");
const reviews_model_1 = require("./reviews/reviews.model");
let server;
const beforeAllTest = () => {
    enviroment_1.environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db';
    enviroment_1.environment.server.port = process.env.SERVER_PORT || 3001;
    server = new server_1.Server();
    return server.bootstrap([users_router_1.usersRouter, reviews_router_1.reviewsRouter])
        .then(() => users_model_1.User.remove({}).exec())
        .then(() => reviews_model_1.Review.remove({}).exec());
};
const afterAllTest = () => {
    return server.shutdown();
};
beforeAllTest()
    .then(() => jestCli.run())
    .then(() => afterAllTest())
    .catch(console.error);
