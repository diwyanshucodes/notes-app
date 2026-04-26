const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/requireAuth');

// apply requireAuth to ALL notes routes
router.use(requireAuth);


// GET all notes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC', [req.user.userId])
        res.json({ notes: result.rows })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//GET one note by id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM notes WHERE id=$1 AND user_id = $2', [id,req.user.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({ note: result.rows[0] })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//POST create a note
router.post('/', async (req, res) => {

    try {
        const { title, body } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' })
        const result = await pool.query(
    'INSERT INTO notes(title,body,user_id) VALUES ($1,$2,$3) RETURNING *',[title,body,req.user.userId]);

    res.status(201).json({ note: result.rows[0] })
    } catch (err){
        res.status(500).json({error:err.message});
    }
    
})

//PUT update a note
router.put('/:id', async (req, res) => {
    try{
const { id } = req.params;
    const { title, body } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' })
    }
    const result = await pool.query(
        'UPDATE notes SET title = $1, body = $2 WHERE id=$3 AND user_id=$4 RETURNING * ',
        [title,body,id, req.user.userId]
    )
    if(result.rows.length === 0){
        return res.status(404).json({error:'Note not found'})
    }
    res.json({note: result.rows[0]})
    }catch(err){
        res.status(500).json({error:err.message});
    }
    
})


//DELETE a note
router.delete('/:id', async (req, res) => {
    try{

    const { id } = req.params;
    const result = await pool.query(
        'DELETE FROM notes WHERE id=$1 AND user_id=$2 RETURNING *',
        [id, req.user.userId]
    );
    if(result.rows.length === 0){
        return res.status(404).json({error:'Note not found'})
    }
    res.json({ message: `Note ${id} deleted` })
    } catch (err){
        res.status(500).json({error:err.message})
    }
}) 


module.exports = router;