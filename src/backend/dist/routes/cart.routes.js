"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_controller_1 = require("../controllers/cart.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.route('/')
    .get(cart_controller_1.getCart)
    .post(cart_controller_1.addToCart);
router.route('/:id')
    .put(cart_controller_1.updateCartItem)
    .delete(cart_controller_1.removeFromCart);
exports.default = router;
