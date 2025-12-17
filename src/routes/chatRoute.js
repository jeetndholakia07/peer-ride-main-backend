import express from "express";
import getUserChats from "../controllers/chat/getUserChats.js";
import getChatMessages from "../controllers/chat/getChatMessages.js";
import getTotalUnreadCount from "../controllers/chat/getTotalUnreadCount.js";
import findOrCreateRoom from "../controllers/chat/findOrCreateRoom.js";
import getUserChat from "../controllers/chat/getUserChat.js";

const chatRoute = express.Router();

chatRoute.get("/user-chats", getUserChats);
chatRoute.get("/user-chat", getUserChat);
chatRoute.get("/messages", getChatMessages);
chatRoute.get("/totalUnreadCount", getTotalUnreadCount);
chatRoute.get("/room", findOrCreateRoom);

export default chatRoute;