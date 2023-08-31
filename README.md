# Backend Login

1. Inicia creando una carpeta donde contendrá tu proyecto backend login 
2. Crea un package.json porque descargaremos varias dependencias 
3. Las dependencias a ocupar son : 
- express
- nodemon -D
- cors 
- mongoose 
- bcrypt
- jsonwebtoken 
4. Instancia el servidor con sus respectivos puertos dentro del archivo index.js
``` Javascript
index.js 

const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
require('./db/mongodb')

app.use(express.json())
app.use(cors())


app.get('/', (req,res)=>{
    res.send('Servidor vivo')
})

const PORT = process.env.PORT || 4001
app.listen(PORT, ()=>{
    console.log(`Servidor conectado en ${PORT}`)
})
```
5. Una vez instanciando el puerto, configurando el arranque de nodemon desde el package.json. Crea una carpeta donde contendra un archivo (usualmente llamada db) que contendrá un archivo con nombre mongodb.js
6. Agrega tus credencial para contectarte a la base de datos de Mongodb 
7. En tu carpeta raíz añade una nueva carpeta con el nombre Model. Dentro de esta carpeta, añade un archivo con el nombre de esquema de datos vas a manejar. En este ejemplo le colocaré el nombre de 'users.js'
``` Javascript
Model > users.js
const mongoose = require('mongoose')
const {Schema, model}= mongoose;

const userSchema = new Schema({
    name:{
        type: String,
        required:true
    },
    lasname: {
        type: String
    },
    username: {
        type: String,
        required:true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
},{
    versionKey: false,
    timestamps: true
})


const userModel = model('usuarios', userSchema)

module.exports= userModel
```
8. Una vez añadido el modelaje y que la base de datos este correctamente conectada. Crea dentro de la carpeta raíz de tu proyecto una carpeta llamada Services (recuerda que es similar a los controlladores, solo que aquí se provee el servicio de almacenar los datos de usuario).
9. Dentro de esta carpeta contendra un archivo llamado users.js
10. Dentro de este archivo Services > users.js. Instancia una clase constructora, el cúal se va a encargar de crear y guardar los usuarios dentro de tu base datos. 
``` Javascript
services > user.js

const userService = class {
    constructor(userModel){
        this.Model = userModel
    }
    async create(userData){
        const newUser = new this.Model(userData)
        await newUser.save()
        //delete newUser.password
        return newUser.toObject()
    }
}

module.exports = userService
```
11. Una vez realizado la clase constructora de usuarios, crea una carpeta llamada 'apis' y un archivo llamado 'users.js'. Esta contendrá el ruteo de tus endpoints. No te olvides instanciar la clase que acabamos de crear en: Services > users.js, a su vez de enviar los datos de tus rutas con un model.exports, añadidas en un archivo index.js dentro de esta misma carpeta.
``` Javascript
apis > users.js 

const userModel = require('../models/users')
const userService = require('../services/users')

const UserService = new userService(userModel)

router.post('/', async(req,res)=>{
    const body = req.body
    const user = await UserService.create(body)
    console.log(user)
    res.status(200).send(user)
})

module.exports = router
```

``` Javascript
apis > index.js 
const express = require('express')
const router = express.Router()

const userRouter = require('./users')
router.use('/users', userRouter)

module.exports = router
```
12. Localiza tus rutas en el archivo index.js de tu carpeta raíz. No te olvides  que estas rutas las colocas dentro de un middleware el cúal las localizara a todas bajo una ruta es decir: 
``` Javascript
index.js 

const apiRouter = require('./apis')
app.use('/api/v1', apiRouter)
```
13. Realiza las pruebas en tu postman 

## Creación de usuarios: Generar Token y verificar token

