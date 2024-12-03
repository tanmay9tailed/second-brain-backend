"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userMiddleware = (req, res, next) => {
    const header = req.headers;
    const token = header.authorization;
    if (!token) {
        res.status(401).send({
            message: "User not logged in!"
        });
    }
    const secret = process.env.JWT_SECRET;
    const decode = jsonwebtoken_1.default.verify(token, secret);
    if (decode) {
        req.body.userId = decode.id;
        next();
    }
};
exports.userMiddleware = userMiddleware;
