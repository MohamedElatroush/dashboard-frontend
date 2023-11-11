import React, {useContext} from 'react'
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Tag } from 'antd';

const Header = () => {
  let {user, logoutUser} = useContext(AuthContext);

  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">Dashboard</Navbar.Brand>
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
            <Link to='/portal' className="nav-link">
            Portal
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