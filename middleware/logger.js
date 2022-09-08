const {  format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path')

const logEvents = async (message, logName) => {
   const datatime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
   const logItem = `${datatime}\t${uuid()}\t${message}\n`

   try{
         !fs.existsSync(path.join(__dirname, '..', 'logs')) 
      && await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));

      await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logItem);
   }
   catch(err) {
      console.log(err.message)
   }
}

const logger = (req, res, next) => {
   logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
   console.log(`${req.method} ${req.path}`)
   next()
}

module.exports = { logEvents, logger }