// eslint-disable-next-line
  import React, { useEffect, useState, useContext } from 'react';
  import AuthContext from "../context/AuthContext";
  import { Table, notification, message, Tag, DatePicker, Modal, Select, Input } from 'antd';
  import { Button } from 'react-bootstrap';
  import useAxios from '../utils/useAxios';
  import jwt_decode from "jwt-decode";
  import axios from 'axios';
  import CreateActivityForm from '../components/CreateActivityForm';
  import { PlusCircleFilled, SyncOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
  import BASE_URL from '../constants';
  import EditActivityForm from '../components/EditActivityForm';
import CreateActivityAdminForm from '../components/CreateActivityAdminForm';


  const HomePage = () => {
    let [activities, setActivities] = useState([]);
    let {authTokens, logoutUser, user} = useContext(AuthContext);
    const [tableLoading, setTableLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [openAdminLog, setOpenAdminLog] = useState(false);
    let [myActivities, setMyActivities] = useState([])
    const [selectedDate, setSelectedDate] = useState(null);
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [selectedExportCompany, setSelectedExportCompany] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [exportDate, setExportDate] = useState(null);

    const [exportModalMyActivities, setExportModalMyActivities] = useState(false);
    const [exportingMyActivitiesLoading, setExportingMyActivitiesLoading] = useState(false);
    const [selectedMyActivitiesDate, setSelectedMyActivtiesDate] = useState(null);

    const [myActivitiesLoading, setMyActivitiesLoading] = useState(false);

    const [adminUser, setAdminUser] = useState(null); // Define adminUser state

    const handleAdminUserChange = (value) => {
      setAdminUser(value);
  };

    const isEditButtonDisabled = (activityDate) => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
    
      const activityDateObj = new Date(activityDate);
      const activityMonth = activityDateObj.getMonth();
      const activityYear = activityDateObj.getFullYear();
    
      // Check if we are not in the same month and the first 5 days of the following month have passed
      return !(currentMonth === activityMonth && currentYear === activityYear) &&
             (currentDate.getDate() > 10);
    };

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const { Option } = Select;

    const COMPANY_CHOICES = [
      { value: -1, label: 'None' },
      { value: 0, label: 'OCG' },
      { value: 1, label: 'NK' },
      { value: 2, label: 'EHAF' },
      { value: 3, label: 'ACE' },
    ];

    const renderExportModalContent = () => (
      <div>
        <div style={{margin: 10}}>
        <label style={{display: 'block'}}>Date:</label>
          <DatePicker style={{marginBottom: "10px"}} onChange={handleExportDateChange} picker='month'/>
        <label style={{display: 'block'}}>Company:</label>
        <Select
          placeholder="Select Company"
          style={{ width: '100%' }}
          onChange={(value) => setSelectedExportCompany(value)}
        >
          {COMPANY_CHOICES.map(({ value, label }) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          ))}
        </Select>
        </div>
        <div style={{margin: 10}}>
        <label>Department:</label>
          <Input
          placeholder="Enter Department"
          onChange={(e) => setSelectedDepartment(encodeURIComponent(e.target.value))}
        />
      </div>
      </div>
    );

    const renderMyTimesheetModalContent = () => (
      <div>
        <div style={{margin: 10}}>
        <label style={{display: 'block'}}>Date:</label>
        <DatePicker onChange={handleMyActivitiesDateChange} picker="month" />
      </div>
      </div>
    );

    useEffect(() => {
      getUserActivities();
    }, [selectedDate])

    const [exporting, setExporting] = useState(false);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const openExportModal = () => {
      setExportModalVisible(true);
    };

    const closeExportModal = () => {
      setSelectedDepartment(null);
      setSelectedExportCompany(null); // Set it to null to clear the selected company
      setExportModalVisible(false);
    };

    const exportExcelActivities = async () => {
      // Open the export modal
      openExportModal();
    };

    const openExportMyActivitiesModal = () => {
      setExportModalMyActivities(true);
    }

    const exportExcelMyActivities = async () => {
      // Open the export modal
      openExportMyActivitiesModal();
    };

    const closeMyActivitiesExportModal = () => {
      setExportModalMyActivities(false);
    };


    const handleExportConfirm = async () => {
      // Continue with the export process and send the selected company to the backend
      if (exporting || !user.isAdmin) {
        // Handle conditions (e.g., show error message)
        console.error('Export conditions not met');
        return;
      }
      let errorMessage = "";

      try {
        setExporting(true); // Set the loading state to true
        // Make a GET request to the endpoint with selected company
        let url = `${BASE_URL}/activity/export_all/`;

        if (exportDate) {
          const formattedDate = `${exportDate}-01`;
          url += `?date=${formattedDate}`;
        }
        const response = await api.get(url, {
          params: {
            company: selectedExportCompany,
            department: selectedDepartment,
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + String(authTokens.access),
          },
          responseType: 'arraybuffer',
        });
        if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `timesheet.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        message.success('User activities exported successfully');
        }
      } catch (error) {
        errorMessage = error.response.data.detail || 'Failed to export user activities';
        message.error(errorMessage);
      } finally {
        setExporting(false); // Set the loading state back to false when the export is finished
        setSelectedDepartment(null)
        setSelectedExportCompany(COMPANY_CHOICES[-1])
        closeExportModal();
      }
    };

    const handleMyActivitiesDateChange = (date, dateString) => {
      setSelectedMyActivtiesDate(dateString);
    };

    const handleExportMyActivities = async () => {
      try {
        setExportingMyActivitiesLoading(true); // Set the loading state to true
        let url = `${BASE_URL}/files/activities/own_timesheet/${user.user_id}`;

        if (selectedMyActivitiesDate) {
          const formattedDate = `${selectedMyActivitiesDate}-01`;
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
          const blob = new Blob([response.data], { type: 'application/ms-excel' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `my_timesheet_${selectedMyActivitiesDate}_${user.username}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          message.success('User activities exported successfully');
        } else {
          message.error('Failed to export user activities');
          }
      } catch (error) {
        message.error('Failed to export user activities');
      } finally {
        setExportingMyActivitiesLoading(false); // Set the loading state back to false when the export is finished
        closeMyActivitiesExportModal()
      }
    };

    const handleDateChange = (date, dateString) => {
      setSelectedDate(dateString);
    };

    const handleExportDateChange = (date, dateString) => {
      setExportDate(dateString);
    };

    let api = useAxios();

    useEffect(()=>{
      getMyActivities();
    }, [selectedMyActivitiesDate])

    const columns = [
      {
        title: 'First Name',
        dataIndex: 'user__first_name',
        key: 'user__first_name',
        render: (text, record) => <p>{record.user__first_name}</p>
      },
      {
        title: 'Last Name',
        dataIndex: 'user__last_name',
        key: 'user__last_name',
        render: (text, record) => <p>{record.user__last_name}</p>
      },
      {
        title: 'Email',
        dataIndex: 'user__email',
        key: 'user__email',
        render: (text, record) => <p>{record.user__email}</p>,
      },
      {
        title: 'Working Days (C)',
        dataIndex: 'working_days',
        key: 'working_days',
        render: (text, record) => <Tag key={record.id} color="blue">{record.working_days_cairo+"/"+record.total_days_cairo}</Tag>
      },
      {
        title: 'Working Days (J)',
        dataIndex: 'working_days',
        key: 'working_days',
        render: (text, record) => <Tag key={record.id} color="red">{record.working_days_japan+"/"+record.total_days_japan}</Tag>
      },
    ];

    const my_activities_data_source = myActivities.map(item => ({ ...item, key: item.id }));

    const my_activities_column = [
      {
        title: 'First Name',
        dataIndex: 'firstName',
        key: 'firstName',
        render: (text, record) => <p>{record.firstName}</p>,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search First Name"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => confirm()}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              Search
            </Button>
            <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </div>
        ),
        onFilter: (value, record) => record.firstName.toLowerCase().includes(value.toLowerCase()),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      },
      {
        title: 'Last Name',
        dataIndex: 'lastName',
        key: 'lastName',
        render: (text, record) => <p>{record.lastName}</p>,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search Last Name"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => confirm()}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              Search
            </Button>
            <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </div>
        ),
        onFilter: (value, record) => record.lastName.toLowerCase().includes(value.toLowerCase()),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      },
      {
        title: 'Activity Type',
        dataIndex: 'activityType',
        key: 'activityType',
        render: (text, record) => <p>{record.activityType}</p>,
      },
      {
        title: 'Activity Date',
        dataIndex: 'activityDate',
        key: 'activityDate',
        render: (text, record) => <p>{record.activityDate}</p>
      },
      {
        title: 'Activity',
        dataIndex: 'userActivity',
        key: 'userActivity',
        width: '60%',
        render: (text, record) => <p>{record.userActivity}</p>
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        width: '13%',
        render: (text, record) => <Button
        type="primary"
        disabled={isEditButtonDisabled(record.activityDate)}
        onClick={() => {
          setEditModalVisible(true);
          setSelectedActivity(record); // record is the current activity being edited
        }}
      >
        Edit/Delete Activity
      </Button>
      },
    ];

    const columns_data_source = activities.map(item => ({ ...item, key: item.id }));

