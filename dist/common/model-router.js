"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../common/router");
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
        this.pageSize = 4;
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
            let page = parseInt(req.query._page || 1);
            page = page > 0 ? page : 1;
            const skip = (page - 1) * this.pageSize;
            this.model.count({}).exec().then(count => {
                this.model
                    .find()
                    .skip(skip)
                    .limit(this.pageSize)
                    .then(this.renderAll(res, next, { page, count, pageSize: this.pageSize, url: req.url }));
            }).catch(next);
        };
        this.findById = (req, res, next) => {
            const id = req.params.id;
            this.prepareOne(this.model.findById(id)).then(this.render(res, next)).catch(next);
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
        this.basePath = `/${this.model.collection.name}`;
    }
    prepareOne(query) {
        return query;
    }
    envelope(document) {
        let resource = Object.assign({ _links: {} }, document.toJSON());
        resource._links.self = `${this.basePath}/${resource._id}`;
        return resource;
    }
    envelopeAll(documents, options = {}) {
        const resource = {
            _links: {
                self: `${options.url}`
            },
            items: documents
        };
        if (options.page && options.count && options.pageSize) {
            if (options.page > 1) {
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}`;
            }
            const remaining = options.count - (options.page * options.pageSize);
            if (remaining > 0) {
                resource._links.next = `${this.basePath}?_page=${options.page + 1}`;
            }
        }
        return resource;
    }
}
exports.ModelRouter = ModelRouter;
