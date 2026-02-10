import express from 'express';
const router = express.Router();
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllContacts,getMessagesByUserId,sendMessage,getChatPartners } from '../controllers/message.controller.js';

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post('/send/:id', sendMessage);

export default router;