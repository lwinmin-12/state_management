"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { z, ZodError } from "zod";
import { login } from "@/redux/slice/loginSlice";
import { Button, Card, Form, Input, Space, Typography } from "antd";
import { UserOutlined } from '@ant-design/icons';

const schema = z.object({
  username: z.string().min(4, "Username must be at least 4 characters"),
});

interface CustomError {
  message: string;
  path: (string | number)[];
}

const Page = ()=> {
  const dispatch = useDispatch();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<CustomError | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleLogin = async ({username} : any) => {
    try {
      schema.parse({ username });
      dispatch(login({ username }));
      router.push("/");
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const firstError = validationError.errors[0];
        const customError: CustomError = {
          message: firstError.message,
          path: firstError.path,
        };
        setError(customError);
      }
    }
  };

return (
  <div className=" flex justify-center items-center min-h-screen">
    <Card
      title={
        <Typography.Title level={3} className="text-center">
          Welcome Back
        </Typography.Title>
      }
      className="w-full max-w-md shadow-lg"
    >
      <Form
        layout="vertical"
        onFinish={handleLogin}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
          validateStatus={error ? 'error' : ''}
          help={error ? error.message : ''}
        >
          <Input
            prefix={<UserOutlined  />}
            placeholder="Enter your username"
            size="large"
            
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="mt-2"
            loading={false}
          >
            Sign In
          </Button>
        </Form.Item>

        {/* <div className="text-center">
          <Space>
            <Typography.Link>Forgot password?</Typography.Link>
            <Typography.Link>Create account</Typography.Link>
          </Space>
        </div> */}
      </Form>
    </Card>
  </div>
);
}

export default Page;
