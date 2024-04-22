import React, { useState, useEffect, useContext } from 'react';
import { Modal, Form, Input, Select, DatePicker, Space } from 'antd';
import axios from 'axios';
import BASE_URL from '../constants';
import AuthContext from "../context/AuthContext";

const CreateActivityAdminForm = ({open, onCreate, onCancel, adminUser, onAdminUserChange}) => {
    let {authTokens} = useContext(AuthContext);
    const [form] = Form.useForm();
    const { TextArea } = Input;
    const [disableTextArea, setDisableTextArea] = useState(false);

    const [users, setUsers] = useState([]);
    const [user, setSelectedUser] = useState(null);
    const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const handleUserChange = (value) => {
        setSelectedUser(value);
        onAdminUserChange(value); // Call the function passed from HomePage to handle adminUser change
    };

    useEffect(() => {
        fetchUsers();
      }, []);
      
    useEffect(() => {
        // Set initial state based on the default value of activityType
        const initialValue = form.getFieldValue('activityType');
        setDisableTextArea(initialValue === 0 || initialValue === 2);
      }, [form]);
  
      const handleActivityTypeChange = (value) => {
        setDisableTextArea(value === 0 || value === 2);
      };

      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/user/get_users/`, {
            headers: {
              'Authorization': 'Bearer ' + String(authTokens.access),
            },
          });
          setUsers(response.data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };

    return (
        <Modal
          forceRender
          open={open}
          width={1020}
          title="Add Activity For User"
          okText="Create"
          cancelText="Cancel"
          onCancel={onCancel}
          onOk={() => {
            form
              .validateFields()
              .then((values) => {
                form.resetFields();
                setDisableTextArea(false);
                onCreate(values);
              })
              .catch((info) => {
                console.log('Validate Failed:', info);
              });
          }}
        >
          <Form
            form={form}
            layout="vertical"
            name="form_in_modal"
            initialValues={{
              modifier: 'public',
            }}
          >
            <Form.Item name="adminUser" label="Select User">
            <Select
                showSearch
                placeholder="Select User"
                optionFilterProp="children"
                filterOption={filterOption}
                onChange={handleUserChange}
                options={users.map(user => ({ value: user.id, label: user.username }))}
              />
            </Form.Item>
            <Form.Item name="adminActivityDate" label="Choose activity date">
              <Space direction="vertical">
                <DatePicker
                  onChange={(date, dateString) => form.setFieldsValue({ 'adminActivityDate': dateString })}
                  format="YYYY-MM-DD"
                />
              </Space>
            </Form.Item>
            <Form.Item name="adminActivityType" label="Activity Type">
            <Select
                showSearch
                placeholder="Select activity type"
                optionFilterProp="children"
                filterOption={filterOption}
                onChange={handleActivityTypeChange}
                options={[
                  {
                    value: 0,
                    label: 'H: Official & Public Holidays',
                  },
                  {
                    value: 1,
                    label: 'C: In Cairo',
                  },
                  {
                    value: 2,
                    label: 'X: Day Off (Annual leave)',
                  },
                  {
                    value: 3,
                    label: 'J: Home assignment',
                  },
                ]}
              />
              </Form.Item>
  
            <Form.Item name="adminActivity" label="Activity">
              <TextArea
                style={{
                  height: 120,
                  resize: 'none',
                }}
                placeholder="Log today's activity here (optional)"
                disabled={disableTextArea}
              />
            </Form.Item>
          </Form>
        </Modal>
      );
    };

export default CreateActivityAdminForm