const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const { updateUser } = require('../controllers/userController')

router.put('/change', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const sessionUser = req.user;
    const id = sessionUser._id;
    console.log(id);
  
    if (!sessionUser) {
      return res.status(403).send({
        message: 'Tu no deberías estar aquí'
      });
    }
  
    const isPasswordCorrect = bcrypt.compareSync(oldPassword, sessionUser.password);
  
    if (!isPasswordCorrect) {
      return res.status(401).send({
        message: "La contraseña actual es incorrecta, no puedes modificar tu contraseña"
      });
    } else {
      await updateUser(id, newPassword);
  
      res.send({
        message: "Se cambió la contraseña",
        newPassword: newPassword // Include the new password in the response
      });
    }
  });
  
  module.exports = router;
  
  

