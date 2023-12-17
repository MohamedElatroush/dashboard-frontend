// eslint-disable-next-line
  import React, { useEffect, useState, useContext } from 'react';
  import AuthContext from "../context/AuthContext";
  import { Table, notification, message, Tag } from 'antd';
  import { Button } from 'react-bootstrap';
  import useAxios from '../utils/useAxios';
  import jwt_decode from "jwt-decode";
  import axios from 'axios';
  import CreateActivityForm from '../components/CreateActivityForm';
  import { PlusCircleFilled, SyncOutlined, ExportOutlined } from '@ant-design/icons';
import BASE_URL from '../constants';


  const HomePage = () => {
    let [activities, setActivities] = useState([]);
    let {authTokens, logoutUser, user} = useContext(AuthContext);
    const [deleteActivityId, setDeleteActivityId] = useState(null);
    const [tableLoading, setTableLoading] = useState(true);
    const [open, setOpen] = useState(false);
    let [myActivities, setMyActivities] = useState([])

    const [exporting, setExporting] = useState(false);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    let api = useAxios();

    useEffect(()=> {
      if (deleteActivityId !== null) {
        handleDeleteSubmit();
      }
      getUserActivities();
    }, [deleteActivityId]);

    useEffect(()=>{
      getMyActivities();
    }, [])

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
        title: 'Working Days',
        dataIndex: 'working_days',
        key: 'working_days',
        render: (text, record) => <Tag key={record.id} color="blue">{record.working_days+"/"+record.total_days}</Tag>
      },
    ];

    const my_activities_data_source = myActivities.map(item => ({ ...item, key: item.id }));

    const my_activities_column = [
      {
        title: 'First Name',
        dataIndex: 'firstName',
        key: 'firstName',
        render: (text, record) => <p>{record.firstName}</p>
      },
      {
        title: 'Last Name',
        dataIndex: 'lastName',
        key: 'lastName',
        render: (text, record) => <p>{record.lastName}</p>
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
        render: (text, record) => <p>{record.userActivity}</p>
      },
    ];

    const columns_data_source = activities.map(item => ({ ...item, key: item.id }));

  //   const handleReadMore = (content) => {
  //     setModalContent(content);
  //     setModalVisible(true);
  //   };
  //   const handleModalClose = () => {
  //     setModalVisible(false);
  //   };

  // // Function to open the edit modal and set the editContent state
  // const handleDeleteActivity = (record) => {
  //   setDeleteActivityId(record.id);
  // };

  // Function to handle the submission of edited content
  const handleDeleteSubmit = async () => {
    try {
      // Make a DELETE request to delete the activity
      await axios.delete(`${BASE_URL}/activity/delete_activity/${deleteActivityId}/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access),
        },
      });

      // Refresh the activities list
      getUserActivities();
      notification.success({
        message: 'Delete Activity Success',
        description: `Hey ${jwt_decode(authTokens.access).username}, You have successfully deleted an activity`,
      });
    } catch (error) {
      getUserActivities();
      notification.error({
        message: 'Delete Activity failure',
        description: 'Failed to delete activity!',
      });
    }
  };

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

    // Refresh the activities list
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
      const response = await api.get('activity/calculate_activity/');
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

  let getMyActivities = async () => {
    setTableLoading(true);

    try {
      const response = await api.get('activity/my_activities/');
      if (response.status === 200) {
        setMyActivities(response.data);
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

  const exportExcelActivities = async () => {
    if (exporting) return; // Prevent multiple clicks while exporting
    try {
      setExporting(true); // Set the loading state to true
      // Make a GET request to the endpoint
      const response = await api.get('activity/export_all/', {
        responseType: 'blob',  // Set the response type to 'blob'
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access),
        },
      });
      // Get the current month and year
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      // Create a blob with the response data
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      // Create a hidden anchor element
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `exported_activities_${currentMonth}_${currentYear}.xlsx`;

      // Append the anchor to the document body
      document.body.appendChild(a);
      // Programmatically click the anchor to trigger the download
      a.click();

      // Remove the anchor from the document
      document.body.removeChild(a);

      message.success('User activities exported successfully');
    } catch (error) {
      message.error('Failed to export user activities');
    } finally {
      setExporting(false); // Set the loading state back to false when the export is finished
    }
  }

    return (
      <div style={{ width: '100%',display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{ backgroundColor: '#f8f9fa', width: "90%", marginTop: 15, borderRadius: 6 }}>
          <h1 style={{fontSize: 18}}><SyncOutlined spin /> NOCE Dashboard - Today's Date: {formattedDate}</h1>
        </div>
        <div style={{ width: '90%', overflowX: 'auto', margin: 15 }}>
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
          <h1 style={{fontSize: 18, marginLeft: 15}}>My Activities</h1>
        </div>
        <div style={{ width: '90%', overflowX: 'auto', margin: 15 }}>
            <Table
              columns={my_activities_column}
              dataSource={my_activities_data_source}
              rowKey={(record) => record.id}
              style={{ width: '100%' }} // Set the width to 100%
              columnWidth={100}
              loading={tableLoading ? true : false}
              size={"middle"}
            />
          </div>
      </div>
      <div style={{ display: 'flex',width: '90%', justifyContent: 'center' }}>
        <Button
          type="primary"
          onClick={() => {
            setOpen(true);
          }}
          style={{ width: '40%' }}
        >
          Log Activity <PlusCircleFilled />
        </Button>
        <CreateActivityForm open={open} onCreate={handleCreateActivity} onCancel={() => setOpen(false)} />
      </div>
      <div style={{ display: 'flex',width: '90%', margin:15, justifyContent: 'center' }}>
        <Button
          type="primary"
          variant="success"
          onClick={() => {
            exportExcelActivities();
          }}
          style={{ width: '40%' }}
          disabled={exporting || !user.isAdmin} // Use the disabled prop
        >
          {exporting ? 'Exporting...' : 'Export Time Sheet for this month'} <ExportOutlined />
        </Button>
      </div>
      </div>
    )
  }

  export default HomePage