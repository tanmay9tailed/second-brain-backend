import mongoose, { model, Schema } from "mongoose";

const UserSchema = new Schema({
    username: {type: String, unique: true} ,
    password: String
})

const ContentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    link: { type: String, required: true },
    type: { 
        type: String, 
        enum: ["youtube", "twitter"], 
        required: true 
    },
    userId: { 
        type: mongoose.Types.ObjectId, 
        ref: "User", 
        required: true 
    }    
});


const LinkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, ref: "User", required: true}    
})

export const UserModel = model("User",UserSchema);
export const ContentModel = model("Content",ContentSchema);
export const LinkModel = model("Link",LinkSchema);