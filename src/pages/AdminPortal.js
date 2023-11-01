import React, { useEffect, useState, useContext } from 'react';
import AuthContext from "../context/AuthContext";
import { Table, Tag, message, FloatButton, Alert, Upload, Modal, Popconfirm } from 'antd';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import useAxios from '../utils/useAxios';
import { UploadOutlined } from '@ant-design/icons';

const AdminPortal = () => {
    const {authTokens, user} = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [adminUserId, setAdminUserId] = useState(null);
    const [errorDisplayed, setErrorDisplayed] = useState(false);
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

    const confirmDeleteUser = (userId) => {
      handleDeleteUser(userId);
    };
    const [messageApi, contextHolder] = message.useMessage();
    const showError = (errorMessage) => {
        if (!errorDisplayed) {
            messageApi.error(errorMessage);
            setErrorDisplayed(true);
        }
    };

    let api = useAxios();

    const props = {
      name: 'file',
      action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
      headers: {
        authorization: 'authorization-text',
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };

    const usersDataSource = [...users];
    const showExcelModal = () => {
      setIsExcelModalOpen(true);
    };

    const handelOkExcel = () => {
      setIsExcelModalOpen(false);
    };

    const handleCancelExcel = () => {
      setIsExcelModalOpen(false);
    };

    useEffect(()=> {
        getUsers();
      }, );

    const userColumns = [
        {
          title: 'Username',
          dataIndex: 'username',
          key: 'username',
          render: (text, record) => <p>{record.username}</p>,
        },
        {
            title: 'First Name',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => <p>{record.first_name}</p>,
          },
          {
            title: 'Last Name',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => <p>{record.last_name}</p>,
          },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text, record) => <p>{record.email}</p>,
        },
        {
            title: 'Type',
            dataIndex: 'userType',
            key: 'userType',
            render: (text, record) => <p>{record.user_type}</p>,
        },
        {
            title: 'Role',
            dataIndex: 'is_superuser',
            key: 'is_superuser',
            render: (isSuperUser, record) => {
                const color = record.is_superuser ? 'volcano' : 'green';
                return (
                    <Tag color={color}>
                    {isSuperUser ? 'Admin' : 'Regular'}
                    </Tag>
                );},
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => <>
                <Popconfirm
                title="Delete user"
                description="Are you sure to delete this user?"
                onConfirm={() => confirmDeleteUser(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button variant="danger" size='sm'>
                Delete User
                </Button>
              </Popconfirm>
                <span style={{ marginLeft: '10px' }}></span>
                <Button variant="warning" size='sm' onClick={() => handleResetUserPassword(record.id)}>
                    Reset password
                </Button>
                <span style={{ marginLeft: '10px' }}></span>
                {!record.is_superuser && ( // Render "Make Admin" button if not a superuser
                <Button size='sm' onClick={() => MakeUserAdmin(record.id)}>
                    Make Admin
                </Button>
                )}
            </>
          ,
        },
      ];
      const MakeUserAdmin = (id) => {
        setAdminUserId(id);
      }

      useEffect(() => {
        if (adminUserId !== null) {
          PatchAdminUser(adminUserId);
        }
      }, [adminUserId]);

      const handleDeleteUser = (id) => {
        // Call the DeleteUserEndpoint
        deleteSelectedUser(id);
    };
    const handleResetUserPassword = (id) => {
        resetUserPassword(id);
    };

//   DELETE A USER
const deleteSelectedUser = async (id) => {
    try {
      const response = await api.delete(`user/delete_user/`, {
        data: {
          userId: id,
        },
        headers: {
          'Authorization': 'Bearer ' + authTokens.access,
        },
      });
      if (response.status === 200) {
        getUsers();
        messageApi.success('User deleted successfully');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.detail;

        messageApi.error(
          errorMessage
        );
      } else {
        messageApi.error(
              "Failed to delete user"
            );
      }
    }
  };

const resetUserPassword = async (id) => {
    await axios
        .post(`http://127.0.0.1:8000/user/reset_user_password/`, {
            userId: id, // Use the provided id
        }, {
            headers: {
                'Authorization': 'Bearer ' + authTokens.access,
            },
        })
        .then((response) => {
            if (response.status === 200) {
                getUsers();
                messageApi.success('Successfully reset password to 1234 for the selected user');
            }
        })
        .catch((e) => {
            messageApi.error(e);
        });
};


    // MAKE USER AN ADMIN
    const PatchAdminUser = async () => {
    try {
    let response = await axios.patch(`http://127.0.0.1:8000/user/make_admin/`,{
        "userId": adminUserId,
        "is_superuser": true
    } ,{
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + String(authTokens.access),
    },
    });
    if(response.status === 200) {
    getUsers();
    messageApi.success('You successfully added a new admin');
    } else {
        showError('Failed to make this user an admin');
    }
    } catch (e) {
        showError('Failed to make this user an admin');
}};

      // Function to handle the submission of edited content
  const getUsers = async () => {
    setErrorDisplayed(false);
    try {
      // Make a PATCH request to update the activity
      let response = await axios.get(`http://127.0.0.1:8000/user/get_users/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access),
        },
      });

      if(response.status === 200) {
        const data = response.data;
        setUsers(data);
        }
        else{
            showError('Failed to retrieve user data');
        }

    } catch (e) {
        showError('You do not have access to this feature');
    }
  };

  return (
    <div className='container' style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
        {contextHolder}
        <div style={{width: '100%', margin: 10}}>
            <h1>Users Registered</h1>
        </div>
        <div style={{ width: '100%' }}>
            <Table columns={userColumns}
             dataSource={usersDataSource}
             rowKey={(record) => record.username}
              />
        </div>
        <Modal title="Upload Excel file" open={isExcelModalOpen} onOk={handelOkExcel} onCancel={handleCancelExcel}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Alert
            message="How to use?"
            description="Upload an excel file with two columns first name and last name, an account will be created for every user in that file with username: firstName_lastName and password: 1234"
            type="warning"
          />
          <div style={{ width: '100%', textAlign: 'center', marginTop: "5%" }}>
            <Upload {...props}>
              <Button size="md" variant="dark" style={{ width: '100%' }}><UploadOutlined /> Click to Upload</Button>
            </Upload>
          </div>
        </div>
      </Modal>
        {user.isAdmin ? (
          <FloatButton tooltip={<div>Upload Excel</div>} onClick={() => showExcelModal()} />
        ) : null}
    </div>
  )
}

export default AdminPortal