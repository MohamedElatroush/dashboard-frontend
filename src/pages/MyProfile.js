// eslint-disable-next-line
import React, { useContext, useEffect, useState } from 'react';
import { Button, Modal, Input, notification } from 'antd';
import AuthContext from '../context/AuthContext';
import useAxios from '../utils/useAxios';
import { Card, CardContent, Typography, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import GradeIcon from '@mui/icons-material/Grade';
import axios from 'axios';
import BASE_URL from '../constants';

const MyProfile = () => {
  const {authTokens} = useContext(AuthContext);
  const [userObj, setUserObj] = useState({});
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [newPassword, setNewPassword] = useState(''); 

  const showModal = () => {
    setOpen(true);
  };
  const handleOk = () => {
    setConfirmLoading(true);
    changePassword();
  };

  const handleCancel = () => {
    setOpen(false);
  };

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

  const changePassword = async () => {
    setConfirmLoading(true);
      try {
        await axios.patch(`${BASE_URL}/user/change_password/${userObj.id}/`, {
          password: newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + String(authTokens.access),
          },
        }
      );
      setConfirmLoading(false);
      setOpen(false);
      notification.success({
        message: 'Successfully Changed Password',
        description: `You've successfully changed your password`,
      });
      } catch (error) {
        setConfirmLoading(false);
        setOpen(false);
        notification.error({
          message: 'Password Change Error',
          description: `Failed to change password`,
        });
      }
  }

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
        <div style={{justifyContent: "center", display:"flex", margin: "2%"}}>
        <Button onClick={showModal} style={{ width: '40%' }} danger>
          Change Password
        </Button>
        <Modal
          title="Change Password"
          open={open}
          onOk={handleOk}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}
        >
          <div style={{ marginTop: '3%', textAlign: 'center', display:"flex", alignItems: 'center', justifyContent:"center" }}>
            <Input.Password placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
          </div>
        </Modal>
        </div>
    </Card>
    </div>
  );
}

export default MyProfile;