14. Una vez comprobado que la ruta y el almacenamiiento de datos esté correcto, se añade al Model la encriptación de datos a través de la libreria de bcrypt 
``` Javascript
Model > users.js 

const bcrypt = require('bcrypt')

userSchema.pre('save', function(next){
 console.log('------>',this.email, this.password)
 const hashedPassword = bcrypt.hashSync(this.password, 12)
 this.password = hashedPassword

 next()
})

const userModel = model('users', userSchema)
module.exports = userModel

```
15. Probamos en consola
16. Ahora, crearemos un archivo  'auth.js', el cúal contendra el código que nos autenticara a lxs usuarixs 
``` Javascript
Services > auth.js

const bcrypt = require('bcryptjs')

const authService = class{
    constructor(userService){
        this.UserService = userService
    }

    async login(email,password){
        const user = await this.UserService.getByEmail(email)

        if(!user){
            throw new Error(`Este usuario no existe`)
        } else if(await bcrypt.compare(password, user.password) || !user){
            return user.toObject();
        } else {
            throw new Error('Inautorizado')
        }
    }
}

module.exports = authService
```
17. No te olvides de regresar a tu archivo Services > users para anexar el getByEmail que vamos a utilizar en el archivo siguiente. Quedando de la siguiente manera: 
``` Javascript

services > user.js

const userService = class {
    constructor(userModel){
        this.Model = userModel
    }

    getByEmail(email){
        return this.Model.findOne({email})
    }

    async create(userData){
        const newUser = new this.Model(userData)
        await newUser.save()
        //delete newUser.password
        return newUser.toObject()
    }
}

module.exports = userService
```

17. Crea un archivo 'auth.js' en tu carpeta apis. Ya que se añadira la autenticación a la ruta 

``` Javascript 
apis > auth.js

const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()

const userService = require('../services/users')
const userModel = require('../models/users')
const authService = require('../services/auth')

require('dotenv').config()


const UserService = new userService(userModel)
const AuthService = new authService(UserService)
const JWT_SECRET = process.env.JWT_SECRET_PS

router.post('/login', async(req,res)=> {
    
    const {email, password} = req.body
    console.log(req.body)
    try{
        const user = await AuthService.login(email,password)
        console.log(user)
        
           let userRole;
 if (user.role === 'admin') {
        if (await bcrypt.compare(password, user.password)) {
           userRole = {
             ...user,
             role: 'admin',
             // rutas del admin y el cambio de contraseña que eventualmente agregaremos
             permissions: ['admin:yo']
           };
        }
      } else {
        if (await bcrypt.compare(password, user.password)) {
          userRole = {
            ...user,
            role: 'usuario',
            permissions: ['users:me']
          };
        }
      }
        const token = jwt.sign({
            data:  userRole,
            exp:  Math.floor(Date.now() / 1000) + (60 * 60)
        }, JWT_SECRET)
        
        res.send({
        _id: user._id,
        token
        })

        } catch(error){
            console.error(error)
            res.status(401).send({
                message: error.message
            })
        }

})


module.exports = router
```
18. Prueba en consola  que aparezca el _id y el token encriptado 

## Autorización 

19. Crea una carpeta 'Middlewares' con un archivo llamado 'authorization.js'
``` Javascript

middleware > autorization.js 

const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET_PS

const authMiddleware = (req,res, next)=>{
    const { authorization } = req.headers 
    console.log(req.headers)
    const token = authorization.split(' ')[1];
 
    try{
     const decoded = jwt.verify(token, JWT_SECRET)
     req.user = decoded.data
     req.permissions = decoded.data.permissions
     const url = req.url.replace(/\//g, ':').slice(1)
     if(req.user.permissions.indexOf(url) === -1){
         return res.status(403).send({
             error: 'tu no pasas, no tienes permisos'
         })
     }
 
     next()
    } catch(error){
  return res.status(403).send({
     error: error.message
  })
    }
 }

module.exports= authMiddleware
```
20. Regresa a tu archivo index.js donde importaras el archivo 'authMiddleware' el cúal lo añadiras como middleware en tu archivo apis > index.js
``` Javascript
apis > index.js

const userRouter = require('./users')
const authRouter = require('./auth')
const authMiddleware = require('../middleware/authorization')
router.use('/auth', authRouter)

router.use(authMiddleware)
router.use('/users', userRouter)
```

