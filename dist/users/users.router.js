"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_model_1 = require("./users.model");
const router_1 = require("../common/router");
class UsersRouter extends router_1.Router {
    constructor() {
        super();
        this.on('beforeRender', document => {
            document.password = undefined;
            //delete document.password
        });
    }
    applyRoutes(application) {
        application.get('/users', (req, res, next) => {
            users_model_1.User.find().then(this.render(res, next));
        });
        application.get('/users/:id', (req, res, next) => {
            const id = req.params.id;
            users_model_1.User.findById(id).then(this.render(res, next));
        });
        application.post('/users/', (req, res, next) => {
            let user = new users_model_1.User(req.body);
            user.save().then(this.render(res, next));
        });
        application.put('/users/:id', (req, res, next) => {
            const id = req.params.id;
            const options = { overwrite: true };
            users_model_1.User.update({ _id: id }, req.body, options)
                .exec().then((result) => {
                if (result.n) {
                    return users_model_1.User.findById(id).exec();
                }
                else {
                    res.send(404);
                }
            }).then(this.render(res, next));
        });
        application.patch('/users/:id', (req, res, next) => {
            const id = req.params.id;
            const options = { new: true };
            users_model_1.User.findByIdAndUpdate({ _id: id }, req.body, options)
                .exec().then(this.render(res, next));
        });
        application.del('/users/:id', (req, res, next) => {
            const id = req.params.id;
            users_model_1.User.remove({ _id: id })
                .exec().then((cmdResult) => {
                if (cmdResult.result.n) {
                    res.send(204);
                    return next();
                }
                else {
                    res.send(404);
                    return next();
                }
            });
        });
    }
}
exports.usersRouter = new UsersRouter();
