/**
 * Logger sécurisé - n'affiche les logs que en développement
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  error: (message, ...args) => {
    if (isDev) {
      console.error(message, ...args);
    }
  },
  warn: (message, ...args) => {
    if (isDev) {
      console.warn(message, ...args);
    }
  },
  log: (message, ...args) => {
    if (isDev) {
      console.log(message, ...args);
    }
  },
  info: (message, ...args) => {
    if (isDev) {
      console.info(message, ...args);
    }
  }
};

export default logger;