20. Para probar la validación del token regresa al archivo apis > user.js
``` Javascript
apis > user.js 

const express = require('express')
const router = express.Router()
const userModel = require('../models/users')
const userService = require('../services/users')

const UserService = new userService(userModel)

router.get('/me', async(req,res)=>{
    const sessionUser = req.user 

    if(!sessionUser){
        return res.status(403).send({
            message: 'Tu no deberías de estar aqui'
        })
    }

    res.send({
        name: sessionUser.name,
        email: sessionUser.email
    })
})


router.post('/', async(req,res)=>{
    const body = req.body
    const user = await UserService.create(body)
    console.log(user)
    res.status(200).send(user)
})

module.exports = router
```
21. Prueba la autorización en el postman 

## ¡Haz la prueba!
 ## No te olvides que las rutas son estas: 
  ```
  //Acceder al login:
  http://localhost:4003/api/v1/auth/login

  //Verificación del login
  http://localhost:4003/api/v1/users/me
  ```
  ## Autenticación 
  1. Trabajando con este mismo ejercicio para anexar la autenticación se utiliza la paqueteria: moongose-unique-validator
 
``` Javascript
    models > users.js

    const uniqueValidator = require('mongoose-unique-validator')

    
const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },

{
    versionKey: false,
    timestamps: true
})

    //se agrega la validación 
userSchema.plugin(uniqueValidator, {message: 'El email ya existe'})


userSchema.pre('save', function(next){
   console.log('----------->', this.email,this.password)
   const hashedPassword = bcrypt.hashSync(this.password,12)
   this.password = hashedPassword

   next()
})

const userModel = model('usuarios', userSchema)

module.exports= userModel 
```
 Se puede verificar esta validación de que el email ya existe

2. En el archivo auth.js > services, modificamos el constructor para comparar las contraseñas
```Javascript
auth.js > services
const bcrypt = require('bcrypt')

const authService = class{
    constructor(userService){
        this.UserService = userService
        this.bcrypt = bcrypt
    }

    async login(email,password){
        const user = await this.UserService.getByEmail(email)
        console.log("Usuario recuperado: ", user);

        // Comparación de contraseñas
        if (user) {

            const isPasswordMatch = await this.bcrypt.compare(password, user.password);
      
            if (isPasswordMatch) {
              return user.toObject();
            } else {
              throw new Error('La contraseña es incorrecta');
            }
          } else {
            throw new Error('El usuario no existe');
          }
        
        
    }    
}

module.exports = authService
```
3. Modificamos la ruta del login donde se reciba la efectiva comparación de contraseñas
 ``` Javascript
 apis > auth.js 
 const bcrypt = require('bcrypt')

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
            //Agregar ruta de cambio de contraseña
            permissions: ['admin:yo', 'pass:change']
          };
        }
      } else {
        if(await bcrypt.compare(password, user.password)){
          userRole = {
            ...user,
            role: 'usuario',
            // agregar ruta de cambio de contraseña
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
 ```
 4. Crea un controlador para realizar la edición de la contraseña por una nueva

 ```Javascript
 controllers > userController.js 

const userModel = require('../models/users')
const bcrypt = require('bcrypt');

  
const updateUser = async(id, updatePassword) =>{
  const upDate = { password: bcrypt.hashSync(updatePassword, 12) };

  const result = await userModel.findByIdAndUpdate({ _id: id }, upDate, {
    upsert: false,
    new: true
  });

  return result;
};

module.exports = {
    updateUser
}
 ```
 5. Crea un nuevo archivo dentro de apis > password.js para agregar la logica del cambio de contraseñas
 ``` Javascript
 apis > password.js

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
 ```
 ``` Javascript
 apis > index.js

 const express = require('express')
const router = express.Router()
const userRouter = require('./user')
const authRouter = require('./auth')
const authMiddleware = require('../middleware/authorization')
const registerRouter = require('./register')

//admin
const adminRouter = require('./admin')
// password
 const passwordRouter = require('./password')
//products
const productsRouter = require('./products')
router.use('/products', productsRouter)

router.use('/auth', authRouter)
router.use('/register', registerRouter)



router.use(authMiddleware)
router.use('/users', userRouter)
router.use('/admin', adminRouter)
router.use('/pass', passwordRouter)


module.exports = router
 ```
  ## Realiza las pruebas de autenticación
 ```
 // Cambio de contraseña
 http://localhost:4003/api/v1/auth/login

 // Recuerda en la petición se anexa: 
 - Authorization: Bearer `token`
 - Body: {
    "oldPassword":"huir",
    "newPassword": "Laislacenteno"
 } 
 ```
