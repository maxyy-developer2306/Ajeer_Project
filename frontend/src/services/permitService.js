import { api } from './authService';

export const getPermits = async () => {
  const response = await api.get('/permits');
  return response.data;
};

export const getPermitById = async (id) => {
  const response = await api.get(`/permits/${id}`);
  return response.data;
};

export const createPermit = async (payload) => {
  const response = await api.post('/permits', payload);
  return response.data;
};

export const updatePermit = async (id, payload) => {
  const response = await api.put(`/permits/${id}`, payload);
  return response.data;
};

export const deletePermit = async (id) => {
  const response = await api.delete(`/permits/${id}`);
  return response.data;
};
