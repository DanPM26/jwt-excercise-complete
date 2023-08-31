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
