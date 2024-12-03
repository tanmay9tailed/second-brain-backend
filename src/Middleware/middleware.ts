import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"

interface AuthRequest extends Request {
    userId?: String;
}

export const userMiddleware = (req: AuthRequest, res: Response, next:NextFunction) => {
    const header = req.headers
    const token = header.authorization
    if(!token){
        res.status(401).send({
            message: "User not logged in!"
        })
    }
    const secret = process.env.JWT_SECRET
    const decode = jwt.verify(token!,secret!) as JwtPayload
    if(decode){
        req.body.userId = decode.id
        next()
    }
} 