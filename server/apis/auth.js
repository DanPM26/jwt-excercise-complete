const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')

const userService = require('../services/users')
const userModel = require('../models/users')
const authService = require('../services/auth')

require('dotenv').config()

const UserService = new userService(userModel)
const AuthService = new authService(UserService)
const JWT_SECRET = process.env.JWT_SECRET_PS



router.post('/login', async(req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await AuthService.login(email, password);
  
      let userRole;
  
      if (user.role === 'admin'){
        if(await bcrypt.compare(password, user.password)){
          userRole = {
            ...user,
            role: 'admin',
            permissions: ['admin:yo', 'pass:change']
          };
        }
      } else {
        if(await bcrypt.compare(password, user.password)){
          userRole = {
            ...user,
            role: 'usuario',
            permissions: ['users:me', 'pass:change']
          };
        }
      }
  
      const token = jwt.sign({
        data: userRole,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      }, JWT_SECRET);
  
      res.send({
        _id: user._id,
        role: user.role,
        token
      });


    } catch (error) {

      console.error(error);
      res.status(401).send({
        message: error.message
      });

    }

  });
  

module.exports = router