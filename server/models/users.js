const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const uniqueValidator = require('mongoose-unique-validator')
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
    },
    role: {
        type: String,
        required:false
    }
},{
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