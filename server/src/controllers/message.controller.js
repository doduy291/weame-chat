import asyncHandler from '../utils/asyncHandler.js';
import { ErrorResponse } from '../utils/errorHandler.js';
import MessageModel from '../models/message.model.js';
import ChannelModel from '../models/channel.model.js';
import { uploadStreamAsync } from '../utils/uploadStreamAsync.js';

export const getMessageChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { channelId } = req.params;
  let skipMsg = Number(req.query.skipMsg);
  const limitMsg = 10;

  const doesExist = await ChannelModel.exists({ _id: channelId, member: userId });
  if (!doesExist) throw new ErrorResponse(403, 'Cannot get messages, User is not existing in channel');

  // Total count of messages in channel
  const count = await MessageModel.count({ channel: channelId });
  if (!count) skipMsg = 1;
  if (!skipMsg) {
    // Be used to get latest messages
    const defaultSkipMsg = Math.ceil(count / limitMsg);
    skipMsg = defaultSkipMsg;
  }

  let messages = await MessageModel.find({ channel: channelId })
    .populate({ path: 'userId', select: '_id username avatar' })
    .select('-_id text userId createdAt channel files messageType')
    .limit(limitMsg)
    .skip(limitMsg * (skipMsg - 1))
    .lean();

  res.status(200).json({ currentMsgs: messages, pageMsg: skipMsg });
});

export const postSendMessage = asyncHandler(async (req, res) => {
  const user = req.user._id;
  const { channelId } = req.params;
  const { textMsg, typeMsg } = req.body;
  const uploadedFiles = req.files;
  let uploadedToCloud = [];

  const doesExist = await ChannelModel.exists({ _id: channelId, member: user });
  if (!doesExist) throw new ErrorResponse(403, 'Cannot send message, not matching user in channel');

  if (uploadedFiles && typeMsg === 'image') {
    for (const file of uploadedFiles) {
      const uploaded = await uploadStreamAsync(file.buffer, { folder: 'chat_app_ws/chat-img' });
      uploadedToCloud.push({
        filename: file.originalname,
        contentType: file.mimetype,
        size: uploaded.bytes,
        url: uploaded.url,
        width: uploaded.width,
        height: uploaded.width,
        created_at: uploaded.created_at,
      });
    }
  }
  let newMessage = await MessageModel.create({
    text: textMsg,
    userId: user,
    channel: channelId,
    messageType: typeMsg,
    files: [...uploadedToCloud],
  });
  if (!newMessage) throw new ErrorResponse(400, 'Failed to send message, try again');

  const { text, userId, channel, createdAt, files, messageType } = await newMessage.populate({
    path: 'userId',
    select: '_id username avatar',
  });

  for (const sharedImg of files) {
    let updateSharedImgChannel = await ChannelModel.findOneAndUpdate(
      {
        _id: channel,
      },
      { $push: { sharedImages: { sender: userId, image: sharedImg.url } } },
      { new: true, rawResult: true }
    );

    if (!updateSharedImgChannel.lastErrorObject.updatedExisting) {
      throw new ErrorResponse(400, 'Cannot push image to shared images');
    }
  }

  res.status(201).json({
    message: { text, userId, channel, createdAt, files, messageType },
  });
});
