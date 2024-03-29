import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Clear } from '@mui/icons-material';
import { postCreateChannel } from '../../../redux/actions/channel.action';
import {
  Dialog,
  DialogContainer,
  DialogHeader,
  DialogFooter,
  DialogContent,
  MultiSelect,
  MultiSelectItem,
} from '../styles';
import ListFriend from './ListFriend';
import { fieldValidation } from '../../../validation/field.validation';

import { debounce } from '../../../utils/helper';

const DialogCreateChannel = ({ allContacts, open, setDialogCreate }) => {
  const dispatch = useDispatch();
  const [contacts, setContacts] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const inputRef = useRef();
  const typingTimeoutRef = useRef();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleClose = () => {
    setDialogCreate(false);
  };

  const createChannelHandler = async (dataHookForm) => {
    dispatch(postCreateChannel({ dataHookForm, channelType: 'group', selectedUsers }));
    setDialogCreate(false);
  };

  const addMultiSelectHandler = (friend) => (e) => {
    if (selectedUsers.length > 10) return;
    if (e.target.checked) {
      setSelectedUsers((currentState) => {
        if (!currentState.some((element) => element['contactId'] === friend.contactId)) {
          return [...currentState, friend];
        }
        return [...currentState];
      });
    } else {
      setSelectedUsers((currentState) => {
        return currentState.filter((element) => element.contactId !== friend.contactId);
      });
    }
  };

  const removeMultiSelectHandler = (index) => (e) => {
    setSelectedUsers((currentState) => currentState.filter((_, i) => i !== index));
  };

  const searchContactHandler = () => {
    const searchContacts = () => {
      const keyword = inputRef.current.value;
      const filteredContact = allContacts?.filter((contact) => contact.username.match(keyword));
      setContacts(filteredContact);
    };
    debounce(searchContacts, 500, typingTimeoutRef);
  };

  useEffect(() => {
    setContacts(allContacts);
  }, [allContacts]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContainer className="create-channel">
        <DialogHeader>
          <span>Create new channel</span>
        </DialogHeader>
        <DialogContent>
          <label>Channel name</label>
          <input
            {...register('channelName', { ...fieldValidation.createChannel })}
            type="text"
            placeholder="Fill your channel name..."
          />
          {errors?.channelName?.message && <p className="dialog-error-msg">* {errors?.channelName?.message}</p>}

          <label>Select your friends (Optional)</label>
          <MultiSelect className="multiselect">
            {selectedUsers.map((item, i) => (
              <MultiSelectItem key={i} onClick={removeMultiSelectHandler(i)}>
                <span>{item.contactName}</span>
                <Clear />
              </MultiSelectItem>
            ))}
            <input
              type="text"
              placeholder="Search friends"
              className="multiselect__search"
              ref={inputRef}
              onChange={searchContactHandler}
            />
          </MultiSelect>

          <ListFriend addMultiSelectHandler={addMultiSelectHandler} contacts={contacts} selectedUsers={selectedUsers} />
        </DialogContent>
        <DialogFooter>
          <button onClick={handleSubmit(createChannelHandler)}>Create</button>
        </DialogFooter>
      </DialogContainer>
    </Dialog>
  );
};

export default DialogCreateChannel;
