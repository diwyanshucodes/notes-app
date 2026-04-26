const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');


const router = express.Router();

//POST /api/auth/register
router.post('/register' , async(requestAnimationFrame,res)=>{
    try{
        const {email,password}=requestAnimationFrame.body;
        if(!email || !password){
            return res.status(400).json({error:'email and password required'});
        }

        //check if email already taken
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        if(existing.rows.length > 0 ){
            return res.status(400).json({error:'email already in use'});
        }

        //hash password: saltRounds=10
        const password_hash = await bcrypt.hash(password,10);

        //save password to db
        const result = await pool.query(
            'INSERT INTO users (email,password_hash) VALUES ($1,$2) RETURNING id, email, created_at ',
            [email,password_hash]
        )

        res.status(201).json({user:result.rows[0]});

    } catch (err){
        res.status(500).json({error: err.message});
    }
})

//POST /api/auth/login
router.post('/login', async (req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password) return res.status(400).json({error: 'email and password required'});

        //find user by email
        const result = await pool.query(
            'SELECT * FROM users where email = $1',
            [email]
        );
        if(result.rows.length === 0) return res.status(400).json({error:'Invalid credentials'});

        const user= result.rows[0];

        //compare password with stored hash
        const match = await bcrypt.compare(password, user.password_hash);
        if(!match) return res.status(401).json({error: 'Invalid credentials'});

        //generate jwt
        const token = jwt.sign(
            {userId: user.id, email:user.email},
            process.env.JWT_SECRET,
            { expiresIn: '7d'}
        );

        res.json({token})

    } catch (err){
        res.status(500).json({error: err.message});
    }
})

module.exports = router;