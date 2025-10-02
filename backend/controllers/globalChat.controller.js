import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GlobalChat } from "../models/globalChat.model.js";

export const getMessages = AsyncHandler(async (req, res) => {
  const messages = await GlobalChat.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  return res.status(200).json(
    new ApiResponse(200, messages.reverse(), "Messages fetched successfully")
  );
});

export const sendMessage = AsyncHandler(async (req, res) => {
  const { userId, username, message } = req.body;

  if (!message || message.length > 200) {
    throw new ApiError(400, "Invalid message");
  }

  const newMessage = await GlobalChat.create({ userId, username, message });

  // Keep only latest 1000 messages
  const totalMessages = await GlobalChat.countDocuments();
  if (totalMessages > 1000) {
    const oldestMessages = await GlobalChat.find()
      .sort({ createdAt: 1 })
      .limit(totalMessages - 1000);

    const idsToDelete = oldestMessages.map((m) => m._id);
    await GlobalChat.deleteMany({ _id: { $in: idsToDelete } });
  }

  return res.status(201).json(
    new ApiResponse(201, newMessage, "Message sent successfully")
  );
});

