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
