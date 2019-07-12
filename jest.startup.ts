import * as jestCli from 'jest-cli';
import * as request from 'supertest';
import { Server } from './server/server';
import { User } from './users/users.model';
import { usersRouter } from './users/users.router';
import { environment } from './common/enviroment';
import { reviewsRouter } from './reviews/reviews.router';
import { Review } from './reviews/reviews.model';



let server: Server
const beforeAllTest = () => {
    environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db'
    environment.server.port = process.env.SERVER_PORT || 3001;
    server = new Server()
    return server.bootstrap([usersRouter, reviewsRouter])
        .then(() => User.remove({}).exec())
        .then(() => Review.remove({}).exec())
}

const afterAllTest = () => {
    return server.shutdown();
}

beforeAllTest()
    .then(() => jestCli.run())
    .then(() => afterAllTest())
    .catch(console.error)