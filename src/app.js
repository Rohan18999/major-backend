import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    
}))

app.use(express.json()); // parses the json data into javascript object
app.use(express.urlencoded({ limit: "16kb"})) //used for urls like +?hitesh+?choudry?++
app.use(express.static("public")) // serves static files from the public directory
app.use(cookieParser()); // this takes the data from the users browsers

export { app }