  // eslint-disable-next-line
  import React, { useEffect, useState, useContext } from 'react';
  import AuthContext from "../context/AuthContext";
  import { Table, Tag, message, FloatButton, Alert, Upload, Modal, DatePicker, Input, Select } from 'antd';
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
    const [openEdit, setOpenEdit] = useState(false);
    const [grade, setGrade] = useState(null);
    const [natGroup, setNatGroup] = useState(null);
    const [company, setCompany] = useState(null);
    const { Option } = Select;

    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Please Select a Month and Year (default is current month)');
    const [selectedDate, setSelectedDate] = useState(null);

    const [extractUserId, setExtractUserId] = useState(null);
    const [extractUsername, setExtractUsername] = useState(null);

    const [editUserId, setEditUserId] = useState(null);

    const [editedUserData, setEditedUserData] = useState({
      grade: '',
      organizationCode: '',
      position: '',
      department: '',
      natGroup: '',
      workingLocation: '',
      mobilization: '',
      company: '',
    });

    const GRADE_CHOICES = [
      { value: 0, label: 'A1' },
      { value: 1, label: 'A2' },
      { value: 2, label: 'A3' },
      { value: 3, label: 'B1' },
      { value: 4, label: 'B2' },
      { value: 5, label: 'B3' },
      { value: 6, label: 'B4' },
      { value: 7, label: 'B5' },
    ];
    
    const NAT_GROUP_CHOICES = [
      { value: 0, label: 'VCH' },
      { value: 1, label: 'FUD' },
      { value: 2, label: 'TD' },
      { value: 3, label: 'CWD' },
      { value: 4, label: 'PSD' },
      { value: 5, label: 'RSMD' },
    ]

    const COMPANY_CHOICES = [
      { value: 0, label: 'OCG' },
      { value: 1, label: 'NK' },
      { value: 2, label: 'EHAF' },
      { value: 3, label: 'ACE' },
    ]

    // Extract unique positions from the data
    const uniquePositions = Array.from(new Set(users.map((user) => user.position)));

    const uniqueDepartments = Array.from(new Set(users.map((user) => user.department)));

    const workingLocations = Array.from(new Set(users.map((user) => user.workingLocation)));

    const uniqueCompanies = Array.from(new Set(users.map((user) => user.company)));

    const uniqueNAT = Array.from(new Set(users.map((user) => user.natGroup)));

    const natFilters = uniqueNAT.map((natGroup) => ({
      text: natGroup,
      value: natGroup
    }));

    const companyFilters = uniqueCompanies.map((company) => ({
      text: company,
      value: company
    }));

    const workingLocationFilters = workingLocations.map((workingLoc) => ({
      text: workingLoc,
      value: workingLoc
    }));

    const positionFilters = uniquePositions.map((position) => ({
      text: position,
      value: position,
    }));

    const departmentFilters = uniqueDepartments.map((department) => ({
      text: department,
      value: department,
    }));

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

    const showEditUserModal = (id, username) => {
      setOpenEdit(true);
      setEditUserId(id);
    };

    const handleTsOk = () => {
      setConfirmLoading(true);
      extract_user_timesheet(extractUserId, extractUsername);
    };

    const handleEditOk = async () => {
      try {
        // Filter out empty fields from editedUserData
        const nonEmptyData = Object.fromEntries(
          Object.entries(editedUserData).filter(([key, value]) => value !== '')
        );

        if (Object.keys(nonEmptyData).length > 0) {
          // If there are non-empty fields, make the patch request
          await editUser(editUserId, nonEmptyData);
          setOpenEdit(false);
        } else {
          // Handle case when there is no non-empty data
          messageApi.warning('No data to update');
        }
      } catch (error) {
        // Handle error
        console.error(error);
      }
    };

    const handleInputChange = (fieldName, value) => {
      // Convert the value to an integer if fieldName is 'grade'
      const parsedValue = fieldName === 'grade' ? parseInt(value, 10) : value;
      setEditedUserData((prevData) => ({
        ...prevData,
        [fieldName]: parsedValue,
      }));
      if (fieldName === 'grade') {
        setGrade(parsedValue);
      }
      if (fieldName === 'natGroup') {
        setNatGroup(parsedValue);
      }
      if (fieldName === 'company') {
        setCompany(parsedValue);
      }
    };

    const handleTsCancel = () => {
      setOpen(false);
      setSelectedDate(null);
    };

    const handleEditCancel = () => {
      setOpenEdit(false);
    };

    useEffect(()=> {
        getUsers();
      }, []);

    const generateNameFilters = (data) => {
      const uniqueNames = [...new Set(data.map(user => `${user.first_name} ${user.last_name}`))];
      return uniqueNames.map(name => ({ text: name, value: name }));
    };
    const generateHRCodeFilters = (data) => {
      const uniqueHRCodes = [...new Set(data.map(user => user.hrCode))];
      return uniqueHRCodes.map(hrCode => ({ text: hrCode, value: hrCode }));
    };

    const userColumns = [
          {
            title: 'HR Code',
            dataIndex: 'hrCode',
            key: 'hrCode',
            render: (text, record) => <Tag color="blue">{record.hrCode}</Tag>,
            sorter: (a, b) => {
              const codeA = a.hrCode || '';
              const codeB = b.hrCode || '';
              return codeA.localeCompare(codeB);
            },
            filters: generateHRCodeFilters(users),
            filterMultiple: true,
            onFilter: (value, record) => record.hrCode === value,
          },
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => {
              const nameA = `${a.first_name} ${a.last_name}`;
              const nameB = `${b.first_name} ${b.last_name}`;
              return nameA.localeCompare(nameB);
            },
            render: (text, record) => <p>{record.first_name + " " + record.last_name}</p>,
            width: '15%',
            onFilter: (value, record) => {
              const fullName = `${record.first_name} ${record.last_name}`;
              return fullName.toLowerCase().includes(value.toLowerCase());
            },
            filters: generateNameFilters(users),filterMultiple: true,
          },
          {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (text, record) => <Tag color="blue">{record.grade}</Tag>,
            filters: [
              { text: 'A1', value: 'A1' },
              { text: 'A2', value: 'A2' },
              { text: 'A3', value: 'A3' },
              { text: 'B1', value: 'B1' },
              { text: 'B2', value: 'B2' },
              { text: 'B3', value: 'B3' },
              { text: 'B4', value: 'B4' },
              { text: 'B5', value: 'B5' },
            ],
            filterMultiple: false, // Set to true if you want to allow multiple selections
            onFilter: (value, record) => record.grade === value,
            sorter: (a, b) => a.grade.localeCompare(b.grade),
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
            filters: positionFilters,
            filterMultiple: true, // Allow multiple selections
            onFilter: (value, record) => record.position === value,
            sorter: (a, b) => a.position.localeCompare(b.position),
          },
          {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: (text, record) => <p>{record.dep}</p>,
            filters: departmentFilters,
            filterMultiple: true, // Allow multiple selections
            onFilter: (value, record) => record.dep === value,
            sorter: (a, b) => a.dep.localeCompare(b.dep),
          },
          {
            title: 'NAT Group',
            dataIndex: 'natGroup',
            key: 'natGroup',
            render: (text, record) => <p>{record.natGroup}</p>,
            filters: natFilters,
            filterMultiple: true, // Allow multiple selections
            onFilter: (value, record) => record.natGroup === value,
            sorter: (a, b) => a.natGroup.localeCompare(b.natGroup),
          },
          {
            title: 'Working Location',
            dataIndex: 'workingLocation',
            key: 'workingLocation',
            render: (text, record) => <p>{record.workingLocation}</p>,
            filters: workingLocationFilters,
            filterMultiple: true, // Allow multiple selections
            onFilter: (value, record) => record.workingLocation === value,
            sorter: (a, b) => a.workingLocation.localeCompare(b.workingLocation),
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
        filters: companyFilters,
        filterMultiple: true, // Allow multiple selections
        onFilter: (value, record) => record.company === value,
        sorter: (a, b) => a.company.localeCompare(b.company),
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
            </div>
            )}

            {user.isAdmin && (
            <>
              <span style={{ marginLeft: '10px' }} />
              {/* Render "Edit User" button if user.isAdmin */}
              <div style={{ marginBottom: "2px" }}>
                <Button variant="primary" size='sm' onClick={() => showEditUserModal(record.id, record.username)}>
                  Edit User
                </Button>
                
                </div>
            </>
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


const editUser = async (id, userData) => {
  try {
    await axios.patch(`${BASE_URL}/user/edit_details/${id}/`, userData, {
      headers: {
        'Authorization': 'Bearer ' + authTokens.access,
      },
    });
    getUsers(); // Refresh the user data after editing
    messageApi.success('User details updated successfully');
  } catch (error) {
    // Handle error
    messageApi.error('Failed to update user details');
    throw error; // Rethrow the error for additional handling if needed
  }
};

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
      timeout: 100000000,
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
  const [currentPage, setCurrentPage] = useState(1);

// Update this function to include the currentPage
const getUsers = async () => {
  setErrorDisplayed(false);
  try {
    // Make a PATCH request to update the activity
    let response = await axios.get(`${BASE_URL}/user/get_users/`, {
      params: {
        page: currentPage, // Pass the current page as a parameter
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + String(authTokens.access),
      },
    });

    if (response.status === 200) {
      const data = response.data;
      setUsers(data);
    } else {
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
        a.download = `${username}_timesheet.xlsx`;
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
      <Modal
                  title="Edit User"
                  open={openEdit}
                  onOk={handleEditOk}
                  onCancel={handleEditCancel}
                >
                  <div>
                    <label>Grade:</label>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Select Grade"
                      onChange={(value) => handleInputChange('grade', value)}
                      value={grade} // Change this line
                    >
                      {GRADE_CHOICES.map(({ value, label }) => (
                        <Option key={value} value={value}>
                          {label}
                        </Option>
                      ))}
                    </Select>
                    </div>
                    <div>
                      <label>Organization Code:</label>
                      <Input
                        value={editedUserData.organizationCode}
                        onChange={(e) => handleInputChange('organizationCode', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Position:</label>
                      <Input
                        value={editedUserData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Department:</label>
                      <Input
                        value={editedUserData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                      />
                    </div>
                    <div>
                    <label>Nat Group:</label>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Select Nat Group"
                      onChange={(value) => handleInputChange('natGroup', value)}
                      value={natGroup} // Change this line
                    >
                      {NAT_GROUP_CHOICES.map(({ value, label }) => (
                        <Option key={value} value={value}>
                          {label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                      <label>Working Location:</label>
                      <Input
                        value={editedUserData.workingLocation}
                        onChange={(e) => handleInputChange('workingLocation', e.target.value)}
                      />
                    </div>

                    <div>
                      <label>Mobilization Status:</label>
                      <Input
                        value={editedUserData.mobilization}
                        onChange={(e) => handleInputChange('mobilization', e.target.value)}
                      />
                    </div>
                    <div>
                    <label>Company:</label>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Select Company"
                      onChange={(value) => handleInputChange('company', value)}
                      value={company} // Change this line
                    >
                      {COMPANY_CHOICES.map(({ value, label }) => (
                        <Option key={value} value={value}>
                          {label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  </Modal>
                  <Modal
                    title="Extract User's timesheet"
                    open={open}
                    onOk={() => handleTsOk(extractUserId, extractUsername)} // Pass extractUserId and extractUsername
                    confirmLoading={confirmLoading}
                    onCancel={handleTsCancel}
                  >
                    <p>{modalText}</p>
                    <DatePicker onChange={handleDateChange} picker="month" />
                  </Modal>
    </div>
  )
}

export default Dashboard;