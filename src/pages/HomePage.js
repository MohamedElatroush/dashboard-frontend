// eslint-disable-next-line
  import React, { useEffect, useState, useContext } from 'react';
  import AuthContext from "../context/AuthContext";
  import { Table, Modal, notification, message, Tag } from 'antd';
  import { Button } from 'react-bootstrap';
  import useAxios from '../utils/useAxios';
  import jwt_decode from "jwt-decode";
  import axios from 'axios';
  import CreateActivityForm from '../components/CreateActivityForm';
  import { PlusCircleFilled, SyncOutlined, ExportOutlined } from '@ant-design/icons';


  const HomePage = () => {
    let [activities, setActivities] = useState([]);
    let {authTokens, logoutUser, user} = useContext(AuthContext);
    const [deleteActivityId, setDeleteActivityId] = useState(null);
    const [tableLoading, setTableLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState('');

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

    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    };

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <p>{record.firstName + " " + record.lastName}</p>
      },
      {
        title: 'HR Code',
        dataIndex: 'hrCode',
        key: 'hrCode',
        render: (text, record) => <Tag color="blue">{record.hrCode}</Tag>
      },
      {
        title: 'Date',
        dataIndex: 'activityDate',
        key: 'activityDate',
        render: (text, record) => <p>{record.activityDate}</p>,
      },
      {
        title: 'Activity Type',
        dataIndex: 'activityType',
        key: 'activityType',
        render: (text, record) => <Tag color="blue">{record.activityType}</Tag>
      },
      {
        title: 'Activtiy',
        dataIndex: 'userActivity',
        key: 'userActivity',
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {record.userActivity && record.userActivity.length > 50 ? (
              <>
                <div style={{ flex: 1 }}>{record.userActivity.slice(0, 50)}...</div>
                <div style={{ marginLeft: '10px' }}>
                  <Button variant="success" size="sm" onClick={() => handleReadMore(record.userActivity)}>
                    Read More
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1 }}>{record.userActivity}</div>
            )}
            {jwt_decode(authTokens.access).username === record.username || user.isAdmin ? (
              <div style={{ marginLeft: '10px'}}>
                <span style={{ marginLeft: '10px' }}></span> {/* Add a gap between buttons */}
                <Button variant="danger" onClick={() => handleDeleteActivity(record)} size='sm'>
                  Delete
                </Button>
              </div>
            ) : (
              <></>
            )}
          </div>
        ),
        width: '45%',
            }
    ];

    const columns_data_source = [...activities];

    const handleReadMore = (content) => {
      setModalContent(content);
      setModalVisible(true);
    };
    const handleModalClose = () => {
      setModalVisible(false);
    };

  // Function to open the edit modal and set the editContent state
  const handleDeleteActivity = (record) => {
    setDeleteActivityId(record.id);
  };

  // Function to handle the submission of edited content
  const handleDeleteSubmit = async () => {
    try {
      // Make a DELETE request to delete the activity
      await axios.delete(`http://127.0.0.1:8000/activity/delete_activity/${deleteActivityId}/`, {
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
      `http://127.0.0.1:8000/activity/create_activity/`,
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
      const response = await api.get('activity/get_activities/');
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
          <h1 style={{fontSize: 18}}><SyncOutlined spin /> Activity Dashboard - Today's Date: {formattedDate}</h1>
        </div>
        <div style={{ width: '90%', overflowX: 'auto', margin: 15 }}>
            <Table
            columns={columns}
            dataSource={columns_data_source}
            rowKey={(record) => record.id}
            style={{ width: '100%' }} // Set the width to 100%
            columnWidth={100}
            loading={tableLoading ? true : false}
            size={"middle"}
            />
            <Modal title="User Logged Activity"  open={modalVisible} onCancel={handleModalClose} onOk={handleModalClose}>
            <p>{modalContent}</p>
          </Modal>

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