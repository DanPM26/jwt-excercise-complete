const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const { updateUser } = require('../controllers/userController')


//Parte del Login para poder acceder 
router.get('/yo', async(req,res)=>{
    const sessionUser = req.user
    
    if(!sessionUser){
        return res.status(403).send({
            message: 'Tu no deberías estar aquí'
        })
    }
    
    res.send({
        id: sessionUser._id,
        username: sessionUser.username,
        email: sessionUser.email
    })
})


// router.put('/:id', async(req, res) => {
//   const id = req.params.id;
//   const { oldPassword, newPassword } = req.body;
//   const sessionUser = req.user;

//   const isPasswordCorrect = bcrypt.compareSync(oldPassword, sessionUser.password);

//   if (!isPasswordCorrect) {
//     return res.status(401).send({
//       message: "La contraseña actual es incorrecta, no puedes modificar tu contraseña"
//     });
//   } else {

//     await updateUser(id, newPassword)
//    res.send({message:"Se cambió la contraseña"}, newPassword)
//   }

 
// });


router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  const sessionUser = req.user;
  console.log(sessionUser)
  console.log(req.permissions.includes(`admin:edit:${id}`))

  // Check if the user has the 'admin:edit:id' permission
  if (!req.permissions.includes(`admin:edit:${id}`)) {
   
    return res.status(403).send({
      error: 'No tienes permisos suficientes para editar este usuario'
    });
  }

  // Rest of the password update logic...
   const isPasswordCorrect = bcrypt.compareSync(oldPassword, sessionUser.password);  
   if (!isPasswordCorrect) {
    return res.status(401).send({
      message: "La contraseña actual es incorrecta, no puedes modificar tu contraseña"
    });
  } else {    await updateUser(id, newPassword)
   res.send({message:"Se cambió la contraseña"}, newPassword)
  }

});

//getdinamico 

// router.put('/change-password/:id', async(req,res)=>{
//   const {id} = req.params.id
//   const {oldPassword, newPassword } = req.body
//   const sessionUser = req.user;

//   const isPasswordCorrect = bcrypt.compareSync(oldPassword, sessionUser.password);

//   if(!isPasswordCorrect){
//     return res.status(401).send({
//       message: "La contraseña actual es interrecta"
//     })
//   }

//   try{

//     await updateUser(id, newPassword)
//     res.send({message:"Se cambió la contraseña"}, newPassword)

//   } catch(error){
//     console.error(error)
//   }
 
// })


// //Cambiar de contraseña
// router.put('/change-password', async (req, res) => {
//     console.log("Petición PUT")
//     const { oldPassword, newPassword } = req.body;
//     console.log(oldPassword,newPassword, "Cambio")
//     const sessionUser = req.user;
//     console.log(sessionUser,"user")

//     const isPasswordCorrect = bcrypt.compareSync(oldPassword, sessionUser.password);
//     if (!isPasswordCorrect) {
//       return res.status(401).send({
//         message: 'La contraseña actual es incorrecta',
//       });
//     }

//     sessionUser.password = bcrypt.hashSync(newPassword, 10);
//     await sessionUser.save();

//     res.send({
//       message: 'La contraseña se ha cambiado correctamente',
//     });
//   });

// 

// router.put('/change-password', async (req, res) => {
//     const { password, newPassword } = req.body;
//     const sessionUser = req.user;
  
//     try {
//       const isPasswordCorrect = bcrypt.compareSync(password, sessionUser.password);
  
//       if (isPasswordCorrect) {
//         sessionUser.password = bcrypt.hashSync(newPassword, 12);
//         await updateUser(sessionUser._id, password, newPassword);
  
//         res.status(201).send({
//           message: "Cambio de contraseña exitosa",
//         });
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   });
  
// router.put('/change-password', async (req, res) => {
//   const { password, newPassword } = req.body;
//   const sessionUser = req.user;

//   try {
//     const isPasswordCorrect = bcrypt.compareSync(password, sessionUser.password);

//     if (!isPasswordCorrect) {
//       return res.status(401).send({
//         message: 'La contraseña actual es incorrecta',
//       });
//     }

//     sessionUser.password = bcrypt.hashSync(newPassword, 12);
//     await updateUser(sessionUser._id, password, newPassword);

//     res.status(201).send({
//       message: "Cambio de contraseña exitosa",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       message: 'Ha ocurrido un error en el servidor',
//     });
//   }
// });

  


module.exports = router