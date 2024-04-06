// eslint-disable-next-line
import React, {useContext} from 'react';
import AuthContext from '../context/AuthContext';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import '../styles/Login.css'; // Import your CSS file
import { Alert, Space } from 'antd';

const Login = () => {
  let {loginUser} = useContext(AuthContext);
  return (
    <div className='container'>
      <div className='center-form'>
      <div style={{marginTop: 10, marginBottom: 10}}>
          <Space direction="horizontal" style={{ width: '100%' }}>
          {/* <Alert
            message="If you forgot your credentials please let the admin reset your password"
            type="warning"
            closable
          /> */}
          {/* <Alert
            message="If you're having trouble logging in, try the initial password (1234) and change it later. If the issue persists, please contact the admin. [This message is due to server irregularities that have been fixed in the past 24 hours]
            "
            type="error"
          /> */}
          </Space>
        </div>
          <h1 className='center-heading'>Login to your timesheet system</h1>
          <Form onSubmit={loginUser}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" name="username" placeholder="Enter Username" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" placeholder="Enter Password" />
          </Form.Group>

          <Button variant="primary" type="submit" className='loginButton'>
            Login
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default Login