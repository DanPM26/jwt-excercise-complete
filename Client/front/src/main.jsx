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
  </React.StrictMode>,
)
