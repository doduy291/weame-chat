import useSWR from 'swr';
import { fetcher, revalidatedOptions } from '../configs/swr.config';

const baseURL = '/api/contact';
const contactService = {
  useGetAllContacts: () => {
    const { data, error } = useSWR(`${baseURL}/all-contacts`, fetcher, revalidatedOptions);
    return { data: data?.allContacts, error };
  },
  useGetBlockedContacts: () => {
    const { data, error, mutate } = useSWR(`${baseURL}/blocked-contacts`, fetcher, revalidatedOptions);
    return { data: data?.blockedContacts, error, mutate };
  },
  useGetPendingRequests: () => {
    const { data, error } = useSWR(`${baseURL}/pendings`, fetcher, revalidatedOptions);
    return { data: data?.pendings?.contactRequests, error };
  },
};
export default contactService;
