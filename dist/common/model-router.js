"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../common/router");
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
        this.validateId = (req, res, next) => {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                next(new restify_errors_1.NotFoundError('Documento não encontrado'));
            }
            else {
                next();
            }
        };
        this.findAll = (req, res, next) => {
            this.model.find().then(this.renderAll(res, next)).catch(next);
        };
        this.findById = (req, res, next) => {
            const id = req.params.id;
            this.model.findById(id).then(this.render(res, next));
        };
        this.save = (req, res, next) => {
            let document = new this.model(req.body);
            document.save().then(this.render(res, next)).catch(next);
        };
        this.replace = (req, res, next) => {
            const id = req.params.id;
            const options = { runValidators: true, overwrite: true };
            this.model.update({ _id: id }, req.body, options)
                .exec().then((result) => {
                if (result.n) {
                    return this.model.findById(id).exec();
                }
                else {
                    throw new restify_errors_1.NotFoundError('Documento não encontrado');
                }
            }).then(this.render(res, next)).catch(next);
        };
        this.update = (req, res, next) => {
            const id = req.params.id;
            const options = { runValidators: true, new: true };
            this.model.findByIdAndUpdate({ _id: id }, req.body, options)
                .exec().then(this.render(res, next)).catch(next);
        };
        this.delete = (req, res, next) => {
            const id = req.params.id;
            this.model.remove({ _id: id })
                .exec().then((cmdResult) => {
                if (cmdResult.result.n) {
                    res.send(204);
                    return next();
                }
                else {
                    throw new restify_errors_1.NotFoundError('Documento não encontrado');
                }
            }).catch(next);
        };
    }
}
exports.ModelRouter = ModelRouter;
