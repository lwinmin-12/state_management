"use client";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { login, logout } from "@/redux/slice/loginSlice";
import { Layout, Menu, Button, Avatar, Space, Drawer } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  MenuOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const Navbar = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const username = useSelector((state: RootState) => state.auth.username);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    dispatch(login({ username: storedUsername }));
  }

  const menuItems = [
    {
      key: "/infiniteScroll",
      icon: <UnorderedListOutlined />,
      label: <Link href="/infiniteScroll">Players</Link>,
    },
    {
      key: "/",
      icon: <TeamOutlined />,
      label: <Link href="/">Team Formation</Link>,
    },
  ];

  return (
    <>
      {username && (
        <Header className="w-full z-10 bg-white shadow-sm flex justify-between items-center px-4">
          <div className="flex items-center md:hidden">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
            />
          </div>
          <Space className="cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span>{username}</span>
          </Space>
          <div className="hidden md:flex">
            <Menu
              theme="light"
              mode="horizontal"
              selectedKeys={[pathname]}
              items={menuItems}
              className="flex-1 !bg-[#001529] justify-center border-0"
            />
          </div>

        <div className="hidden md:flex items-center">
 <Button
            color="danger"
            variant="outlined"
            onClick={() => {
              router.push("/login");
              dispatch(logout());
            }}
          >
            <LogoutOutlined />
            <span>Logout</span>
          </Button>

        </div>
         
          <Drawer
            title={`Welcome, ${username}`}
            placement="left"
            onClose={() => setMobileMenuVisible(false)}
            open={mobileMenuVisible}
            width={250}
          >
            <Menu
              mode="vertical"
              selectedKeys={[pathname]}
              items={menuItems}
              onClick={() => setMobileMenuVisible(false)}
            />
            <div className="mt-4 p-4 ">
              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={() => {
                  setMobileMenuVisible(false);
                  router.push("/login");
                  dispatch(logout());
                }}
              >
                Logout
              </Button>
            </div>
          </Drawer>
        </Header>
      )}
    </>
  );
};

export default Navbar;
