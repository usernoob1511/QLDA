"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.route('/')
    .get(order_controller_1.getOrders)
    .post(order_controller_1.createOrder);
router.route('/:id')
    .get(order_controller_1.getOrder)
    .put((0, auth_1.authorize)('admin'), order_controller_1.updateOrderStatus);
exports.default = router;
