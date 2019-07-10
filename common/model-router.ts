import { Router } from "../common/router";
import * as mongoose from 'mongoose';
import { NotFoundError } from 'restify-errors';

export abstract class ModelRouter<D extends mongoose.Document> extends Router {
    constructor(protected model: mongoose.Model<D>) {
        super();
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
        this.model.find().then(this.renderAll(res, next)).catch(next)
    }

    findById = (req, res, next) => {
        const id = req.params.id;
        this.model.findById(id).then(this.render(res, next))
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
