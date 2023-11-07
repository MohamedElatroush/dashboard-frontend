import React, {useState, useContext} from 'react';
import Form from 'react-bootstrap/Form';
import '../styles/Login.css'; // Import your CSS file
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [selectedNatGroup, setSelectedNatGroup] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const navigate = useNavigate();

    let {user} = useContext(AuthContext);

    const handleGradeChange = (event) => {
      setSelectedGrade(event.target.value === 'null' ? null : parseInt(event.target.value));
    };

    const handleNatGroupChange = (event) => {
      setSelectedNatGroup(event.target.value === 'null' ? null : parseInt(event.target.value));
    };

    const handleCompanyChange = (event) => {
      setSelectedCompany(event.target.value === 'null' ? null : parseInt(event.target.value));
    };

    const registerUser = async (event) => {
        event.preventDefault();
        axios
      .post(
        `http://127.0.0.1:8000/register/`,
        {
          "email": event.target.email.value,
          "username": event.target.username.value,
          "password":event.target.password.value,
          "first_name":event.target.firstName.value,
          "last_name":event.target.lastName.value,
          "grade": selectedGrade,
          "organizationCode":event.target.organizationCode.value,
          "position": event.target.position.value,
          "department": event.target.department.value,
          "natGroup": selectedNatGroup,
          "workingLocation": event.target.workingLocation.value,
          "mobilization": event.target.mobilization.value,
          "company": selectedCompany
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
      <div className='container' style={{ minHeight: '100vh'}}>
        {user ? navigate('/') : ""}
        <div className='center-form' style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
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
            <Form.Group className="mb-3" controlId="formBasicGrade">
                <Form.Label>Grade</Form.Label>
                <Form.Control as="select" name="grade" value={selectedGrade === null ? 'null' : selectedGrade} onChange={handleGradeChange}>
                <option value="null">None</option> {/* Allow null/none selection */}
                <option value={0}>A1</option>
                <option value={1}>A2</option>
                <option value={2}>A3</option>
                <option value={5}>B1</option>
                <option value={6}>B2</option>
                <option value={7}>B3</option>
                <option value={8}>B4</option>
                <option value={9}>B5</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicOrganizationCode">
              <Form.Label>Organization Code</Form.Label>
              <Form.Control type="text" name="organizationCode" placeholder="A1-1, A1-2...etc"/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPosition">
              <Form.Label>Position</Form.Label>
              <Form.Control type="text" name="position" placeholder="Example: Civil Engineer"/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDepartment">
              <Form.Label>Department</Form.Label>
              <Form.Control type="text" name="department"/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicNatGroup">
              <Form.Label>NAT Group</Form.Label>
              <Form.Control as="select" name="natGroup" value={selectedNatGroup=== null ? 'null' : selectedNatGroup} onChange={handleNatGroupChange}>
                <option value="null">None</option> {/* Allow null/none selection */}
                <option value={0}>Vice Chairman</option>
                <option value={1}>Follow Up Department</option>
                <option value={2}>Technical Department</option>
                <option value={3}>Civil Work Department</option>
                <option value={4}>Power Supply Department</option>
                <option value={5}>Rolling Stock & Mechanical Department</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicWorkingLocation">
              <Form.Label>Working Location</Form.Label>
              <Form.Control type="text" name="workingLocation"/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicMobilized">
              <Form.Label>Mobilization</Form.Label>
              <Form.Control type="text" name="mobilization" placeholder='Mobilized or leave empty'/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicCompany">
              <Form.Label>Company</Form.Label>
              <Form.Control as="select" name="company" value={selectedCompany=== null ? 'null' : selectedCompany} onChange={handleCompanyChange}>
                <option value="null">None</option> {/* Allow null/none selection */}
                <option value={0}>OCG</option>
                <option value={1}>NK</option>
                <option value={2}>EHAF</option>
                <option value={3}>ACE</option>
              </Form.Control>
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