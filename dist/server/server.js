"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enviroment_1 = require("./../common/enviroment");
const restify = require("restify");
class Server {
    initRoutes(routers) {
        return new Promise((resolve, reject) => {
            try {
                this.application = restify.createServer({
                    name: 'meat-api',
                    version: '1.0.0'
                });
                this.application.use(restify.plugins.queryParser());
                //routes
                for (const router of routers) {
                    router.applyRoutes(this.application);
                }
                this.application.listen(enviroment_1.environment.server.port, () => {
                    resolve(this.application);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    bootstrap(routers = []) {
        return this.initRoutes(routers).then(() => this);
    }
}
exports.Server = Server;
