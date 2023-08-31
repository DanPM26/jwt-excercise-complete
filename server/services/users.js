const bcrypt = require('bcrypt')

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
         delete newUser.password
        return newUser.toObject()

    }

    
//   async changePassword(email,password,newPassword){
//    try{
//      const user = await this.Model.findOne({email});
//      console.log(user)

    //  const isMatch = await bcrypt.compare(password, user.password);
    //   if(isMatch){
    //     const hash = await bcrypt.hash(newPassword,12)
    //     console.log(newPassword)
    //     user.password = hash
    //     await user.save();
    //     console.log("La contaseña se ha cambiado correctamente")
    //     console.log("Nueva contraseña: ", newPassword);
    //     return user;
    //   } else {
    //     console.log("No puedes cambiar la contraseña");
    //   }

//    } catch(err){
//      console.log(err);
//      return null;
//    }
//   } 
      
}
 
module.exports = userService