import axios from 'axios';
import { HttpException } from '@nestjs/common';
import { response } from 'express';

export const axiosKc = async (
  url: string,
  method: string,
  token: string,
  data?: any,
) => {
  const Headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (method === 'GET') {
    try {
      const response = await axios.get(url, {
        headers: Headers,
      });
      return response;
    } catch (err) {
      throw err;
    }
  } else if (method === 'POST') {
    console.log('inside if', url, data);
    // try {
    const response = await axios.post(url, data, {
      headers: Headers,
    });
    console.log('errror', response);
    return response;

    // } catch (err) {
    //     throw err
    // }
  } else if (method === 'PATCH') {
    try {
      const response = await axios.patch(url, data, {
        headers: Headers,
      });
      return response;
    } catch (err) {
      throw err;
    }
  } else if (method === 'PUT') {
    try {
      const response = await axios.put(url, data, {
        headers: Headers,
      });
      return response;
    } catch (err) {
      throw err;
    }
  } else if (method === 'DELETE') {
    try {
      const response = await axios.delete(url, {
        headers: Headers,
      });
      return response;
    } catch (err) {
      throw err;
    }
  }
};