4. FRONTEND
``` jsx
components > ChangePassword.js

import React from 'react'
import { useContext } from 'react'
import { UserContext } from '../context/UserContext';
import { Col, Container, Row, Form, Button } from 'react-bootstrap'
import axios from 'axios';

const ChangePassword = () => {
    const {userData, setUserData} = useContext(UserContext)
   

    const changePassword = async () => {
        const url = 'http://localhost:4003/api/v1/change'
        const result = await axios.put(url, userData)
        console.log(result)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setUserData({
          ...userData,
          [name]: value
        })
        console.log(userData)
      }

  return (
    <Container>
    <Row>
      <Col md={12}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" onChange={handleChange} name="email" placeholder="Enter email" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" onChange={handleChange} name="password" placeholder="Password" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label> New Password</Form.Label>
            <Form.Control type="password" onChange={handleChange} name="newPassword" placeholder="Password" />
          </Form.Group>
          <Button variant="primary" type="button" onClick={() => changePassword()}>
            Submit
          </Button>
        </Form>
      </Col>
    </Row>
  </Container>
  )
}

export default ChangePassword
```
5. Agregamos el Provider 
``` jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import FormUser from './components/FormUser'
import LoginForm from './components/LoginForm'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Profile from './components/Profile'
import UserProvider from './context/UserContext'
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import ChangePassword from './components/ChangePassword'
import Admin from './components/Admin'
import { ProductProvider } from './context/ProductContext'

const router = createBrowserRouter([
  {
    path: "/",
    element:(<ProductProvider><App /></ProductProvider>) ,
  },
  {
    path: "/sign-up",
    element: (
      <UserProvider>
        <PayPalScriptProvider options={{ "client-id": "AVfU3m6npRpMW9LPnJylKbsHIocAXqvvkwsL-Fq4BlEf7E9wwuWfRY1ya8Tf_myL-sP95DAz7xlapfTV",
      components: "buttons",
      currency: "USD" }} >
          <FormUser />
        </PayPalScriptProvider>
      </UserProvider>
    ),
  },
  {
    path: "/login",
    element: (
      <UserProvider>
        <PayPalScriptProvider>
          <LoginForm />
        </PayPalScriptProvider>
      </UserProvider>
    ),
  },
  {
    path: "/profile",
    element: (
      <UserProvider>
        <PayPalScriptProvider>
          <Profile />
        </PayPalScriptProvider>
      </UserProvider>
    ),
  },
{
  path:'/admin',
element: (<UserProvider>
  <ProductProvider>
    <Admin />
    </ProductProvider>
    </UserProvider>)
},
  {
    path: "/changePassword",
    element: (
      <UserProvider>
          <ChangePassword/> 
      </UserProvider>
    ),
  }
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>

)
```

# Context API
Basandonos en el ejemplo anterior, nos localizaremos en el proyecto Vite-React para realizar la conexión de nuestro back-end con el front-end.

1. Crea una carpeta components donde crearas un archivo LoginForm.jsx

``` jsx

components > LoginForm.jsx
import React from 'react'
import axios from 'axios'
import { Col, Container, Row, Form, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";


const LoginForm = () => {

// instanciamos los estados como comunmente los declaramos
 const [userData, setUserData] = useState()

// Creamos la lógica de los botones
  const url = 'http://localhost:4003/api/v1/auth/login'
  const url2 = 'http://localhost:4003/api/v1/users/me'
  const navigation = useNavigate()

  const handleSubmit = () => {
    console.log(userData)
    axios.post(url, userData)
      .then(res => {
        console.log(res.data)
        return (
          axios.get(url2, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              Authorization: `Bearer ${res.data.token}`
            }
          }).then(response => {
            console.log(response.data)
            setUserData(response.data)
            // ruta a profile
            navigation('/profile')
          })
        )
      })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value
    })
    console.log(userData)
  }
  return (
    <Container>
      <Row>
        <Col md={12}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" onChange={handleChange} name="email" placeholder="Enter email" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" onChange={handleChange} name="password" placeholder="Password" />
            </Form.Group>
            <Button variant="primary" type="button" onClick={() => handleSubmit()}>
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default LoginForm

```

