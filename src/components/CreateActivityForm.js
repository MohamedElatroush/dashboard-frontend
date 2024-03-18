import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Space } from 'antd';

const CreateActivityForm = ({ open, onCreate, onCancel }) => {
    const [form] = Form.useForm();
    const { TextArea } = Input;
    const [disableTextArea, setDisableTextArea] = useState(false);

    useEffect(() => {
      // Set initial state based on the default value of activityType
      const initialValue = form.getFieldValue('activityType');
      setDisableTextArea(initialValue === 0 || initialValue === 2);
    }, [form]);

    const handleActivityTypeChange = (value) => {
      setDisableTextArea(value === 0 || value === 2);
    };
    

    // Filter `option.label` match the user type `input`
    const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const onChangeDate = (date, dateString) => {
      form.setFieldsValue({ 'activityDate': dateString })
    };

    const disabledDate = current => {
      // Get the current month and year
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const isFirstFiveDays = currentDate.getDate() <= 5;
      // Get the month and year of the selected date
      const selectedMonth = current.month();
      const selectedYear = current.year();
  
      if (isFirstFiveDays) {
        // Enable all days for the last month
        return !(currentMonth === current.month() && currentYear === current.year()) &&
        !(currentMonth - 1 === current.month() && currentYear === current.year());
      }

      // Disable the date if it's not in the current month or year
      return !(currentMonth === selectedMonth && currentYear === selectedYear);
    };

    return (
      <Modal
        forceRender
        open={open}
        title="Add Activity"
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
          <Form.Item name="activityDate" label="Choose activity date">
            <Space direction="vertical">
              <DatePicker
                onChange={(date, dateString) => form.setFieldsValue({ 'activityDate': dateString })}
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
              />
            </Space>
          </Form.Item>
          <Form.Item name="activityType" label="Activity Type">
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

          <Form.Item name="Activity" label="Activity">
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

export default CreateActivityForm