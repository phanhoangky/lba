import { openNotification } from "@/utils/utils";
import axios from "axios";
import { history } from "umi";


const ApiHelper = axios.create({
  // baseURL: "https://location-base-advertising.herokuapp.com/api/v1/",
  baseURL: "https://localhost:44333/api/v1",
  headers: {
    "Accept": "application/json",
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  },
  withCredentials: true,
})

ApiHelper.interceptors.request.use(config => {
  const jwt = localStorage.getItem("JWT");
  // console.log("Interceptor >>>>", jwt);
  
  if (jwt) {
    config.headers['Authorization'] = `Bearer ${jwt}`;
    // console.log(config.headers);
    
  }
  return config;
  
}, error => {
  return Promise.reject(error);
})

ApiHelper.interceptors.response.use(
  response => response,
  error => {
    console.log('====================================');
    console.error(error.response);
    console.log('====================================');
    if (error.response) {
      const { status, data } = error.response;
      if (status) {
        if (status === 401) {
          history.replace("/account/login");
        } else {
          history.replace('/exception/500')
        }
      } else {
        history.replace('/exception/500')
      }
      const { errors } = data;
      let listError = "";
      errors.id.forEach((element: string) => {
        listError = listError.concat(`${element} \n`);
      });
      openNotification("error", error.response.status, listError);
    } else {
      history.replace('/exception/500');
      openNotification("error", error.response.status, error.response.status)
    }
    // Promise.reject(new Error(error)).catch(e => {
      
    // });
    // throw new Error(error);
  }
)

export default ApiHelper;