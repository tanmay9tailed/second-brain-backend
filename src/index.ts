import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import connectDB from "./db";
import dotenv from "dotenv";
import cors from "cors";
import { ContentModel, LinkModel, UserModel } from "./Schemas/schema";
import { userMiddleware } from "./Middleware/middleware";
import { random } from "./utils";
dotenv.config();
const app = express();

connectDB();

app.use(express.json());

app.use(
  cors({
    origin: ["https://second-brain-pied-pi.vercel.app/"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.post("/api/v1/signup", async (req: Request, res: Response): Promise<any> => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({
      username: username,
      password: hashedPassword,
    });

    return res.send({
      message: "user signed up",
    });
  } catch (error) {
    return res.send(error);
  }
});

app.post("/api/v1/signin", async (req: Request, res: Response): Promise<any> => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const user = await UserModel.findOne({
      username: username,
    });
    if (user) {
      const isPasswordValid = bcrypt.compare(password, user.password!);
      if (!isPasswordValid) {
        return res.status(401).send({ message: "Invalid username or password" });
      }

      const JWT_SECRET = process.env.JWT_SECRET;
      const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET!);
      return res.send({
        message: "user signed up",
        token: jwtToken,
      });
    } else {
      return res.status(404).send({
        message: "User not found",
      });
    }
  } catch (error) {
    res.send(error);
  }
});

app.post("/api/v1/content", userMiddleware, async (req: Request, res: Response): Promise<any> => {
  const link = req.body.link;
  const title = req.body.title;
  const type = req.body.type;

  try {
    await ContentModel.create({
      title,
      link,
      type,
      userId: req.body.userId,
    });

    return res.send({
      message: "Content added",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error in posting content",
      error,
    });
  }
});

app.get("/api/v1/content", userMiddleware, async (req: Request, res: Response): Promise<any> => {
  const userId = req.body.userId;
  try {
    const content = await ContentModel.find({
      userId,
    }).populate("userId", "username");

    return res.send({
      message: "Successfully get content",
      content: content,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error in getting content",
      error,
    });
  }
});

app.delete("/api/v1/content", userMiddleware, async (req: Request, res: Response): Promise<any> => {
  const contentId = req.body.contentId;
  try {
    const result = await ContentModel.deleteOne({ _id: contentId });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Content not found or not authorized to delete" });
    }

    return res.status(200).send({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting content:", error);
    return res.status(500).send({ message: "Error in deleting content" });
  }
});
app.post("/api/v1/share", userMiddleware, async (req: Request, res: Response): Promise<any> => {
  const share = req.body.share;

  if (share) {
    try {
      const existingLink = await LinkModel.findOne({
        userId: req.body.userId,
      });
      if (existingLink) {
        return res.send({
          message: "Link created",
          link: existingLink.hash,
        });
      }
      const hash = random(15);
      await LinkModel.create({
        hash: hash,
        userId: req.body.userId,
      });
      return res.send({
        message: "Link created",
        link: hash,
      });
    } catch (error) {
      return res.status(401).send({
        message: "Error in creating sharable link",
        error,
      });
    }
  } else {
    await LinkModel.deleteOne({
      userId: req.body.userId,
    });
    return res.send({
      message: "Deleted the Link",
    });
  }
});

app.get("/api/v1/shared-brain/:hash", async (req: Request, res: Response): Promise<any> => {
  const hash = req.params.hash;
  try {
    const linkModel = await LinkModel.findOne({
      hash: hash,
    });

    if (!linkModel) {
      res.status(411).json({
        message: "Sorry incorrect input",
      });
      return;
    }

    const contents = await ContentModel.find({
      userId: linkModel.userId,
    });

    const user = await UserModel.findOne({
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
  } catch (error) {
    return res.status(401).send({
      message: "Error in opening shared link",
      error,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Server Started");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on PORT -> ${process.env.PORT}`);
});
