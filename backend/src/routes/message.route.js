import express from 'express';
const router = express.Router();
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllContacts,getMessagesByUserId,sendMessage,getChatPartners } from '../controllers/message.controller.js';

router.get("/contacts", protectRoute, getAllContacts);
router.get("/chats", protectRoute, getChatPartners);
router.get("/:id", protectRoute, getMessagesByUserId);
router.post('/send/:id',protectRoute, sendMessage);

export default router;