const handleAdminCreateActivity = async (values) => {
  try {
    await axios.post(
      `${BASE_URL}/activity/admin/log/${values.adminUser}/`,
      {
        userActivity: values.adminActivity,
        activityType: values.adminActivityType,
        activityDate: values.adminActivityDate
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access),
        },
      }
    );
    getMyActivities();
    getUserActivities();

    notification.success({
      message: 'Create Activity Success',
      description: `Hey ${jwt_decode(authTokens.access).username}, You have successfully created a new activity`,
    });

    setOpen(false);
  } catch (error) {
    if (error.response && error.response.status === 500) {
      notification.error({
        message: 'Server Error',
        description: `Failed to create activity. ${error.response.data.detail}`,
      });
    } else {
      notification.error({
        message: 'Create Activity Error',
        description: `Failed to create activity. ${error.response.data.detail}`,
      });
    }

    setOpen(false);

    // Only trigger getUserActivities if there's an actual error
    if (error.response && error.response.status !== 500) {
      getUserActivities();
    }
  }
}

// Create activity
const handleCreateActivity = async (values) => {
  try {
    // Make a POST request to create a new activity

    await axios.post(
      `${BASE_URL}/activity/create_activity/`,
      {
        userActivity: values.Activity,
        activityType: values.activityType,
        activityDate: values.activityDate
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access),
        },
      }
    );
    getMyActivities();
    getUserActivities();

    notification.success({
      message: 'Create Activity Success',
      description: `Hey ${jwt_decode(authTokens.access).username}, You have successfully created a new activity`,
    });

    // Close the modal
    setOpen(false);
  } catch (error) {
    if (error.response && error.response.status === 500) {
      notification.error({
        message: 'Server Error',
        description: `Failed to create activity. ${error.response.data.detail}`,
      });
    } else {
      notification.error({
        message: 'Create Activity Error',
        description: `Failed to create activity. ${error.response.data.detail}`,
      });
    }

    setOpen(false);

    // Only trigger getUserActivities if there's an actual error
    if (error.response && error.response.status !== 500) {
      getUserActivities();
    }
  }
};

  let getUserActivities = async () => {
    setTableLoading(true);

    try {
      let url = 'activity/calculate_activity/';

      if (selectedDate) {
        const formattedDate = `${selectedDate}-01`;
        url += `?date=${formattedDate}`;
      }
  
      const response = await api.get(url);

      if (response.status === 200) {
        setActivities(response.data);
        setTableLoading(false);
      } else if (response.statusText === 'Unauthorized') {
        logoutUser();
        setTableLoading(false);
      }
      setTableLoading(false);
    } catch (error) {
      setTableLoading(false);
    }
  };

  const getMyActivities = async () => {
    setMyActivitiesLoading(true);

    try {
      let url = 'activity/my_activities';

      if (selectedMyActivitiesDate) {
        const formattedDate = `${selectedMyActivitiesDate}-01`;
        url += `?date=${formattedDate}`;
      }
      const response = await api.get(url);
      if (response.status === 200) {
        setMyActivities(response.data);
        setMyActivitiesLoading(false);
      } else if (response.statusText === 'Unauthorized') {
        logoutUser();
        setMyActivitiesLoading(false);
      }
      setMyActivitiesLoading(false);
    } catch (error) {
      setMyActivitiesLoading(false);
    }
  };

  const handleUpdateActivity = async (activityId, values) => {
    try {
      // Make a PATCH request to update the activity
      setMyActivitiesLoading(true);
      await axios.patch(
        `${BASE_URL}/activity/edit_activity/${activityId}/`,
        values,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + String(authTokens.access),
          },
        }
      );

      // Refresh the activities list
      getMyActivities();
      setEditModalVisible(false);
      setMyActivitiesLoading(false);
      notification.success({
        message: 'Edit Activity Success',
        description: `Activity updated successfully`,
      });
    } catch (error) {
      getMyActivities();
      setEditModalVisible(false);
      setMyActivitiesLoading(false);
      notification.error({
        message: 'Edit Activity Failure',
        description: 'Failed to update activity!',
      });
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
        // Make a delete request to update the activity
        setMyActivitiesLoading(true);
        await axios.delete(
          `${BASE_URL}/activity/delete_activity/${activityId}/`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + String(authTokens.access),
            },
          }
        );

        // Refresh the activities list
        getMyActivities();
        setEditModalVisible(false);
        setMyActivitiesLoading(false);
        notification.success({
          message: 'Delete Activity Success',
          description: `Activity deleted successfully`,
        });
      } catch (error) {
        getMyActivities();
        setEditModalVisible(false);
        setMyActivitiesLoading(false);
        notification.error({
          message: 'Delete Activity Failure',
          description: 'Failed to delete activity!',
        });
    }
  };

    return (
      <div style={{ width: '100%',display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{ backgroundColor: '#f8f9fa', width: "90%", marginTop: 15, borderRadius: 6 }}>
          <h1 style={{fontSize: 18}}><SyncOutlined spin /> NOCE Dashboard - Today's Date: {formattedDate}</h1>
        </div>
        <div style={{ width: '90%', overflowX: 'auto', margin: 15 }}>
            <div style={{margin: 10}}>
              <DatePicker onChange={handleDateChange} picker="month" />
            </div>

            <Table
            columns={columns}
            dataSource={columns_data_source}
            rowKey={(record) => record.user__id}
            style={{ width: '100%' }} // Set the width to 100%
            columnWidth={100}
            loading={tableLoading ? true : false}
            size={"middle"}
            />
       <div style={{ backgroundColor: '#f8f9fa',  marginTop: 40, height:40, alignItems:"center", display:"flex", borderRadius: 6 }}>
        <h1 style={{ fontSize: 18, marginLeft: 15 }}>
          {user.isAdmin || user.is_superuser
            ? `All Activities`
            : `My Activities`}
        </h1>
        </div>
        <div style={{margin: 10}}>
              <DatePicker onChange={handleMyActivitiesDateChange} picker="month" />
        </div>
        <div style={{ width: '100%', overflowX: 'auto', margin: 15 }}>
            <Table
              columns={my_activities_column}
              dataSource={my_activities_data_source}
              rowKey={(record) => record.id}
              style={{ width: '100%' }} // Set the width to 100%
              columnWidth={100}
              size={"middle"}
              loading={myActivitiesLoading}
            />
          </div>
      </div>
      <div style={{ display: 'flex',width: '90%', justifyContent: 'center' }}>
        {/* <Button
          type="primary"
          onClick={() => {
            setOpen(true);
          }}
          style={{ width: '40%' }}
        >
          {user.isAdmin || user.is_superuser ? 'Log User Activity' : 'Log Activity'} <PlusCircleFilled />
        </Button> */}

        {user.isAdmin || user.is_superuser ? (
          <Button
            type="primary"
            onClick={() => {
              setOpenAdminLog(true);
            }}
            style={{ width: '40%' }}
          >
            Log User Activity <PlusCircleFilled />
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={() => {
              setOpen(true);
            }}
            style={{ width: '40%' }}
          >
            Log Activity <PlusCircleFilled />
          </Button>
        )}
        <CreateActivityForm open={open} onCreate={handleCreateActivity} onCancel={() => setOpen(false)} />
        <CreateActivityAdminForm open={openAdminLog} onCreate={handleAdminCreateActivity} onCancel={() => setOpenAdminLog(false)} adminUser={adminUser} // Pass adminUser state as a prop
                onAdminUserChange={handleAdminUserChange}/>
      </div>
      <div style={{ display: 'flex',width: '90%', margin:15, justifyContent: 'center' }}>
        <Button
          type="primary"
          variant="success"
          onClick={exportExcelActivities}
          style={{ width: '40%' }}
          disabled={exporting || !user.isAdmin} // Use the disabled prop
        >
          {exporting ? 'Exporting...' : 'Export Timesheet '} <ExportOutlined />
        </Button>
        <Modal
          title="Export Timesheet"
          open={exportModalVisible}
          onOk={handleExportConfirm}
          confirmLoading={exporting}
          onCancel={closeExportModal}
          key={exportModalVisible}
        >
          {renderExportModalContent()}
        </Modal>
      </div>

      <div style={{ display: 'flex',width: '90%', justifyContent: 'center' }}>
        <Button
          type="primary"
          variant="success"
          onClick={exportExcelMyActivities}
          style={{ width: '40%' }}
        >
          {exporting ? 'Exporting My Timesheet..' : 'Export My Timesheet '} <ExportOutlined />
        </Button>
        <Modal
          title="Export My Individual Timesheet"
          open={exportModalMyActivities}
          onOk={handleExportMyActivities}
          confirmLoading={exportingMyActivitiesLoading}
          onCancel={closeMyActivitiesExportModal}
          key={exportModalMyActivities}
        >
          {renderMyTimesheetModalContent()}
        </Modal>
      </div>

      <EditActivityForm
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onDelete={handleDeleteActivity}
        onUpdate={handleUpdateActivity}
        selectedActivity={selectedActivity}
      />
      </div>
    )
  }

  export default HomePage