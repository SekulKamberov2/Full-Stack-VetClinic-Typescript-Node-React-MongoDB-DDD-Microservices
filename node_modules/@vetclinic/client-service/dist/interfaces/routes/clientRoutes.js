"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientRoutes = void 0;
const express_1 = __importDefault(require("express"));
const createClientRoutes = (clientController) => {
    const router = express_1.default.Router();
    router.post('/clients', (req, res) => clientController.createClient(req, res));
    router.get('/clients/:id', (req, res) => clientController.getClient(req, res));
    router.get('/clients', (req, res) => clientController.getAllClients(req, res));
    router.put('/clients/:id', (req, res) => clientController.updateClient(req, res));
    router.delete('/clients/:id', (req, res) => clientController.deleteClient(req, res));
    return router;
};
exports.createClientRoutes = createClientRoutes;
