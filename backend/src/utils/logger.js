const log4js = require('log4js');

log4js.configure({
  appenders: {
    file: { type: 'file', filename: 'error.log' }
  },
  categories: {
    default: { appenders: ['file'], level: 'error' }
  }
});

const logger = log4js.getLogger();

module.exports = logger;
