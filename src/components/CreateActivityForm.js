import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';

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

    return (
      <Modal
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
                  label: 'H: official holiday',
                },
                {
                  value: 1,
                  label: 'C: in office',
                },
                {
                  value: 2,
                  label: 'X: day off',
                },
                {
                  value: 3,
                  label: 'J: Home assignment (japan)',
                },
              ]}
            />
            </Form.Item>

          <Form.Item name="Activity" label="Activity">
            <TextArea
              showCount
              maxLength={256}
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