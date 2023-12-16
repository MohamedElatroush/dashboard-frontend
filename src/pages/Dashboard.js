  import React, { useEffect, useState, useContext } from 'react';
  import AuthContext from "../context/AuthContext";
  import { Table, Tag, message, FloatButton, Alert, Upload, Modal, DatePicker } from 'antd';
  import axios from 'axios';
  import { Button } from 'react-bootstrap';
  import useAxios from '../utils/useAxios';
  import { UploadOutlined } from '@ant-design/icons';
  import BASE_URL from '../constants';
  // import EditUserForm from '../components/EditUserForm';

const Dashboard = () => {
    const {authTokens, user} = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [adminUserId, setAdminUserId] = useState(null);
    const [revokeAdminUserId, setRevokeAdminUserId] = useState(null);
    const [errorDisplayed, setErrorDisplayed] = useState(false);
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [open, setOpen] = useState(false);

    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Please Select a Month and Year (default is current month)');
    const [selectedDate, setSelectedDate] = useState(null);

    const [extractUserId, setExtractUserId] = useState(null);
    const [extractUsername, setExtractUsername] = useState(null);

    


    const handleDateChange = (date, dateString) => {
      setSelectedDate(dateString);
    };

    const [messageApi, contextHolder] = message.useMessage();
    const showError = (errorMessage) => {
        if (!errorDisplayed) {
            messageApi.error(errorMessage);
            setErrorDisplayed(true);
        }
    };

    let api = useAxios();

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

    const showExtractTsModal = (userId, username) => {
      setOpen(true);
      setModalText(`Please Select a Month and Year for ${username} (default is current month)`);
      setConfirmLoading(false);
      setSelectedDate(null);
      setExtractUserId(userId);
      setExtractUsername(username);
    };

    const handleTsOk = () => {
      setConfirmLoading(true);
      extract_user_timesheet(extractUserId, extractUsername);
    };

    const handleTsCancel = () => {
      setOpen(false);
      setSelectedDate(null);
    };

    useEffect(()=> {
        getUsers();
      }, []);

    const userColumns = [
          {
            title: 'HR Code',
            dataIndex: 'hrCode',
            key: 'hrCode',
            render: (text, record) => <Tag color="blue">{record.hrCode}</Tag>,
          },
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => <p>{record.first_name + " " + record.last_name}</p>,
            width: '15%',
          },
          {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (text, record) => <Tag color="blue">{record.grade}</Tag>,
          },
          {
            title: 'Organization Code',
            dataIndex: 'organizationCode',
            key: 'organizationCode',
            render: (text, record) => <Tag color="blue">{record.organizationCode}</Tag>,
          },
          {
            title: 'Position',
            dataIndex: 'position',
            key: 'position',
            render: (text, record) => <p>{record.position}</p>,
          },
          {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: (text, record) => <p>{record.department}</p>,
          },
          {
            title: 'NAT Group',
            dataIndex: 'natGroup',
            key: 'natGroup',
            render: (text, record) => <p>{record.natGroup}</p>,
          },
          {
            title: 'Working Location',
            dataIndex: 'workingLocation',
            key: 'workingLocation',
            render: (text, record) => <p>{record.workingLocation}</p>,
          },
          {
            title: 'Expert',
            dataIndex: 'expert',
            key: 'expert',
            render: (text, record) => <Tag color="blue">{record.expert}</Tag>,
          },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text, record) => <p>{record.email}</p>,
        },
        {
          title: 'Mobilization status',
          dataIndex: 'mobilization',
          key: 'mobilization',
          render: (text, record) => <p>{record.mobilization}</p>,
      },
      {
        title: 'Company',
        dataIndex: 'company',
        key: 'company',
        render: (text, record) => <p>{record.company}</p>,
      },
      {
          title: 'Role',
          dataIndex: 'isAdmin',
          key: 'isAdmin',
          render: (isAdmin, record) => {
              const color = record.isAdmin ? 'volcano' : 'green';
              return (
                  <Tag color={color}>
                  {isAdmin ? 'Admin' : 'Regular'}
                  </Tag>
              );},
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => <>
            <span style={{ marginLeft: '10px' }} />
            <div style={{marginBottom: "2px"}}>
              <Button variant="warning" size='sm' onClick={() => handleResetUserPassword(record.id)}>
                  Reset password
              </Button>
            </div>
            <span style={{ marginLeft: '10px' }} />
            {!record.isAdmin && ( // Render "Make Admin" button if not a superuser
              <div style={{marginBottom: "2px"}}>
              <Button size='sm' onClick={() => MakeUserAdmin(record.id)}>
                  Make Admin
              </Button>
            </div>
            )}
            <span style={{ marginLeft: '10px' }} />
            {(record.isAdmin && !record.is_superuser) && ( // Render "Make Admin" button if not a superuser
              <div style={{marginBottom: "2px"}}>
              <Button variant="info" size='sm' onClick={() => RevokeUserAdmin(record.id)}>
                  Revoke Admin
              </Button>
            </div>
            )}
            <span style={{ marginLeft: '10px' }} />
            {( // Render "Make Admin" button if not a superuser
              <div style={{marginBottom: "2px"}}>
              <Button variant="success" size='sm' onClick={() => showExtractTsModal(record.id, record.username)}>
                  Extract Timesheet
              </Button>
              <Modal
              title="Extract User's timesheet"
              open={open}
              onOk={() => handleTsOk(record.id, record.username)}
              confirmLoading={confirmLoading}
              onCancel={handleTsCancel}
            >
              <p>{modalText}</p>
              <DatePicker onChange={handleDateChange} picker="month" />
            </Modal>
            </div>
            )}
        </>,
        },
      ];
      const MakeUserAdmin = (id) => {
        setAdminUserId(id);
      }

      const RevokeUserAdmin = (id) => {
        setRevokeAdminUserId(id);
      }

      useEffect(() => {
        if (adminUserId !== null) {
          PatchAdminUser(adminUserId);
        }
      }, [adminUserId]);

      useEffect(() => {
        if (revokeAdminUserId !== null) {
          revokeAdmin(revokeAdminUserId);
        }
      }, [revokeAdminUserId]);

    const handleResetUserPassword = (id) => {
        resetUserPassword(id);
    };