2. Instanciamos la ruta a /profile
 ``` jsx
 import React from 'react'

  const Profile = () => {
    return (
      <div>
       Bienvenido a tu perfil! 
      </div>
    )
  }
  
  export default Profile
 ```
3. Si todo marcha bien, nos digimos a instanciar el CONTEXT API

## Aplicación del Context API
4. Dentro de la carpeta src, creamos una subcarpeta llamado context con un archivo denominado UserContext.jsx

 ``` jsx
 context > UserContext.jsx
 import React, { createContext, useState } from 'react'

export const UserContext = createContext({});

const UserProvider = ({children}) => {
    // Declaramos el estado que recibe los datos de usuario
    const [userData,setUserData] = useState({})

    // Una función para salir de la sesión 
    const logout = () => {
      setUserData(null)
    }

  return (
    <div>
      <UserContext.Provider value={{userData,setUserData,logout}}>
        {children}
      </UserContext.Provider>
    </div>
  )
}

export default UserProvider
 ```

 5. Recuerda que para la palicación del provider también tenemos que modificar las rutas, y se puede hacer de cualquiera de las siguientes formas: 
 ``` jsx
 import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import FormUser from './components/FormUser'
import LoginForm from './components/LoginForm'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Profile from './components/Profile'
import UserProvider from './context/UserContext'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/sign-up",
    element: (
      <UserProvider>
          <FormUser />
      </UserProvider>
    ),
  },
  {
    path: "/login",
    element: (
      <UserProvider>
          <LoginForm />
      </UserProvider>
    ),
  },
  {
    path: "/profile",
    element: (
      <UserProvider>
          <Profile />
      </UserProvider>
    ),
  }
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

 ```
o 
``` jsx
// Falta anexar el códigos
 ```
 ## Agregar e Context API 

 ```jsx
 componets > LoginForm.jsx

import { UserContext } from '../context/UserContext';

 const LoginForm = () =>{
 const {userData, setUserData} = useContext(UserContext)
 }
  
 ```

``` jsx
components > Profile

import React from 'react'
 import { useContext } from 'react'
 import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import Checkout from './Checkout/BtnCheckout'


  const Profile = () => {
    
    const { userData, logout } = useContext(UserContext)
     const navigation = useNavigate()

    const handleLogout = () => {
      logout()
      navigation('/')
    }
  
    return (
      <div>
        {userData ? (
          <div>
            <p>Bienvenido!</p>
            <h3>{userData.username}</h3>
            <Checkout />
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        ) : (
          <p>No estás logueado</p>
        )}
      </div>
    )
  }
  
  export default Profile
 ```

 ## Consumiendo API 
1. Una vez creada la lógica, el archivo auth.js se debe de ver así, ya que en este ejercicio agregaremos los permisos para el admin y sus respectivas rutas

``` Javascript
apis > auth.js

const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()

const userService = require('../services/user')
const userModel = require('../model/users')
const authService = require('../services/auth')

require('dotenv').config()

const bcrypt = require('bcrypt')

const UserService = new userService(userModel)
const AuthService = new authService(UserService)
const JWT_SECRET = process.env.JWT_SECRET_PS

router.post('/login', async(req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await AuthService.login(email, password);
  
      let userRole;
 if (user.role === 'admin') {
        if (await bcrypt.compare(password, user.password)) {
           userRole = {
             ...user,
             role: 'admin',
             // rutas del admin y el cambio de contraseña que eventualmente agregaremos
             permissions: ['admin:yo']
           };
        }
      } else {
        if (await bcrypt.compare(password, user.password)) {
          userRole = {
            ...user,
            role: 'usuario',
            permissions: ['users:me']
          };
        }
      }

      const token = jwt.sign({
        data: userRole,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      }, JWT_SECRET);
  
      res.send({
        _id: user._id,
        // Agregar role para que devuelva en la petición
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
```
2. Completamos la ruta para el admin 

