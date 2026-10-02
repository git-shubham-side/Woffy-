const express = require("express");
const router = express.Router();
const chatbotController = require("../Controllers/chatbotController");

// Post chat message to Jimmy
router.post("/message", chatbotController.sendMessage);
router.post("/", chatbotController.sendMessage);

// Get starter suggestions & welcome metadata
router.get("/suggestions", chatbotController.getSuggestions);

// Get user's pets for pet selection in chat
router.get("/pets", chatbotController.getUserPetsForChat);

module.exports = router;
