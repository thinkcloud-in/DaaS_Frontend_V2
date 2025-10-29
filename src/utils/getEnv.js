export const getEnv = (key) => {
    // For Production (runtime-injected)
    if (
      typeof window !== 'undefined' &&
      window._env_ &&
      window._env_[`REACT_APP_${key}`]
    ) {
      return window._env_[`REACT_APP_${key}`];
    }
  
    // For Development (compile-time)
    return process.env[`REACT_APP_${key}`];
  };



