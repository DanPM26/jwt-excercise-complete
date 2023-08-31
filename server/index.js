const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
require('./db/mongodb')
const apiRouter = require('./apis')

app.use(express.json())
app.use(cors())
app.use('/api/v1', apiRouter)

app.get('/', (req,res)=>{
    res.send('Servidor vivo')
})


const PORT = process.env.PORT || 4001
app.listen(PORT, ()=>{
    console.log(`Servidor conectado en ${PORT}`)
})
