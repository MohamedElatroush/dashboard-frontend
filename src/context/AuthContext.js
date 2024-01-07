// eslint-disable-next-line
import { createContext, useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import BASE_URL from '../constants';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
    let [authTokens, setAuthTokens] = useState(()=> localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null)
    let [user, setUser] = useState(()=> localStorage.getItem('authTokens') ? jwt_decode(localStorage.getItem('authTokens')) : null)
    let [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    let loginUser = async(e) => {
        e.preventDefault();
        let response = await fetch(`${BASE_URL}/api/token/`, {
            method:"POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({'username': e.target.username.value, 'password': e.target.password.value})
        });

        let data = await response.json();

        if(response.status === 200){
            const userResponse = await fetch(`${BASE_URL}/user/get_user/`, {
                method: "GET",
                headers: {
                  'Authorization': `Bearer ${data.access}`
                }
              });
          
            const userData = await userResponse.json();
            if (userData.isDeleted) {
                // Display an error notification for deleted user
                notification.error({
                  message: 'Login Failed',
                  description: 'Your account has been deleted. Please contact the administrator for assistance.',
            });
        } else {
            // Continue with the login process
            setAuthTokens(data);
            setUser(jwt_decode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            navigate('/');
            // Display a success notification
            notification.success({
              message: 'Login Successful',
              description: 'You have successfully logged in.',
            });
          }
        } else {
          // Display an error notification for invalid credentials
          notification.error({
            message: 'Login Failed',
            description: 'Invalid username or password. Please try again.',
          });
        }
      }


    let logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    }

    let contextData = {
        user:user,
        authTokens:authTokens,
        setAuthTokens:setAuthTokens,
        setUser:setUser,
        loginUser:loginUser,
        logoutUser: logoutUser
    }

    useEffect(()=> {

        if(authTokens){
            setUser(jwt_decode(authTokens.access))
        }
        setLoading(false);
    }, [authTokens, loading])

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    )
}