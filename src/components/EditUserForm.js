  // eslint-disable-next-line
import React, { useEffect } from 'react';
import { Modal, Form, Select } from 'antd';

const EditUserForm = ({open, record, onCreate, onCancel}) => {
    const [form] = Form.useForm();
    useEffect(() => {
        // Set initial state based on the default value of activityType
        const initialValue = form.getFieldValue('grade');
      }, [form]);
  return (
    <Modal
        forceRender
        open={open}
        title="Edit User"
        okText="Edit"
        cancelText="Cancel"
        onCancel={onCancel}
        onOk={() => {
            form
            .validateFields()
            .then((values) => {
                form.resetFields();
                onCreate(record.id, values); // Pass both id and values to onCreate
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
          <Form.Item name="userGrade" label="Choose user grade">
          <Select
              showSearch
              placeholder="Select user grade"
              optionFilterProp="children"
              options={[
                {
                  value: 0,
                  label: 'A1',
                },
                {
                  value: 1,
                  label: 'A2',
                },
                {
                  value: 2,
                  label: 'A3',
                },
                {
                  value: 3,
                  label: 'B1',
                },
                {
                value: 4,
                label: 'B2',
                },
                {
                value: 5,
                label: 'B3',
                },
                {
                value: 6,
                label: 'B4',
                },
              ]}
            />
            </Form.Item>
        </Form>
      </Modal>
  )
}

export default EditUserForm