import { Card, Button, Form, Input, InputNumber, Select, Space, message } from 'antd'
import type { FormInstance } from 'antd'
import type { EmployeeFormValues } from '../types/employee'

interface EmployeeFormProps {
  form: FormInstance<EmployeeFormValues>
  handleFormSubmit: (values: EmployeeFormValues) => void
}

function EmployeeForm({ form, handleFormSubmit }: EmployeeFormProps) {
  return (
    <Card title="Employee Input Form" className="card-section">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        initialValues={{ department: 'Engineering', status: 'Active' }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter employee name.' }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>

        <Form.Item
          name="age"
          label="Age"
          rules={[{ required: true, message: 'Please enter employee age.' }]}
        >
          <InputNumber style={{ width: '100%' }} min={18} max={100} placeholder="30" />
        </Form.Item>

        <Form.Item
          name="department"
          label="Department"
          rules={[{ required: true, message: 'Please select a department.' }]}
        >
          <Select>
            <Select.Option value="Engineering">Engineering</Select.Option>
            <Select.Option value="Marketing">Marketing</Select.Option>
            <Select.Option value="Finance">Finance</Select.Option>
            <Select.Option value="Sales">Sales</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status.' }]}> 
          <Select>
            <Select.Option value="Active">Active</Select.Option>
            <Select.Option value="Inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Add Employee
            </Button>
            <Button
              onClick={() => {
                form.resetFields()
                message.info('Form reset')
              }}
            >
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default EmployeeForm