``` Javascript
apis > admin.js

const express = require('express')
const router = express.Router()

router.get('/yo', async(req,res) =>{
    const sessionUser = req.user

 if(!sessionUser){
    return res.status(403).send({
        message: 'Dewee esa no es tu familia' // tu no deberías estar aquí
    })
 }

 res.send({
    name: sessionUser.name,
    email: sessionUser.email
 })

})

module.exports = router
```
3. Una vez completada las rutas, anexamos a apis > index.js
``` Javascript
const express = require('express');
const router = express.Router();
const userRouter = require('./user');
const authRouter = require('./auth')
const authMiddleware = require('../middlewares/authorization')
const registerRouter = require('./register')
const adminRouter = require('./admin')
const productRouter = require('./products')
const passwordRouter = require('./passwordChange')

router.use('/products', productRouter)

router.use('/auth', authRouter);
router.use('/register',registerRouter  )

router.use(authMiddleware)
router.use('/users', userRouter);
// Ruta admin
router.use('/admin', adminRouter); 

module.exports = router;
```
4. Y anexamos un último requerimiento en el model de Users 
``` Javascript
model > users.js
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const {Schema, model} = mongoose

const userSchema = new Schema({
    name: {
        type: String, 
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require:true
    },
    // agregamos el role
    role: {
        type: String
    }
},{
    versionKey: false,
    timestamps: true
})


userSchema.pre('save', function(next){
    console.log('--------->', this.email, this.password)
    const hashedPassword = bcrypt.hashSync(this.password,12)
    this.password = hashedPassword
    next()
})


const userModel = model('usuarios', userSchema)
module.exports = userModel

```
5. Probamos! 

 ```
 // Registrar
  http://localhost:4003/api/v1/register

  //Acceder al login:
  http://localhost:4003/api/v1/auth/login

  //Verificación del login
  http://localhost:4003/api/v1/admin/yo

  ```

  6. Si todo funciona correctamente agregamos ruta a productos

``` Javascript
 model > products.js

const moongose = require('mongoose')
const {Schema,model} = moongose

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    }
},{
    versionKey: false,
    timestamps:true
})

const ProductModel = model('products', productSchema)

module.exports = ProductModel

```
7. Agregamos los controladores de Products creando una carpeta con el mismo nombre "Controllers" 
``` Javascript
controllers > productController.js

const ProductModel = require('../model/products')

const getProducts = async() =>{
    const products = await ProductModel.find({});
    return products
}

const getProductByID = async(_id) =>{
    return await ProductModel.findById(_id);
}

const createProduct = async(product) =>{
    const newProduct = new ProductModel(product)
    return newProduct.save()
}

const updateProduct = async(_id,product) =>{
    return ProductModel.findByIdAndUpdate({_id}, product,{
        upsert: false,
        new: true
    })
}

const deleteProduct = async(_id) =>{
    return await ProductModel.findByIdAndDelete(_id)
}

module.exports ={
    getProducts,
    getProductByID,
    createProduct,
    updateProduct,
    deleteProduct
}
```
```Javascript
controllers > index.js
const productsController = require('./productController')

module.exports ={
    productsController
}
```
8. Agregamos la ruta  en la carpeta apis
```Javascript
apis > product.js

const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const {productsController} = require('../controllers')

const {
    getProducts,
    getProductByID,
    createProduct,
    updateProduct,
    deleteProduct
} = productsController

router.get('/', async(req,res) =>{
    const products = await getProducts()
    res.send(products)
})

router.get('/:id', async(req,res)=>{
    const product = await getProductByID(req.params.id)
    res.send(product)
})

router.post('/', async(req,res) =>{
    const body = req.body

    try {
    const newProduct = await createProduct(body)
    res.status(201)
    res.send(newProduct)
    } catch (error) {
        if( error instanceof mongoose.Error.ValidationError){
            res.status(400)
            return res.send({
                message: 'Error de validación',
                reason: error.message
            })
        }
      res.status(500)
      return res.send({
        message: error.message
      })
    }
  // revisar status 500: Error interno de servidor 500
})

router.put('/:id', async(req,res) =>{
  const body = req.body  
  const {id} = req.params
  const product = await updateProduct(id, body)
  if(!product) {
    res.status(404)
    return res.send({
        message: "Producto no fue encontrado"
    })
  }
  res.send(product)
})

router.delete('/:id', async(req,res)=>{
    const{id} = req.params;
    const result = await deleteProduct(id)
    res.send(result)
})

module.exports = router
```
9. Agregamos a index.js 
``` Javascript
const productRouter = require('./products')
router.use('/products', productRouter)
```
10. FRONTEND
 Una vez que nuestras rutas funcionen correctamente, agregamos en components > LoginForm.jsx, la ruta hacia el admin

 ``` jsx
components > LoginForsm.jsx

import React, { useContext} from 'react'
import axios from 'axios'
import { Col, Container, Row, Form, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import { UserContext } from '../context/UserContext';


const LoginForm = () => {
// const [userData, setUserData] = useState()
  //Una vez creado el context, lo instanciamos

  const {userData, setUserData} = useContext(UserContext)
  
  const url = 'http://localhost:4003/api/v1/auth/login'
  const url2 = 'http://localhost:4003/api/v1/users/me'
  // URL del admin
  const url3 = 'http://localhost:4003/api/v1/admin/yo'
  const navigation = useNavigate()


  const handleSubmit = () => {
    console.log(userData);
    axios.post(url, userData)
      .then(res => {
        console.log("data",res.data);
        // desestructuración de la admin y acceso al rol
        const { token, role } = res.data;
        const isAdmin = role === 'admin';      
 
         // Condicional
        axios.get(isAdmin ? url3 : url2, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            Authorization: `Bearer ${token}`
          }
        }).then(response => {
          console.log("responsedata",response.data);
         // Capturamos la actualización y devolución de datos
          const { username, email } = response.data;

          const userDataUpdated = { token,username, email };

          setUserData(userDataUpdated);
          
          // Que redirija a los respectivos perfiles
          if (isAdmin) {
            navigation('/admin');
          } else {
            navigation('/profile');
          }
        });
      });
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value
    })
    console.log(userData)
  }
  return (
    <Container>
      <Row>
        <Col md={12}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" onChange={handleChange} name="email" placeholder="Enter email" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" onChange={handleChange} name="password" placeholder="Password" />
            </Form.Group>
            <Button variant="primary" type="button" onClick={() => handleSubmit()}>
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default LoginForm
  ``` 
