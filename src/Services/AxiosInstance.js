import axios from 'axios';
import KeycloakConfig from '../Components/Login/keycloak/keycloak';

const axiosInstance = axios.create();

// Add the interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
  
    const token = KeycloakConfig.token;

    if (token) {
      const isTokenExpired = KeycloakConfig.isTokenExpired();

      if (isTokenExpired) {
       
        try {
          // Refresh the token
          const refreshed = await KeycloakConfig.updateToken(30);
          if (refreshed) {
            
            config.headers.Authorization = `Bearer ${KeycloakConfig.token}`;
          } else {
            
            KeycloakConfig.login();
            
            return Promise.reject("Redirecting to login.");
          }
        } catch (err) {
          
          KeycloakConfig.login();
         
          return Promise.reject(err);
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      
      KeycloakConfig.login();
      
      return Promise.reject("Redirecting to login.");
    }

    
    return config;
  },
  (error) => {
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
