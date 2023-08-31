import React, { useState } from 'react'
import { useContext } from 'react'
import { UserContext } from '../context/UserContext';
import { Col, Container, Row, Form, Button } from 'react-bootstrap'
import axios from 'axios';

 const ChangePassword = () => {
   const {userData, setUserData} = useContext(UserContext)
   const [errorPassword,setErrorPassword]= useState("")
  const [successPassword,setSuccessPassword] = useState("")
const changePassword = async () => {

  const token = userData.token;
  const oldPassword = userData.oldPassword;
  const newPassword = userData.newPassword;  

  const url = "http://localhost:4003/api/v1/pass/change";

  try {
    const response = await axios.put(
      url,
      {
        oldPassword: oldPassword,
        newPassword: newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Check the status of the response
    if (response.status === 200) {
      console.log("Password changed successfully!");
      setSuccessPassword('Contraseña Cambiada!'); // Clear any previous error message
    } else {
      console.log("Something went wrong.");
      setErrorPassword('La contraseña es incorrecta'); // Set the error message for incorrect password
    }
  } catch (error) {
    console.error(error);
    setErrorPassword('La contraseña es incorrecta'); // Set the error message for incorrect password
  }
};

 console.log("userData",userData)


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
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" onChange={handleChange} name="oldPassword" placeholder="Password" />
            {errorPassword && <span className="error">{errorPassword}</span>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label> New Password</Form.Label>
            <Form.Control type="password" onChange={handleChange} name="newPassword" placeholder="Password" />
          </Form.Group>
          <Button variant="primary" type="button" onClick={() => changePassword()}>
            Submit
          </Button>
          {successPassword && <span className="error">{successPassword}</span>}
        </Form>
      </Col>
    </Row>
  </Container>
  )
}

export default ChangePassword
