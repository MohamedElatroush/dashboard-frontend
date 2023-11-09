import React, { useContext, useEffect, useState } from 'react';
// import { Descriptions, Row, Col, notification} from 'antd';
import AuthContext from '../context/AuthContext';
import useAxios from '../utils/useAxios';
import { Card, CardContent, Typography, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import GradeIcon from '@mui/icons-material/Grade';

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
        }

    } catch (e) {

    }
  };
  return (
    <div className="container" >
      <Card sx={{ minWidth: '100%', maxWidth: 500, m: 2, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h5" component="div" sx={{ color: 'primary.main' }}>
            Profile Overview
          </Typography>
          <Divider sx={{mb: 2}}/>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            <AlternateEmailIcon /> {userObj.username}
          </Typography>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            First Name: {userObj.first_name}
          </Typography>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            Last Name: {userObj.last_name}
          </Typography>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            <EmailIcon sx={{ mr: 1 }} /> {userObj.email}
          </Typography>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            HR Code: {userObj.hrCode}
          </Typography>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            <GradeIcon /> Grade: {userObj.grade ? userObj.grade: "None"}
          </Typography>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            NAT Group: {userObj.natGroup}
          </Typography>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            Expert: {userObj.expert}
          </Typography>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            Organization Code: {userObj.organizationCode}
          </Typography>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            Position: {userObj.position}
          </Typography>
        </CardContent>
    </Card>
    </div>
  );
}

export default MyProfile;
