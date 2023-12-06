import React, {useContext} from 'react'
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Navbar, Nav, Container, Image } from 'react-bootstrap';
import { Tag } from 'antd';

const Header = () => {
  let {user, logoutUser} = useContext(AuthContext);

  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">
          <Image src={process.env.PUBLIC_URL + '/images/logo.png'}
           alt="Logo"
          fluid 
          style={{ marginRight: '10px', width: '50px', height: 'auto' }}
          />
          NOCE Timesheet System
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
        <Nav className="ms-auto">
        {user && (
              <Link to="/" className="nav-link">
                Hello, {user.username} 👋 {user.isAdmin ? (
                             <Tag color="green">Admin</Tag>
                            ) : null}
              </Link>
            )}
        {user ? (
          <>
            <Link to='/dashboard' className="nav-link">
            Dashboard
            </Link>
            <Link to='/profile' className="nav-link">
            My Profile
            </Link>
            <Link onClick={logoutUser} className="nav-link">
              Logout
            </Link>
            </>

            ) : (
              <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              {/* <Link to="/register" className="nav-link">
                Register
              </Link> */}
              </>
          )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header