const editUser = async(id, grade) => {
  await axios.patch(`${BASE_URL}/user/edit_details/${id}/`, {
    grade: grade,
    }, {
      headers: {
          'Authorization': 'Bearer ' + authTokens.access,
      },
    })
}

const resetUserPassword = async (id) => {
    await axios
        .post(`${BASE_URL}/user/reset_user_password/`, {
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
    let response = await axios.patch(`${BASE_URL}/user/make_admin/`,{
        "userId": adminUserId,
        "isAdmin": true
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

const revokeAdmin = async () => {
  try {
  let response = await axios.patch(`${BASE_URL}/user/revoke_admin/`,{
      "userId": revokeAdminUserId,
      "isAdmin": false
  } ,{
  headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + String(authTokens.access),
  },
  });
  if(response.status === 200) {
  getUsers();
  messageApi.success('You successfully revoked access from an admin');
  } else {
      showError('Failed to revoke access of an admin');
  }
  } catch (e) {
      showError('Failed to revoke access of an admin');
}};

const props = {
  name: 'file',
  action: `${BASE_URL}/user/excel_sign_up/`,
  headers: {
    authorization: `Bearer ${authTokens.access}`,
  },
  customRequest: async ({ file, onSuccess, onError }) => {
    await excelSignUp(file);
    onSuccess();
  },
};

const excelSignUp = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('user/excel_sign_up/', formData, {
      headers: {
        'Authorization': 'Bearer ' + authTokens.access,
      },
    });

    if (response.status === 200) {
      message.success(`${file.name} file uploaded successfully`);
      getUsers(); // Refresh the user data
    } else {
      message.error(`${file.name} file upload failed: ${response.data.detail}`);
    }
  } catch (error) {
    message.error(`Failed to upload ${file.name} due to ${error.response.data.detail}`);
  }
};

  // Function to handle the submission of edited content
  const getUsers = async () => {
    setErrorDisplayed(false);
    try {
      // Make a PATCH request to update the activity
      let response = await axios.get(`${BASE_URL}/user/get_users/`, {
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

  const extract_user_timesheet = async (userId, username) => {
    try {
      let url = `${BASE_URL}/user/extract_timesheet/${userId}/`;
      // Append '01' to the selectedDate to get the first day of the month
      if (selectedDate) {
        const formattedDate = `${selectedDate}-01`;
        url += `?date=${formattedDate}`;
      }
  
      let response = await axios.get(url, {
        responseType: 'arraybuffer',  // Set the response type to 'arraybuffer'
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access),
        },
      });
  
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `timesheet_${userId}_${username}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        message.success('User activities exported successfully');
      } else {
        showError('Failed to retrieve user data');
      }
    } catch (e) {
      showError('You do not have access to this feature');
    } finally {
      setConfirmLoading(false);
      setOpen(false);
    }
  };
  

  return (
    <div style={{ padding: "10px 5px",textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
        {contextHolder}
        <div style={{width: '100%', margin: 10}}>
            <h1>Users Registered</h1>
        </div>
        <div style={{ width: '100%' }}>
            <Table columns={userColumns}
             dataSource={usersDataSource}
             rowKey={(record) => record.id}
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
            <Button>
              <UploadOutlined /> Click to Upload
            </Button>
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

export default Dashboard;