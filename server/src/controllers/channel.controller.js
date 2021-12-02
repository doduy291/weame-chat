import asyncHandler from '../utils/asyncHandler.js';
import ChannelModel from '../models/channel.model.js';
import UserModel from '../models/user.model.js';

import { ErrorResponse } from '../utils/errorHandler.js';

export const getListChannels = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const channels = await UserModel.findOne({ _id: userId })
    .populate({ path: 'chatChannels', select: 'channelName lastMessage' })
    .select('-_id chatChannels');
  if (!channels) throw new ErrorResponse(400, 'Channels is not found');

  res.status(200).json({ channels: channels.chatChannels });
});

export const postCreateChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { channelName } = req.body;
  // const testMembers = [userId, userId, userId]; //req.body
  // const test = testMembers;
  // const channelMembers = [...test, userId];

  const newChannel = await ChannelModel.create({
    creator: userId,
    members: userId,
    channelName,
    channelType: 'group',
    lastMessage: {
      message: '',
    },
  });
  if (!newChannel) throw new ErrorResponse(400, 'Cannot create channel, try again');

  const updateUserChannel = await UserModel.findOneAndUpdate(
    { _id: userId },
    { $addToSet: { chatChannels: newChannel._id } },
    { new: true, rawResult: true }
  );
  if (!updateUserChannel.lastErrorObject.updatedExisting) throw new ErrorResponse(400, 'Cannot add user into channel');

  res.status(201).json({ message: 'Created new channel successfully' });
});

export const getSelectedChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const channelId = req.params.id;

  const doesExist = await ChannelModel.exists({ _id: channelId, member: userId });
  if (!doesExist) throw new ErrorResponse(400, 'Channel does not exist');

  const channel = await ChannelModel.findOne({ _id: channelId, member: userId });
  if (!channel) throw new ErrorResponse(400, 'Channel does not exist');

  res.status(200).json({ channel });
});