require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const path = require('path');
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const mongoose = require('mongoose');
const { logEvents } = require('./middleware/logger')
const connectDB = require('./config/dbConfig')

connectDB()

app.use(logger)

app.use(cors(corsOptions));

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoute'))
app.use('/notes', require('./routes/noteRoute'))


app.all('*', (req, res) => {
   res.status(404)
   if(req.accepts('html')){
      res.sendFile(path.join(__dirname, 'views', '404.html'))
   }
   else if(req.accepts('json')){
      res.json({ success: false, messsage: 'resource not found' })
   }
   else{
      res.type('txt').send('404 not found')
   }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
      console.log('Database running')
      app.listen(PORT, () => console.log(`server listening on PORT: ${PORT}`))
   }
)
mongoose.connection.on('error', err => {
   console.log(err)
   logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})