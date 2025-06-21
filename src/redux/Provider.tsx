"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider } from "@/app/AuthProvider";
import { childrenProps } from "@/types";
import Navbar from "@/components/nav/NavBar";
import { ConfigProvider, theme, message } from "antd";
import { createContext, useContext } from "react";

const MessageContext = createContext<
  ReturnType<typeof message.useMessage>[0] | null
>(null);

export const useMessageApi = () => {
  const ctx = useContext(MessageContext);
  if (!ctx)
    throw new Error("useMessageApi must be used within a Providers tree");
  return ctx;
};

export function Providers({ children }: childrenProps) {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <MessageContext.Provider value={messageApi}>
          {contextHolder}
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </MessageContext.Provider>
      </ConfigProvider>
    </Provider>
  );
}
