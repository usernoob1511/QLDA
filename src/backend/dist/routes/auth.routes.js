"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.get('/me', auth_1.protect, auth_controller_1.getMe);
router.put('/profile', auth_1.protect, auth_controller_1.updateProfile);
exports.default = router;
