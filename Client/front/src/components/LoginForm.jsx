import React, { useContext} from 'react'
import axios from 'axios'
import { Col, Container, Row, Form, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import { UserContext } from '../context/UserContext';


const LoginForm = () => {
// const [userData, setUserData] = useState()
  //Una vez creado el context, lo instanciamos

  const {userData, setUserData} = useContext(UserContext)
  
  const url = 'http://localhost:4003/api/v1/auth/login'
  const url2 = 'http://localhost:4003/api/v1/users/me'
  const url3 = 'http://localhost:4003/api/v1/admin/yo'
  const navigation = useNavigate()

  // const handleSubmit = () => {
  //   console.log(userData);
  //   axios.post(url, userData)
  //     .then(res => {
  //       console.log("data",res.data);
  //       const token = res.data.token;
  //       const isAdmin = res.data.role === 'admin';        
  //     axios.get(isAdmin ? url3 : url2, {
  //       headers: {
  //         'Access-Control-Allow-Origin': '*',
  //         Authorization: `Bearer ${token}`
  //       }
  //     }).then(response => {
  //       const responseData = response.data;
  // console.log("responsedata", responseData);
  //     const userDataUpdated = {
  //   ...userData,
  //   ...responseData
  //    };
  // setUserData(userDataUpdated);

  //       // setUserData(response.data);
  //       // console.log("responsedata",response.data);
  //       if (isAdmin) {
  //         navigation('/admin');
  //       } else {
  //         navigation('/profile');
  //       }
  //     });
  //      });
  // };

  const handleSubmit = () => {
    console.log(userData);
    axios.post(url, userData)
      .then(res => {
        console.log("data",res.data);
        const { token, role } = res.data;
        const isAdmin = role === 'admin';      
      
        axios.get(isAdmin ? url3 : url2, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            Authorization: `Bearer ${token}`
          }
        }).then(response => {
          console.log("responsedata",response.data);

          const { username, email } = response.data;

          const userDataUpdated = { token,username, email };

          setUserData(userDataUpdated);
          
          if (isAdmin) {
            navigation('/admin');
          } else {
            navigation('/profile');
          }
        });
      });
  };
  
  

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
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" onChange={handleChange} name="email" placeholder="Enter email" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" onChange={handleChange} name="password" placeholder="Password" />
            </Form.Group>
            <Button variant="primary" type="button" onClick={() => handleSubmit()}>
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default LoginForm