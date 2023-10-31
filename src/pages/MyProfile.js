import React, { useContext, useEffect, useState } from 'react';
import { Descriptions, Row, Col, notification} from 'antd';
import AuthContext from '../context/AuthContext';
import useAxios from '../utils/useAxios';

const MyProfile = () => {
  const {authTokens} = useContext(AuthContext);
  const [userObj, setUserObj] = useState({});

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
        setUserObj(data);
        } else {
          notification.error({
            message: 'Failure',
            description: `Failed to fetch your account details`,
          });
        }

    } catch (e) {
      notification.error({
        message: 'Failure',
        description: `Failed to fetch your account details`,
      });
    }
  };
  return (
    <div className="container" >
      <Row style={{margin: 10, justifyContent: 'center'}} justify="center">
        <Col>
          <Descriptions title="User Information">
            <Descriptions.Item label="Username">{userObj.username}</Descriptions.Item>
            <Descriptions.Item label="First Name">{userObj.first_name}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{userObj.last_name}</Descriptions.Item>
            <Descriptions.Item label="Email">{userObj.email}</Descriptions.Item>
            <Descriptions.Item label="Type">{userObj.user_type}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </div>
  );
}

export default MyProfile;
