const express = require('express')
const router = express.Router()



//Parte del Login para poder acceder 
router.get('/me', async(req,res)=>{
const sessionUser = req.user

if(!sessionUser){
    return res.status(403).send({
        message: 'Tu no deberías estar aquí'
    })
}

res.send({
    username: sessionUser.username,
    email: sessionUser.email
})
})



module.exports = router