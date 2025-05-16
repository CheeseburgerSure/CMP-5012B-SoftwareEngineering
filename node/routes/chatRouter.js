const express = require('express');
const router = express.Router();
const chatController = require("../controller/chatController");

// GET route to render the chat page with messages
router.get('/chat', chatController.getChatPage);

// POST route to handle user messages and respond
router.post('/chat', chatController.postMessage);

module.exports = router;
