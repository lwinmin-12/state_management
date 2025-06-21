"use client";

import { List, Avatar, Spin, Divider, Typography, Space, Skeleton } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  UserOutlined,
  TeamOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useMessageApi } from "@/redux/Provider";
import { v4 as uuidv4 } from "uuid"; // Import uuid for unique keys
const { Text } = Typography;

const InfiniteScrollList = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messageApi = useMessageApi();

  const loadMoreData = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await axios.get("/api/player", {
        params: {
          page,
          per_page: 20,
        },
      });

      const newPlayers = response.data.data || [];
      setPlayers((prev) => [...prev, ...newPlayers]);
      setHasMore(newPlayers.length > 0);
      setPage((prev) => prev + 1);
    } catch (error: any) {

      if (error.response && error.response.status === 429) {
        messageApi.open({
          type: "warning",
          content: "Too many requests. Please try again later.",
        });
      } else {
       messageApi.open({
        type: "error",
        content: "Failed to fetch players. Please try again later.",
      });
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoreData();
  }, []);

  return (
    <div
      id="scrollableDiv"
      className="h-[800px] overflow-auto !px-4 border border-gray-400/35 mx-auto !my-10"
    >
      <InfiniteScroll
        dataLength={players.length}
        next={loadMoreData}
        hasMore={players.length < 200 && hasMore} 
        loader={ loading && (<Skeleton avatar paragraph={{ rows: 1 }} active />)}
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={players}
          renderItem={(player) => (
            <List.Item
              key={uuidv4()} 
              style={{
                padding: "30px 16px", 
                margin: "8px 0", 
                borderRadius: "8px", 
                border: "1px solid #oklch(70.7% 0.022 261.325)", 
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://i.pravatar.cc/150?u=${player.id}`}
                    icon={<UserOutlined />}
                    size={64} //
                    style={{
                      minWidth: "64px",
                      marginRight: "20px", 
                    }}
                  />
                }
                title={
                  <Text strong style={{ fontSize: "18px" }}>
                    {" "}
                    {player.first_name} {player.last_name}
                  </Text>
                }
                description={
                  <Space size="large" style={{ marginTop: "12px" }}>
                    {" "}
                    <span style={{ fontSize: "15px" }}>
                      {" "}
                      <TeamOutlined
                        style={{ marginRight: "8px", fontSize: "16px" }}
                      />
                      {player.position || "N/A"}
                    </span>
                    <span style={{ fontSize: "15px" }}>
                      <EnvironmentOutlined
                        style={{ marginRight: "8px", fontSize: "16px" }}
                      />
                      {player.team?.full_name || "N/A"}
                    </span>
                  </Space>
                }
                style={{
                  alignItems: "center", 
                  display: "flex",
                  flexWrap: "wrap",
                }}
              />
            </List.Item>
          )}
        />
      </InfiniteScroll>
    </div>
  );
};

export default InfiniteScrollList;
