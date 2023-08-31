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