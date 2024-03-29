import React, { useState } from 'react';
import { Avatar } from '@mui/material';
import { InsertDriveFile } from '@mui/icons-material';
import cn from 'classnames';

import { ChatMsgTimestamp, ChatMsgText, ChatMsg, ChatMsgFile } from './styles';
import { formatToMsTime, formatToTime } from '../../../../utils/format';
import { imgOptimize } from '../../../../utils/cloudinaryImgOptimize';
import DialogImage from '../../../../components/Dialog/Image';

const Conversations = ({ messages, user, channelId }) => {
  const getChannelMessages = messages[channelId];
  const [openDialogImg, setOpenDialogImg] = useState(false);
  const [imgUrl, setImgUrl] = useState();

  const tsMsgs = (messages) => {
    let msgContainer = [];

    messages?.currentMsgs?.forEach((msg, i, array) => {
      const cloneMsg = Object.assign({}, msg);
      const currentMsgUser = msg.userId._id;
      const previousMsgUser = array[i - 1]?.userId._id || '';
      const currentMsTime = formatToMsTime(msg.createdAt);
      const previousMsTime = formatToMsTime(array[i - 1]?.createdAt);

      if (currentMsgUser !== previousMsgUser) {
        cloneMsg.ts = true;
        msgContainer.push(cloneMsg);
      }
      if (currentMsgUser === previousMsgUser) {
        // currentTime and previousTime are not nearby
        if (currentMsTime >= previousMsTime + 5 * 60 * 1000) {
          cloneMsg.ts = true;
          msgContainer.push(cloneMsg);
        }
        // currentTime and previousTime near each other
        if (currentMsTime < previousMsTime + 5 * 60 * 1000) {
          cloneMsg.ts = true;
          msgContainer.push(cloneMsg);
          msgContainer[i - 1].ts = false;
        }
      }
    });
    return msgContainer;
  };

  const newFilterdMsgs = tsMsgs(getChannelMessages);

  const openDialogHandler = (fileUrl, fileContentType) => (e) => {
    setImgUrl({ fileUrl, fileContentType });
    setOpenDialogImg(true);
  };

  return (
    <>
      {newFilterdMsgs.map((msg, i) => (
        <div className="msg-wrapper" key={i}>
          {msg.text && (
            <ChatMsg className={cn('chat-msg', { 'chat-msg--you': user._id === msg.userId._id })}>
              <ChatMsgText className={cn('chat-msg__text', { 'chat-msg__text--you': user._id === msg.userId._id })}>
                {msg.text}
              </ChatMsgText>
            </ChatMsg>
          )}
          {msg.messageType === 'file' &&
            msg.files.map((file, j) => (
              <ChatMsg className={cn('chat-msg', { 'chat-msg--you': user._id === msg.userId._id })} key={j}>
                {file.contentType.split('/')[0] === 'image' && (
                  <ChatMsgText
                    style={{ padding: '0' }}
                    className={cn('chat-msg__text', { 'chat-msg__text--you': user._id === msg.userId._id })}
                  >
                    <img
                      src={imgOptimize(file.url, file.contentType, file.width, file.height)}
                      alt="img"
                      onClick={openDialogHandler(file.url, file.contentType)}
                    />
                  </ChatMsgText>
                )}
                {file.contentType.split('/')[0] === 'application' && (
                  <ChatMsgText className={cn('chat-msg__text', { 'chat-msg__text--you': user._id === msg.userId._id })}>
                    <ChatMsgFile href={file.url} target="_blank">
                      <InsertDriveFile />
                      {file.filename}
                    </ChatMsgFile>
                  </ChatMsgText>
                )}
              </ChatMsg>
            ))}
          {msg.ts && (
            <div className="ts-wrapper">
              <ChatMsgTimestamp
                className={cn('chat-msg__timestamp', { 'chat-msg__timestamp--you': user._id === msg.userId._id })}
              >
                {!msg.yourMsg && <Avatar className="chat-msg__avatar" />} {msg.userId.username}
                <span className="datetime">{formatToTime(msg.createdAt)}</span>
              </ChatMsgTimestamp>
            </div>
          )}
        </div>
      ))}
      {openDialogImg && <DialogImage open={openDialogImg} setOpenDialogImg={setOpenDialogImg} imgUrl={imgUrl} />}
    </>
  );
};

export default Conversations;