11. Agregamos contexto del admin através del Contexto que habiamos creado 

``` jsx
import React, { useContext, useEffect } from 'react'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const Admin = () => {

// Contexto Users
    const { userData, logout } = useContext(UserContext)
    const navigation = useNavigate()
    
 
  //-----Cerrar sesión
    const handleLogout = () =>{
        logout()
        navigation('/')
    }

  return (
    <div>
      {
        userData ? (
            <div>
              <p>Bienvenido Admin!</p>
              <h3>{userData.username}</h3>
            </div>
          ) : (
            <p>No estás logueado</p>
          )
      }
    </div>
  )
}

export default Admin
```
12. Creamos contexto de Products
``` jsx
import React, { createContext, useState } from 'react'


export const ProductContext = createContext()

export const ProductProvider = ({children}) => {

    const [formProducts, setFormProducts] = useState({
        name: "",
        description:"",
        price: 0,
        category: "",
        sku:"",
        image:""
    })

    const [products, setProducts] = useState([])

    return (
        <ProductContext.Provider value={{products, setProducts,formProducts, setFormProducts}}>
        {children}
       </ProductContext.Provider>
    )
}
``` 
13. Completamos ejercicio
``` jsx
import React, { useContext, useEffect } from 'react'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { Col, Container, Row, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import { ProductContext } from '../context/ProductContext'
import Image from 'react-bootstrap/Image';
import Table from 'react-bootstrap/Table';

const Admin = () => {

    const { userData, logout } = useContext(UserContext)
    const navigation = useNavigate()
    
  //Productos
    const {products, setProducts,formProducts, setFormProducts} = useContext(ProductContext)

    
    const LimpiarForm = () =>{
      setFormProducts({
        name: "",
        description: "",
        price: 0,
        category: "",
        sku: "",
        image: ""
      });
    } 

  // ---------- Obtener datos
  const getProducts = async () => {
    const url = 'http://localhost:4003/api/v1/products';
    const response = await axios.get(url);
    setProducts(response.data);
    console.log('get', response.data);
  };

    //------ Publicar productos
    const PostProducts = async() =>{

      const productData = {
        name: formProducts.name,
        description: formProducts.description,
        price: formProducts.price,
        category: formProducts.category,
        sku: formProducts.sku,
        image: formProducts.image
      }

      const url = 'http://localhost:4003/api/v1/products'
      const response = await axios.post(url,productData)
      console.log(response.data)
      getProducts()
      LimpiarForm()
    }

    //----- Editar Elemento
    const EditProduct = async(id) =>{
      const url = `http://localhost:4003/api/v1/products/${id}`;
      const response = await axios.get(url)
     const productEdit = response.data 
      
     setFormProducts({
      name: productEdit.name,
      description: productEdit.description,
      price: productEdit.price,
      category: productEdit.category,
      sku: productEdit.sku,
      image: productEdit.image
     })

      const newProductEdit ={
      name: formProducts.name,
         description: formProducts.description,
         price: formProducts.price,
         category: formProducts.category,
         sku: formProducts.sku,
        image: formProducts.image
      }

     axios.put(url, newProductEdit);

     getProducts();
     LimpiarForm();
    }

    //---Borrar elemento
  const deleteProduct = async(id) =>{
     const url = `http://localhost:4003/api/v1/products/${id}`
    const response = await axios.delete(url)
     console.log(response)
     getProducts();
  }

  useEffect(()=>{
    getProducts()
  },[])

  //-----Cerrar sesión
    const handleLogout = () =>{
        logout()
        navigation('/')
    }

 //------ Botón hacia cambiar de sesión
 const handleChangePassword = () =>{
  navigation('/changePassword')
 }
 console.log("userData",userData)
  return (
    <div>
      {
        userData ? (
            <div>
              <p>Bienvenido Admin!</p>
              <h3>{userData.username}</h3>
              <button onClick={handleLogout}>Cerrar sesión</button>
              <button onClick={handleChangePassword}>Cambiar de Contraseña</button>
          
          <Form>
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" name="name" value={formProducts.name} onChange={(e)=> setFormProducts({...formProducts, name: e.target.value})} />
       
              <Form.Label>Descripción</Form.Label>
              <Form.Control type="text"  name="description" value={formProducts.description} onChange={(e)=> setFormProducts({...formProducts, description: e.target.value})}/>
           
       
              <Form.Label>Precio</Form.Label>
              <Form.Control type="text"  name="price" value={formProducts.price} onChange={(e)=> setFormProducts({...formProducts, price: e.target.value})} />
        
              <Form.Label>Categoria</Form.Label>
              <Form.Control type="text"  name="category" value={formProducts.category} onChange={(e)=> setFormProducts({...formProducts, category: e.target.value})}/>
        
              <Form.Label>Sku</Form.Label>
              <Form.Control type="text"  name="sku" value={formProducts.sku} onChange={(e)=> setFormProducts({...formProducts, sku: e.target.value})} />
         
              <Form.Label>Imagen</Form.Label>
              <Form.Control type="text"  name="image" value={formProducts.image} onChange={(e)=> setFormProducts({...formProducts, image: e.target.value})}/>
     
            <Button variant="primary" type="button" onClick={() => PostProducts()}>
              Submit
            </Button>
          </Form>

          <Table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Categoria</th>
          <th>Sku</th>
          <th>Imagen</th>
          <th>Opciones</th>
        </tr>
      </thead>
          {products.map(producto => (

      <tbody key={producto._id}>
        <tr>
          <td>{producto.name}</td>
          <td>{producto.description}</td>
          <td>{producto.price}</td>
          <td>{producto.category}</td>
          <td>{producto.sku}</td>
          <td><Image src={producto.image} alt={producto.name} style={{ width: '2rem' }} /></td>
          <td>
            <Button variant="danger" onClick={()=> deleteProduct(producto._id)}>Borrar</Button>
            <Button variant="warning" onClick={()=> EditProduct(producto._id)}>Editar</Button>
          </td>
        </tr>
      </tbody>
))}
</Table>
            </div>
          ) : (
            <p>No estás logueado</p>
          )
      }
    </div>
  )
}

export default Admin
``` 
