import React, {useState, useContext} from 'react';
import Form from 'react-bootstrap/Form';
import '../styles/Login.css'; // Import your CSS file
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [userType, setUserType] = useState(0);
    const navigate = useNavigate();

    let {user} = useContext(AuthContext);

    const handleUserTypeSelection = (typeValue) => {
      setUserType(typeValue);
    }
    const registerUser = async (event) => {
        event.preventDefault();
        axios
      .post(
        `http://127.0.0.1:8000/register/`,
        {
          "email": event.target.email.value,
          "username": event.target.username.value,
          "password":event.target.password.value,
          "firstName":event.target.firstName.value,
          "lastName":event.target.lastName.value,
          "userType":userType,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then(() => {
        navigate('/');
        notification.success({
          message: 'Registration Success',
          description: `You have successfully signed up!`,
        });
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.username) {
          const errorMessage = error.response.data.username[0];
          notification.error({
            message: 'Registration Failed',
            description: errorMessage,
          });
        } else {
          notification.error({
            message: 'Registration Failed',
            description: 'Failed to register you to dashboard',
          });
        }
      });
  };
    return (
      <div className='container'>
        {user ? navigate('/') : ""}
        <div className='center-form'>
            <h1 className='center-heading'>Sign Up to Dashboard</h1>
            <Form onSubmit={registerUser}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" placeholder="Enter Email" required/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" name="firstName" placeholder="John" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="lastName" placeholder="Doe" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Username *</Form.Label>
              <Form.Control type="text" name="username" placeholder="Enter Username" required/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password *</Form.Label>
              <Form.Control type="password" name="password" placeholder="Enter Password" required/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicType" style={{ width: '100%',  display: 'block' }}>
            <Dropdown style={{ width: "100%" }}>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
                Type {userType !== null ? `* (${userType === 0 ? 'A : International' : 'E : Egyptian'})` : '*'}
              </Dropdown.Toggle>


              <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleUserTypeSelection(0)}>Type A : International</Dropdown.Item>
                <Dropdown.Item onClick={() => handleUserTypeSelection(1)}>Type E : Egyptian</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            </Form.Group>
            <Button variant="primary" type="submit" className='loginButton'>
              Register
            </Button>
          </Form>
        </div>
      </div>
    )
}

export default Register