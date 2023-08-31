import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import './App.css'
import { Container, Row, Card, Button, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ProductContext } from './context/ProductContext'

function App() {

  const {products,setProducts} = useContext(ProductContext)

  const getProducts = async () => {
    const url = 'http://localhost:4003/api/v1/products'
    const productos = await axios.get(url)
    console.log(productos.data)
    setProducts(productos.data)
  }
  
  const navigation = useNavigate()
  const buyProducts = () => {
   navigation('/login')
  }

  useEffect(() => {
    getProducts()
  }, []);

  return (
    <Container>
      <Row>
        {
          products.length > 0 ?
            products.map((pr, i) => (
              <Col md={6} key={i} >
                <Card style={{ width: '18rem' }}>
                  <Card.Img variant="top" src={pr.image} />
                  <Card.Body>
                    <Card.Title>{pr.name}</Card.Title>
                    <Card.Text>
                    {pr.description}
                    </Card.Text>
                    <Card.Text>
                    ${pr.price} USD
                    </Card.Text>
                    <Button variant="primary" onClick={buyProducts}>Comprar</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
            :
            <div>
              <h1>Sin productos</h1>
            </div>
        }
      </Row>
    </Container>
  )
}

export default App
