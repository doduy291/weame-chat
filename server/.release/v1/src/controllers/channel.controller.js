import asyncHandler from '../utils/asyncHandler.js';
import ChannelModel from '../models/channel.model.js';
import UserModel from '../models/user.model.js';

import { ErrorResponse } from '../utils/errorHandler.js';

export const getListDMs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const directs = await UserModel.findOne({ _id: userId })
    .populate({
      path: 'chatChannels',
      select: 'channelName lastMessage members',
      match: { channelType: 'direct' },
      populate: {
        path: 'members',
        select: '_id username avatar active',
        match: { _id: { $ne: userId } },
      },
    })
    .select('-_id chatChannels');
  if (!directs) throw new ErrorResponse(400, 'Direct Channels are not found');
  res.status(200).json({ channels: directs.chatChannels });
});

export const getListGroupChannels = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const channels = await UserModel.findOne({ _id: userId })
    .populate({ path: 'chatChannels', select: 'channelName lastMessage', match: { channelType: 'group' } })
    .select('-_id chatChannels');
  if (!channels) throw new ErrorResponse(400, 'Channels are not found');

  res.status(200).json({ channels: channels.chatChannels });
});

export const postCreateChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { channelName, channelType, members } = req.body;
  let channelMembers = [userId];

  if (members.length > 0) {
    members.forEach((member) => (channelMembers = [...channelMembers, member.contactId]));
  }

  const newChannel = await ChannelModel.create({
    creator: userId,
    members: channelMembers,
    channelName,
    channelType,
  });
  if (!newChannel) throw new ErrorResponse(400, 'Cannot create channel');

  Promise.all(
    channelMembers.forEach(async (memberId) => {
      const updateUserChannel = await UserModel.findOneAndUpdate(
        { _id: memberId },
        { $addToSet: { chatChannels: newChannel._id } },
        { new: true, rawResult: true }
      );
      if (!updateUserChannel.lastErrorObject.updatedExisting)
        throw new ErrorResponse(400, 'Cannot add user into channel');
    })
  );

  res.status(201).json({ message: 'Created new channel successfully' });
});

export const getSelectedChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { channelId } = req.params;
  const doesExist = await ChannelModel.exists({ _id: channelId, member: userId });
  if (!doesExist) throw new ErrorResponse(400, 'Channel does not exist');

  let channel = await ChannelModel.findOne({ _id: channelId, member: userId })
    .populate({
      path: 'members',
      select: '_id username avatar active',
      match: { _id: { $ne: userId } }, // Not equal ~ not including my id
    })
    .select('-__v')
    .lean(); // in order to add new key into object in mongoose
  if (!channel) throw new ErrorResponse(400, 'Channel does not exist');

  if (channel.channelType === 'direct') {
    const doesExistContact = await UserModel.exists({
      _id: userId,
      contacts: channel.members[0]._id,
    });
    const isBlockedContact = await UserModel.exists({
      _id: userId,
      blockedContacts: { $in: [channel.members[0]._id] },
    });

    if (doesExistContact) {
      channel.isFriend = true; // benefit of .lean()
    }
    if (isBlockedContact) {
      channel.isBlocked = true;
    }
  }
  res.status(200).json({ channel });
});
