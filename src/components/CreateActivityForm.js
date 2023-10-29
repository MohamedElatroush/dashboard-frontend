import React from 'react';
import {Modal, Form, Input } from 'antd';

const CreateActivityForm = ({ open, onCreate, onCancel }) => {
    const [form] = Form.useForm();
    const { TextArea } = Input;

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
          <Form.Item name="Activity" label="Activity">
            <TextArea
              showCount
              maxLength={256}
              style={{
                height: 120,
                resize: 'none',
              }}
              placeholder="Log today's activity here"
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

export default CreateActivityForm