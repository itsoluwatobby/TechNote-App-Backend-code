const User = require('../models/Users');
const Note = require('../models/Notes');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

// @desc Get all Notes
// @route GET /Notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
   const notes = await Note.find().lean()
   if(!notes?.length) {
      return res.status(400).json({ success: false, message: 'No Note found'})
   }

   const notesWithUser = await Promise.all(notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec()
      return { ...note, username: user.username }
  }))
   res.json({ success: true, data: notesWithUser})
})

// @desc create all Notes
// @route POST /Notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
   const { user, title, text } = req.body

   if(!user || !title || !text) {
      return res.status(400).json({ success: false, message: 'All fields are required'})
   }
   //verify userId
   const noteUser = await User.findById(user).exec();
   if(!noteUser) return res.status(400).json({ message: `User not found`});

   const duplicate = await Note.findOne({ title }).lean().exec();
   if(duplicate) return res.status(409).json({ message: 'Duplicate Title. Choose a new title'});

   const noteObject = { user, title, text, completed: true }
   const note = await Note.create(noteObject)

   if(note){
      res.status(201).json({ success: true, message: `Note with Title: (${note.title}) successfully created`})
   }else{
      return res.status(400).json({ success: false, message: 'Invalid Note data received'})
   }
})

// @desc update all Notes
// @route PATCH /Notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
   const { noteId, title, text } = req.body;

   if(!noteId || !title || !text) {
      return res.status(400).json({ success: false, message: 'All fields are required'})
   }

   const note = await Note.findById(noteId).exec()
   if(!note){
      return res.status(400).json({ success: false, message: 'Note not found'})
   }
   // const duplicate = await Note.findOne({ title, text }).lean().exec();
   // if(duplicate && duplicate?._id.toString() !== id) {
   //    return res.status(409).json({ message: 'Duplicate title or text'});   
   // }
   note.title = title;
   note.text = text;

   const updatedNote = await note.save()
      res.status(201).json({ success: true, message: `Note with Title ${updatedNote.title} updated`})
})

// @desc delete all Notes
// @route DELETE /Notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
   const { noteId } = req.body
   if(!noteId) {
      return res.status(400).json({ success: false, message: `Note Id required`})
   }
   // const note = await Note.findOne({ _id: noteId }).lean().exec()
   // if(note) {
   //    return res.status(400).json({ success: false, message: 'Note has assigned notes'})
   // }
   const note = await Note.findById(noteId).exec()
   if(!note) {
      return res.status(400).json({ success: false, message: `Note with ${noteId} not found`})
   }

   const result = await note.deleteOne()
   const reply = `Note with title: ${result.title} successfully deleted`
   return res.status(200).json({ success: true, data: reply})
})


module.exports = { getAllNotes, createNewNote, updateNote, deleteNote }
