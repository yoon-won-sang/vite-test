import React from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import type { LoginValues } from '../types/auth' // 실제 경로에 맞게 조정 필요

interface LoginFormProps {
  onLogin: (values: LoginValues) => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const onFinish = (values: LoginValues) => {
    // For demo purposes, any non-empty username/password works
    if (values.username && values.password) {
      onLogin(values)
      message.success('Welcome back, ' + values.username + '!')
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card" title="Login to Employee Portal" bordered={false}>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              size="large"
              block
            >
              Log in
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', color: '#888' }}>
            <p>Demo credentials: any username / password</p>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default LoginForm
