import mongoose from 'mongoose';

const globalChatSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true 
  },
  username: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String,
    required: true,
    maxlength: 200 
  },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    expires: 86400 
  } 
});

export const GlobalChat = mongoose.model('GlobalChat', globalChatSchema);