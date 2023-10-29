import React, { useContext, useEffect, useState } from 'react';
import { Button, Descriptions, Row, Col } from 'antd';
import AuthContext from '../context/AuthContext';
import useAxios from '../utils/useAxios';

const MyProfile = () => {
  const {authTokens, user} = useContext(AuthContext);
  const [userObj, setUserObj] = useState({});

  console.log(userObj);

  useEffect(()=> {
    getUser();
  }, []);

  let api = useAxios();

  const getUser = async () => {
    try {
      // GET user details
      let response = await api.get(`user/get_user/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access),
        },
      });

      if(response.status === 200) {
        const data = response.data;
        setUserObj(data)
        console.log(data)
        }
        else{
            console.log("error");
        }

    } catch (e) {
      console.log("error");
    }
  };


  return (
    <div className="container" >
      <Row style={{margin: 10, justifyContent: 'center'}} justify="center">
        <Col>
          <Descriptions title="User Information">
            <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
            <Descriptions.Item label="First Name">{userObj.first_name}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{userObj.last_name}</Descriptions.Item>
            <Descriptions.Item label="Email">{userObj.email}</Descriptions.Item>
            <Descriptions.Item label="Type">{userObj.user_type}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
      <Row justify="center">
        <Button style={{marginLeft: 10, display: 'block'}} type='primary' size='sm'>Modify</Button>
      </Row>
    </div>
  );
}

export default MyProfile;
