"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(product_controller_1.getProducts)
    .post(auth_1.protect, (0, auth_1.authorize)('admin'), product_controller_1.createProduct);
router.route('/:id')
    .get(product_controller_1.getProduct)
    .put(auth_1.protect, (0, auth_1.authorize)('admin'), product_controller_1.updateProduct)
    .delete(auth_1.protect, (0, auth_1.authorize)('admin'), product_controller_1.deleteProduct);
exports.default = router;
