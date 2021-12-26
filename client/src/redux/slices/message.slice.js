import { createSlice } from '@reduxjs/toolkit';
import { getMessageChannel, postSendMessage } from '../actions/message.action';

const initialState = {
  isLoading: true,
  messages: [],
  isSent: false,
  errorMsg: null,
};

const messageSlice = createSlice({
  name: 'message',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getMessageChannel.fulfilled]: (state, action) => {
      state.messages = action.payload;
    },
    [postSendMessage.fulfilled]: (state, action) => {
      state.isSent = true;
    },
    [postSendMessage.rejected]: (state, action) => {
      state.isSent = false;
    },
  },
});

const { reducer } = messageSlice;
export default reducer;