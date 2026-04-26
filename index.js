const express = require('express');
const notesRouter  = require('./routes/notes')
const authRouter = require('./routes/auth');
const app = express();

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);

app.use((req,res)=>{
    res.status(404).json({error: `Route ${req.method} ${req.url} not found `})
})
app.use((err,req,res,next)=>{
    console.error(err);
    res.status(500).json({error:'something went wrong'})
})
app.listen(3000, ()=>{
    console.log('Server running on port 3000')
})