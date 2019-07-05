import { User } from './users.model';
import { Router } from "../common/router";
import * as restify from "restify";
import { exec } from 'child_process';

class UsersRouter extends Router {

    constructor(){
        super()
        this.on('beforeRender', document => {
            document.password = undefined;
            //delete document.password
        })
    }

    applyRoutes(application: restify.Server) {

        application.get('/users', (req, res, next) => {
            User.find().then(this.render(res, next));
        })

        application.get('/users/:id', (req, res, next) => {
            const id = req.params.id;
            User.findById(id).then(this.render(res, next))
        });

        application.post('/users/', (req, res, next) => {
            let user = new User(req.body);
            user.save().then(this.render(res, next))
        });

        application.put('/users/:id', (req, res, next) => {
            const id = req.params.id;
            const options = { overwrite: true }
            User.update({ _id: id }, req.body, options)
                .exec().then((result) => {
                    if (result.n) {
                        return User.findById(id).exec()
                    } else {
                        res.send(404)
                    }
                }).then(this.render(res, next))
        });

        application.patch('/users/:id', (req, res, next) => {
            const id = req.params.id;
            const options = { new: true }
            User.findByIdAndUpdate({ _id: id }, req.body, options)
                .exec().then(this.render(res, next))
        });

        application.del('/users/:id', (req, res, next) => {
            const id = req.params.id;
            User.remove({ _id: id })
                .exec().then((cmdResult: any) => {
                    if (cmdResult.result.n) {
                        res.send(204)
                        return next();
                    } else {
                        res.send(404)
                        return next();
                    }
                })
        });

    }
}

export const usersRouter = new UsersRouter();