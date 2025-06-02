const express = require('express');
const Notes = require('../models/Notes');
const fetchUser = require('../middleware/fetchuser');
const router = express.Router();
const {body,validationResult} = require('express-validator');

router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        console.log("Fetching all notes for user:", req.user.id);
        const notes = await Notes.find({ userId: req.user.id });
        res.json(notes);
    }
    catch (error) {
        console.error("Error fetching notes:", error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

);


router.post('/addnotes', fetchUser, [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
  
    
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { title, description } = req.body;
        const note = new Notes({
            title,
            description,
          
            userId: req.user.id
        });
        const savedNote = await note.save();
        res.json({ msg: 'Note added successfully', note: savedNote });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

router.put('/updatenotes/:id', fetchUser, async (req, res) => { 
    const { title, description,  } = req.body;
    const noteId = req.params.id;
    if (!title && !description  ) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    // Validate the note ID
    if (!noteId) {
        return res.status(400).json({ error: 'incomplete info' });
    }

    try {
        const note = await Notes.findById(noteId);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (req.user.id !== note.userId.toString()) {
            return res.status(403).json({ error: 'Access denied, unauthorized' });
        }

        // Update the note
        const updatedNote = await Notes.findByIdAndUpdate(
            noteId,
            {
                title: title || note.title,
                description: description || note.description,
       
                
            },
            { new: true }
        );

        res.json({ msg: 'Note updated successfully', note: updatedNote });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});


router.delete('/deletenotes/:id', fetchUser, async (req, res) => {
    const noteId = req.params.id;
    if (!noteId) {
        return res.status(400).json({ error: 'incomplete info' });
    }
    try {
        const note = await Notes.findById(noteId);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (req.user.id !== note.userId.toString()) {
            return res.status(403).json({ error: 'Access denied, unauthorized' });
        }

        await Notes.findByIdAndDelete(noteId);
        res.json({ msg: 'Note deleted successfully' });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

module.exports = router;