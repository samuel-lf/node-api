"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model-router");
const restaurants_model_1 = require("./restaurants.model");
const restify_errors_1 = require("restify-errors");
class RestaurantsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(restaurants_model_1.Restaurant);
        this.findMenu = (req, res, next) => {
            const id = req.params.id;
            restaurants_model_1.Restaurant.findById(id, "+menu").then((rest) => {
                if (!rest) {
                    throw new restify_errors_1.NotFoundError('Restaurante não encontrado');
                }
                else {
                    res.json(res.menu);
                    return next();
                }
            }).catch(next);
        };
        this.replaceMenu = (req, res, next) => {
            const id = req.params.id;
            restaurants_model_1.Restaurant.findById(id).then((rest) => {
                if (!rest) {
                    throw new restify_errors_1.NotFoundError('Restaurante não encontrado');
                }
                else {
                    rest.menu = req.body;
                    return rest.save();
                }
            }).then(rest => {
                res.json(rest.menu);
                return next();
            }).catch(next);
        };
    }
    applyRoutes(application) {
        application.get('/restaurants', this.findAll);
        application.get('/restaurants/:id', [this.validateId, this.findById]);
        application.post('/restaurants/', this.save);
        application.put('/restaurants/:id', [this.validateId, this.replace]);
        application.patch('/restaurants/:id', [this.validateId, this.update]);
        application.del('/restaurants/:id', [this.validateId, this.delete]);
        application.get('/restaurants/:id/menu', [this.validateId, this.findMenu]);
        application.put('/restaurants/:id/menu', [this.validateId, this.replaceMenu]);
    }
}
exports.restaurantsRouter = new RestaurantsRouter();
