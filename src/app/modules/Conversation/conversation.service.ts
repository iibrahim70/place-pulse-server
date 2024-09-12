import { JwtPayload } from 'jsonwebtoken';
import { IConversation } from './conversation.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Conversation } from './conversation.model';
import { User } from '../User/user.model';
import { Message } from '../Message/message.model';

const createConversationToDB = async (
  user: JwtPayload,
  payload: IConversation,
) => {
  // Check if the user already has an existing conversation
  const existingConversation = await Conversation.findOne({
    participants: user?.userId,
  });

  if (existingConversation) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'User already has an existing conversation!',
    );
  }

  payload.createdBy = user?.userId;

  // Find all admins and superadmins
  const adminsAndSuperadmins = await User.find({
    role: { $in: ['ADMIN', 'SUPER-ADMIN'] },
    status: 'active',
  });

  const adminIds = adminsAndSuperadmins.map((admin) => admin?._id);

  payload.participants = [user?.userId, ...adminIds];

  const result = await Conversation.create(payload);
  return result;
};

const getConversationsFromDB = async () => {
  const result = await Conversation.find()
    .populate({
      path: 'createdBy',
      select: 'fullName avatar',
    })
    .populate('lastMessage')
    .sort('-updatedAt');
  return result;
};

const getConversationByIdFromDB = async (conversationId: string) => {
  const existingConversation = await Conversation.findById(conversationId);

  // Handle case where no Conversation is found
  if (!existingConversation) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Conversation with ID: ${conversationId} not found!`,
    );
  }

  // Fetch all messages that belong to the given conversation ID
  const messages = await Message.find({ conversationId })
    .populate({
      path: 'senderId',
      select: 'fullName avatar',
    })
    .sort('-createdAt');

  return { messages };
};

export const ConversationServices = {
  createConversationToDB,
  getConversationByIdFromDB,
  getConversationsFromDB,
};
