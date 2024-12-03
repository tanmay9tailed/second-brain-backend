"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("./db"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const schema_1 = require("./Schemas/schema");
const middleware_1 = require("./Middleware/middleware");
const utils_1 = require("./utils");
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, db_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield schema_1.UserModel.create({
            username: username,
            password: hashedPassword,
        });
        return res.send({
            message: "user signed up",
        });
    }
    catch (error) {
        return res.send(error);
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const user = yield schema_1.UserModel.findOne({
            username: username,
        });
        if (user) {
            const isPasswordValid = bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).send({ message: "Invalid username or password" });
            }
            const JWT_SECRET = process.env.JWT_SECRET;
            const jwtToken = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET);
            return res.send({
                message: "user signed up",
                token: jwtToken,
            });
        }
        else {
            return res.status(404).send({
                message: "User not found",
            });
        }
    }
    catch (error) {
        res.send(error);
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const link = req.body.link;
    const title = req.body.title;
    const type = req.body.type;
    try {
        yield schema_1.ContentModel.create({
            title,
            link,
            type,
            userId: req.body.userId,
        });
        return res.send({
            message: "Content added",
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Error in posting content",
            error,
        });
    }
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    try {
        const content = yield schema_1.ContentModel.find({
            userId,
        }).populate("userId", "username");
        return res.send({
            message: "Successfully get content",
            content: content,
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Error in getting content",
            error,
        });
    }
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    try {
        const result = yield schema_1.ContentModel.deleteOne({ _id: contentId });
        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Content not found or not authorized to delete" });
        }
        return res.status(200).send({ message: "Successfully deleted" });
    }
    catch (error) {
        console.error("Error deleting content:", error);
        return res.status(500).send({ message: "Error in deleting content" });
    }
}));
app.post("/api/v1/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        try {
            const existingLink = yield schema_1.LinkModel.findOne({
                userId: req.body.userId,
            });
            if (existingLink) {
                return res.send({
                    message: "Link created",
                    link: existingLink.hash,
                });
            }
            const hash = (0, utils_1.random)(15);
            yield schema_1.LinkModel.create({
                hash: hash,
                userId: req.body.userId,
            });
            return res.send({
                message: "Link created",
                link: hash,
            });
        }
        catch (error) {
            return res.status(401).send({
                message: "Error in creating sharable link",
                error,
            });
        }
    }
    else {
        yield schema_1.LinkModel.deleteOne({
            userId: req.body.userId,
        });
        return res.send({
            message: "Deleted the Link",
        });
    }
}));
app.get("/api/v1/shared-brain/:hash", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.hash;
    try {
        const linkModel = yield schema_1.LinkModel.findOne({
            hash: hash,
        });
        if (!linkModel) {
            res.status(411).json({
                message: "Sorry incorrect input",
            });
            return;
        }
        const contents = yield schema_1.ContentModel.find({
            userId: linkModel.userId,
        });
        const user = yield schema_1.UserModel.findOne({
            _id: linkModel.userId,
        });
        if (!user) {
            return res.status(404).send({
                message: "User not Found",
            });
        }
        return res.send({
            message: "successfully fetched",
            username: user.username,
            contents: contents,
        });
    }
    catch (error) {
        return res.status(401).send({
            message: "Error in opening shared link",
            error,
        });
    }
}));
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on PORT -> ${process.env.PORT}`);
});
