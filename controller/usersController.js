const User = require('../models/Users');
const Note = require('../models/Notes');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
   const users = await User.find().select('-password').lean()
   if(!users?.length) {
      return res.status(400).json({ success: false, message: 'No user found'})
   }
   res.json({ success: true, data: users})
})

// @desc create all users
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
   const { username, password, roles } = req.body

   if(!username || !password || !Array.isArray(roles) || !roles.length) {
      return res.status(400).json({ success: false, message: 'All fields are required'})
   }
   const duplicate = await User.findOne({ username }).lean().exec();
   if(duplicate) return res.status(409).json({ message: 'Duplicate Username'});

   const hashedPassword = await bcrypt.hash(password, 10);

   const userObject = { username, "password": hashedPassword, roles }
   const user = await User.create(userObject)

   if(user){
      res.status(201).json({ success: true, message: 'New user '+ username +' created'})
   }else{
      return res.status(400).json({ success: false, message: 'Invalid user data received'})
   }
})

// @desc update all users
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
   const { id, username, password, roles, active } = req.body;

   if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'All fields are required'})
   }

   const user = await User.findById(id).exec()
   if(!user){
      return res.status(400).json({ success: false, message: 'User not found'})
   }

   const duplicate = await User.findOne({ username }).lean().exec();
   if(duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: 'Duplicate Username'});   
   }
   user.username = username;
   user.roles = roles;
   user.active = active;

   if(password){
      user.password = await bcrypt.hash(password, 10)
   }

   const updatedUser = await user.save()
      res.status(201).json({ success: true, message: `User ${updatedUser.username} updated`})
})

// @desc delete all users
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
   const { id } = req.body
   if(!id) {
      return res.status(400).json({ success: false, message: 'User id required'})
   }

   const note = await Note.findOne({ user: id }).lean().exec()
   if(note) {
      return res.status(400).json({ success: false, message: 'User has assigned notes'})
   }

   const user = await User.findById(id).exec()
   if(!user) {
      return res.status(400).json({ success: false, message: 'User not found'})
   }

   const result = await user.deleteOne()
   const reply = `Username ${result.username} with ID ${result._id} deleted`
   return res.status(200).json({ success: true, data: reply})
})


module.exports = { getAllUsers, createNewUser, updateUser, deleteUser }
