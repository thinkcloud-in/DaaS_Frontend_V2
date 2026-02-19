import axios from 'axios';
import KeycloakConfig from '../Components/Login/keycloak/keycloak';
import { getEnv } from 'utils/getEnv';

const axiosInstance = axios.create();

const agentBackendUrl = getEnv("AGENT_BACKEND_URL");

// Add the interceptor
axiosInstance.interceptors.request.use(
  async (config) => {

    // Skip auth for agent backend requests (it doesn't need Keycloak tokens)
    if (agentBackendUrl && config.url?.startsWith(agentBackendUrl)) {
      return config;
    }

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
