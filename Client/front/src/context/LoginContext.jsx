import React, { createContext, useState } from 'react'

export const LoginContext = createContext({})

const LoginProvider = ({children}) => {
    const [loginForm, setLoginForm] = useState({})
  return (
    <div>
      <LoginContext.Provider value={{loginForm, setLoginForm}}>
        {children}
      </LoginContext.Provider>
    </div>
  )
}

export default LoginProvider
