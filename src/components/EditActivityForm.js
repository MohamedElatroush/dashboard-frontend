// EditActivityForm.js
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';



const { Option } = Select;
const activityTypeMapping = {
    'H': 0,
    'C': 1,
    'X': 2,
    'J': 3,
};
const EditActivityForm = ({ open, onUpdate, onCancel, selectedActivity, onDelete }) => {
    // const [currentActivity, setCurrentActivity] = useState(null);

    const [form] = Form.useForm();

    const handleDelete = () => {
        onDelete(selectedActivity.id);
        form.resetFields();
      };

    useEffect(() => {
        if (open && selectedActivity) {
            // setCurrentActivity(selectedActivity);
            form.setFieldsValue({
                userActivity: selectedActivity.userActivity,
                activityType: activityTypeMapping[selectedActivity.activityType],
                activityDate: new Date(selectedActivity.activityDate),
            });
        }
    }, [open, selectedActivity, form]);

    const handleUpdate = () => {
        form.validateFields().then((values) => {
            const { userActivity, activityType } = values;
    
            onUpdate(selectedActivity.id, {
                activityType: activityType, // Use activityType directly from values
                userActivity,
            });
            form.resetFields();
        });
    };
    

    return (
        <Modal
        open={open}
        title="Edit Activity"
        onOk={handleUpdate}
        onCancel={() => {
            form.resetFields();
            onCancel();
        }}
        >
        <Form form={form} layout="vertical">
            <Form.Item name="userActivity" label="Activity">
            <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item name="activityType" label="Activity Type">
                    <Select>
                        <Option value={activityTypeMapping['H']}>H: Official holiday</Option>
                        <Option value={activityTypeMapping['C']}>C: In Cairo</Option>
                        <Option value={activityTypeMapping['X']}>X: Day off</Option>
                        <Option value={activityTypeMapping['J']}>J: Home assignment</Option>
                    </Select>
            </Form.Item>

            <Form.Item>
                <Button type="primary" onClick={handleDelete} style={{ color: 'white', width: '100%', textAlign: 'center' }} danger>
                    Delete Activity
                </Button>
            </Form.Item>
        </Form>
        </Modal>
    );
    };

    export default EditActivityForm;
