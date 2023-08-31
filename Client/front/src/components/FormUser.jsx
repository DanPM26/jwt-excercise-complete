import React, { useContext } from 'react'
import { Col, Container, Row, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import { UserContext } from '../context/UserContext'

const FormUser = () => {
   
  // const [userData, setUserData] = useState()
  //Una vez creado el context, lo instanciamos

  const {userData, setUserData} = useContext(UserContext)

  const saveUser = async () => {
    const url = 'http://localhost:4003/api/v1/register'
    const result = await axios.post(url, userData)
    console.log(result)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value
    })
    console.log(userData)
  }
  return (
    <Container>
      <Row>
        <Col md={12}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control onChange={handleChange} name="name" type="text" placeholder="Escribe tu nombre" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control type="text" onChange={handleChange} name="lastname" placeholder="Escribe tu apellido" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" onChange={handleChange} name="username" placeholder="Tu edad" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" onChange={handleChange} name="email" placeholder="Enter email" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" onChange={handleChange} name="password" placeholder="Password" />
            </Form.Group>
            <Button variant="primary" type="button" onClick={() => saveUser()}>
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default FormUser