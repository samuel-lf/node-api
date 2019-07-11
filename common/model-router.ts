import { Router } from "../common/router";
import * as mongoose from 'mongoose';
import { NotFoundError } from 'restify-errors';

export abstract class ModelRouter<D extends mongoose.Document> extends Router {

    basePath: string;
    pageSize: number = 4;
    constructor(protected model: mongoose.Model<D>) {
        super();
        this.basePath = `/${this.model.collection.name}`;
    }

    protected prepareOne(query: mongoose.DocumentQuery<D, D>): mongoose.DocumentQuery<D, D> {
        return query;
    }

    envelope(document: any): any {
        let resource = Object.assign({ _links: {} }, document.toJSON())
        resource._links.self = `${this.basePath}/${resource._id}`
        return resource;
    }


    envelopeAll(documents: any[], options: any = {}): any {
        const resource: any = {
            _links: {
                self: `${options.url}`
            },
            items: documents
        }
        if (options.page && options.count && options.pageSize) {
            if (options.page > 1) {
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}`
            }
            const remaining = options.count - (options.page * options.pageSize)
            if (remaining > 0) {
                resource._links.next = `${this.basePath}?_page=${options.page + 1}`
            }

        }
        return resource;
    }


    validateId = (req, res, next) => {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            next(new NotFoundError('Documento não encontrado'))
        } else {
            next()
        }
    }

    findAll = (req, res, next) => {
        let page = parseInt(req.query._page || 1);
        page = page > 0 ? page : 1;
        const skip = (page - 1) * this.pageSize
        this.model.count({}).exec().then(count => {
            this.model
                .find()
                .skip(skip)
                .limit(this.pageSize)
                .then(this.renderAll(res, next, { page, count, pageSize: this.pageSize, url: req.url }))
        }).catch(next)
    }

    findById = (req, res, next) => {
        const id = req.params.id;
        this.prepareOne(this.model.findById(id)).then(this.render(res, next)).catch(next)
    }

    save = (req, res, next) => {
        let document = new this.model(req.body);
        document.save().then(this.render(res, next)).catch(next)
    }

    replace = (req, res, next) => {
        const id = req.params.id;
        const options = { runValidators: true, overwrite: true }
        this.model.update({ _id: id }, req.body, options)
            .exec().then((result) => {
                if (result.n) {
                    return this.model.findById(id).exec()
                } else {
                    throw new NotFoundError('Documento não encontrado')
                }
            }).then(this.render(res, next)).catch(next)
    }

    update = (req, res, next) => {
        const id = req.params.id;
        const options = { runValidators: true, new: true }
        this.model.findByIdAndUpdate({ _id: id }, req.body, options)
            .exec().then(this.render(res, next)).catch(next)
    }

    delete = (req, res, next) => {
        const id = req.params.id;
        this.model.remove({ _id: id })
            .exec().then((cmdResult: any) => {
                if (cmdResult.result.n) {
                    res.send(204)
                    return next();
                } else {
                    throw new NotFoundError('Documento não encontrado')
                }
            }).catch(next)
    }
}
