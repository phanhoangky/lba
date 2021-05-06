import { openNotification } from '@/utils/utils';
import axios from 'axios';
import { history } from 'umi';

const ApiHelper = axios.create({
  baseURL: 'https://location-base-advertising.herokuapp.com/api/v1/',
  // baseURL: 'https://localhost:44333/api/v1/',
  // baseURL: "https://6fbd4ba7f3e3.ngrok.io/api/v1/",
  headers: {
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  },
  withCredentials: true,
});

ApiHelper.interceptors.request.use(
  (config) => {
    const jwt = localStorage.getItem('JWT');
    // console.log("Interceptor >>>>", jwt);

    if (jwt) {
      config.headers['Authorization'] = `Bearer ${jwt}`;
      // console.log(config.headers);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

ApiHelper.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code === 401) {
      return Promise.reject(new Error(data.message));
    }
    return response;
  },
  (error) => {
    console.log('====================================');
    console.error(error.response.data.message);
    console.log('====================================');
    openNotification('error', error.response.status, error.response.data.message);
    if (error.response) {
      const { status, data } = error.response;
      const { errors } = data;
      let listError = '';
      errors.id.forEach((element: string) => {
        listError = listError.concat(`${element} \n`);
      });
      console.log('====================================');
      console.log(data, status);
      console.log('====================================');
      if (status) {
        openNotification('error', error.response.status, listError);
        if (status === 401) {
          history.replace('/account/login');
        } else {
          history.replace('/exception/500');
        }
      } else {
        history.replace('/exception/500');
      }
    } else {
      openNotification('error', 'Cannot connect to server');
      // history.replace('/account/login');
      // throw error;
    }
    // Promise.reject(new Error(error)).catch(e => {
    return Promise.reject(error);
    // });
    // throw new Error(error);
  },
);

export default ApiHelper;
