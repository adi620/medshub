require("dotenv").config();
const service = require("../services/chatbot.service");

// --------------------------- TEXT QUERY ---------------------------
const postChatbot = async (req, res, next) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage) {
      return next({ status: 400, message: "User message is required" });
    }

    const result = await service.chatbotPostService(userMessage);

    if (result.error) return next(result.error);

    const { query, reply, intent } = result.botMessage;

    return res.json({
      status: "200",
      query,
      reply,
      intent,
    });

  } catch (error) {
    next(error);
  }
};

// --------------------------- EVENT QUERY ---------------------------
const getChatbot = async (req, res, next) => {
  try {
    const event = req.params.event;

    if (!event) {
      return next({ status: 400, message: "Event name is required" });
    }

    const result = await service.chatbotGetService(event);

    if (result.error) return next(result.error);

    const { query, reply, intent } = result.botMessage;

    return res.json({
      status: "200",
      query,
      reply,
      intent,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { postChatbot, getChatbot };
