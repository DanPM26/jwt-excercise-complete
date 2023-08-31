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