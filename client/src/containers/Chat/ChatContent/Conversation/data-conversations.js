import { Avatar } from '@mui/material';

import { ChatMsgTimestamp, ChatMsgText, ChatMsg } from './styles';
import { formatToMsTime, formatToTime } from '../../../../utils/helpers';

const renderConversations = (messages, user) => {
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

  const newFilterdMsgs = tsMsgs(messages);

  return (
    <>
      {newFilterdMsgs.map((msg, i) => (
        <div className="msg-wrapper" key={i}>
          <ChatMsg className={`chat-msg ${user._id === msg.userId._id ? 'chat-msg--you' : ''}`}>
            <ChatMsgText className={`chat-msg__text ${user._id === msg.userId._id ? 'chat-msg__text--you' : ''}`}>
              {msg.text}
            </ChatMsgText>
          </ChatMsg>
          {msg.ts && (
            <div className="ts-wrapper">
              <ChatMsgTimestamp
                className={`chat-msg__timestamp ${user._id === msg.userId._id ? 'chat-msg__timestamp--you' : ''}`}
              >
                {!msg.yourMsg && <Avatar className="chat-msg__avatar" />} {msg.userId.username}
                <span className="datetime">{formatToTime(msg.createdAt)}</span>
              </ChatMsgTimestamp>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export { renderConversations };

// GROUP TEXT
// const result = messages?.currentMsgs?.reduce((pre, cur) => {
//   const lastMessage = pre[pre.length - 1];
//   const cloneCur = Object.assign({}, cur);
//   if (!lastMessage || formatToMsTime(cloneCur.createdAt) - formatToMsTime(lastMessage.createdAt) >= 60 * 1000) {
//     cloneCur.groupText = [cloneCur.text];
//     delete cloneCur.text;
//     pre.push(cloneCur);
//   } else {
//     lastMessage.groupText.push(cloneCur.text);
//   }
//   return pre;
// }, []);