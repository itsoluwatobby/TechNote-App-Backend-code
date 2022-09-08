const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
   {
      username: {
         type: String,
         requied: true
      },
      password: {
         type: String,
         requied: true
      },
      roles: [{
         type: String,
         default: 'Employee'
      }],
      active: {
         type: Boolean,
         default: true
      }
   }
)

module.exports = mongoose.model('User', userSchema)