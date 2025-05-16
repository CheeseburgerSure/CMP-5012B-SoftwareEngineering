let chatLog = [];

function getAdminReply(userMsg) {
  const lower = userMsg.toLowerCase();
  if (lower.includes('hello')) return "Hello! How can I assist you today?";
  if (lower.includes('problem')) return "Sorry to hear that. Can you describe the issue in more detail?";
  if (lower.includes('bye')) return "Goodbye! Let us know if you need anything else.";
  return "I'm not sure how to respond to that, but I'm here to help!";
}

exports.getChatPage = (req, res) => {
  res.render('chat', { messages: chatLog });
};

exports.postMessage = (req, res) => {
  const userMsg = req.body.message;
  if (!userMsg) return res.redirect('/chat');

  chatLog.push({ sender: 'user', text: userMsg });

  const adminReply = getAdminReply(userMsg);
  chatLog.push({ sender: 'admin', text: adminReply });

  res.redirect('/chat');
};
