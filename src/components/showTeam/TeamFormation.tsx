"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { z, ZodError } from "zod";
import {
  Button,
  Input,
  Modal,
  Table,
  Typography,
  Space,
  message,
  Spin,
  List,
  Divider,
  Card,
  Row,
  Col,
  Select,
  Avatar,
  Tag,
  Form,
  Popconfirm,
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  TeamOutlined,
  UserAddOutlined,
  GlobalOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { useMessageApi } from "@/redux/Provider";

const { Title, Text } = Typography;
const { Option } = Select;

const TeamFormation: React.FC = () => {
  const TeamSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    playerCount: z.number().int().min(0),
    region: z.string().min(2, "Region must be at least 2 characters"),
    country: z.string().min(2, "Country must be at least 2 characters"),
  });

  interface Team {
    id: string;
    name: string;
    playerCount: number;
    region: string;
    country: string;
    players: Player[];
  }

  interface Player {
    id: string;
    first_name: string;
    height_feet: number | null;
    height_inches: number | null;
    last_name: string;
    position: string;
    team?: {
      full_name: string;
    };
  }

  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [addPlayerModalVisible, setAddPlayerModalVisible] = useState(false);
  const [viewTeamModalVisible, setViewTeamModalVisible] = useState(false);
  const [form] = Form.useForm();

  const [clickedTeamDetails, setClickedTeamDetails] = useState<Team>();
  const [selectedAddPlayer, setSelectedAddPlayer] = useState<Player>();
  const [playerFetchLoading, setPlayerFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messageApi = useMessageApi();

  useEffect(() => {
    const storedTeams = localStorage.getItem("teams");
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    const fetchPlayers = async () => {
      setPlayerFetchLoading(true);
      try {
        const res = await axios.get("/api/player", {
          params: {
            search: searchTerm,
            page: 1,
            per_page: 10,
          },
        });
        const uniquePlayers = filterUniquePlayers(teams, res.data.data);
        setPlayers(uniquePlayers);
      } catch (error) {
        messageApi.open({
          type: "error",
          content: "Failed to fetch players. Please try again later.",
        });
      } finally {
        setPlayerFetchLoading(false);
      }
    };
    fetchPlayers();
  }, [teams]);

  const filterUniquePlayers = (
    teams: Team[],
    allPlayers: Player[]
  ): Player[] => {
    const uniquePlayerIds = new Set<string>();
    teams.forEach((team) => {
      team.players.forEach((player) => uniquePlayerIds.add(player.id));
    });
    return allPlayers.filter((player) => !uniquePlayerIds.has(player.id));
  };

  const openModal = (team: Team | null = null) => {
    setCurrentTeam(team);
    form.setFieldsValue({
      name: team?.name || "",
      playerCount: team?.playerCount || 0,
      region: team?.region || "",
      country: team?.country || "",
    });
    setModalVisible(true);
  };

  const handleCreateUpdateTeam = async () => {
    try {
      const values = await form.validateFields();
      values.playerCount = Number(values.playerCount);
      const validatedData = TeamSchema.parse(values);

      if (!currentTeam) {
        const newTeam: Team = {
          id: Date.now().toString(),
          ...validatedData,
          players: [],
        };

        if (
          teams.some(
            (team) => team.name.toLowerCase() === newTeam.name.toLowerCase()
          )
        ) {
          messageApi.open({
            type: "error",
            content: "Team with this name already exists!",
          });
          return;
        }

        setTeams((prev) => [...prev, newTeam]);
        messageApi.open({
          type: "success",
          content: "Team created successfully!",
        });
      } else {
        setTeams((prev) =>
          prev.map((team) =>
            team.id === currentTeam.id ? { ...team, ...validatedData } : team
          )
        );
        messageApi.open({
          type: "success",
          content: "Team updated successfully!",
        });
      }

      setModalVisible(false);
    } catch (error) {
      if (error instanceof ZodError) {
        // message.error("Validation Error: " + error.errors[0].message);
        messageApi.open({
          type: "error",
          content: "Validation Error: " + error.errors[0].message,
        });
      }
    }
  };

  const handleRemoveTeam = (team: Team) => {
    setTeams(teams.filter((t) => t.id !== team.id));
    setPlayers([...players, ...team.players]);
    messageApi.open({
      type: "success",
      content: "Team removed successfully!",
    });
  };

  const handleAddPlayerToSelectedTeam = (team: Team) => {
    if (!selectedAddPlayer) return;

    const updatedPlayers = players.filter((p) => p.id !== selectedAddPlayer.id);
    setPlayers(updatedPlayers);

    const updatedTeams = teams.map((t) => {
      if (t.id === team.id) {
        return {
          ...t,
          players: [...t.players, selectedAddPlayer],
          playerCount: t.playerCount + 1,
        };
      }
      return t;
    });

    setTeams(updatedTeams);
    setAddPlayerModalVisible(false);
    messageApi.open({
      type: "success",
      content: `${selectedAddPlayer.first_name} ${selectedAddPlayer.last_name} added to ${team.name}`,
    });
  };

  const filteredPlayers = players.filter(
    (player) =>
      `${player.first_name} ${player.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      player.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlayerHeight = (player: Player) => {
    if (player.height_feet && player.height_inches) {
      return `${player.height_feet}'${player.height_inches}"`;
    }
    return "N/A";
  };

  return (
    <div className="p-2 md:p-5">
      <Row
        gutter={[16, 16]}
        justify="space-between"
        align="middle"
        className="!m-5"
      >
        <Col xs={24} md={12}>
          <Title level={2} className="!mb-0">
            <TeamOutlined className="mr-2" />
            Team Formation
          </Title>
        </Col>
        <Col xs={24} md={12} className="text-right">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            size="large"
          >
            Create Team
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <Card
            title={
              <Space>
                <TeamOutlined />
                <Text strong>Teams</Text>
                <Badge count={teams.length} showZero color="#52c41a" />
              </Space>
            }
          >
            {teams.length === 0 ? (
              <div className="text-center py-8">
                <Text type="secondary">No teams created yet</Text>
              </div>
            ) : (
              <Table
                scroll={{ x: true }}
                dataSource={teams}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: "Name",
                    dataIndex: "name",
                    render: (text: string) => <Text strong>{text}</Text>,
                  },
                  {
                    title: "Country",
                    dataIndex: "country",
                    responsive: ["md"],
                    render: (text: string) => (
                      <Tag icon={<GlobalOutlined />}>{text}</Tag>
                    ),
                  },
                  {
                    title: "Player Count",
                    dataIndex: "playerCount",
                    render: (count: number) => (
                      <Tag icon={<NumberOutlined />}>{count} players</Tag>
                    ),
                  },
                  {
                    title: "Actions",
                    key: "actions",
                    render: (_, team) => (
                      <Space>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => openModal(team)}
                          type="text"
                        />
                        <Popconfirm
                          title="Are you sure to delete this team?"
                          onConfirm={() => handleRemoveTeam(team)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button
                            icon={<DeleteOutlined />}
                            type="text"
                            danger
                          />
                        </Popconfirm>
                        <Button
                          icon={<InfoCircleOutlined />}
                          onClick={() => {
                            setClickedTeamDetails(team);
                            setViewTeamModalVisible(true);
                          }}
                          type="text"
                        />
                      </Space>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        <Col span={24} md={12}>
          <Card
            title={
              <Space>
                <UserAddOutlined />
                <Text strong>Available Players</Text>
                <Badge count={players.length} showZero />
              </Space>
            }
            extra={
              <Input.Search
                placeholder="Search players..."
                allowClear
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            }
          >
            {playerFetchLoading ? (
              <div className="text-center py-8">
                <Spin size="large" />
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-8">
                <Text type="secondary">No available players</Text>
              </div>
            ) : (
              <Table
                scroll={{ x: true }}
                dataSource={filteredPlayers}
                rowKey="id"
                loading={playerFetchLoading}
                pagination={false}
                columns={[
                  {
                    title: "Name",
                    dataIndex: "first_name",
                    render: (_, player) => (
                      <Space>
                        <Avatar
                          src={`https://i.pravatar.cc/150?u=${player.id}`}
                        >
                          {player.first_name.charAt(0)}
                        </Avatar>
                        {player.first_name} {player.last_name}
                      </Space>
                    ),
                  },
                  {
                    title: "Position",
                    dataIndex: "position",
                    render: (pos: string | null) =>
                      pos ? <Tag>{pos}</Tag> : "-",
                  },
                  {
                    title: "Height",
                    key: "height",
                    render: (_, player) => <Tag>{getPlayerHeight(player)}</Tag>,
                  },
                  {
                    title: "Team",
                    dataIndex: ["team", "full_name"],
                    render: (name: string) =>
                      name ? <Tag color="geekblue">{name}</Tag> : "-",
                  },
                  {
                    title: "Action",
                    key: "action",
                    render: (_, player) => (
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setSelectedAddPlayer(player);
                          setAddPlayerModalVisible(true);
                        }}
                        disabled={teams.length === 0}
                      >
                        Add to Team
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={currentTeam ? "Update Team" : "Create Team"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreateUpdateTeam}
        okText={currentTeam ? "Update" : "Create"}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUpdateTeam}>
          <Form.Item
            label="Team Name"
            name="name"
            rules={[{ required: true, message: "Please input team name!" }]}
          >
            <Input placeholder="Enter team name" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Player Count"
                name="playerCount"
                rules={[
                  { required: true, message: "Please input player count!" },
                ]}
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Region"
                name="region"
                rules={[{ required: true, message: "Please input region!" }]}
              >
                <Input placeholder="Enter region" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: "Please input country!" }]}
          >
            <Input placeholder="Enter country" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Player to Team"
        open={addPlayerModalVisible}
        onCancel={() => setAddPlayerModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedAddPlayer && (
          <div className="mb-4">
            <Card>
              <Row align="middle" gutter={16}>
                <Col>
                  <Avatar
                    src={`https://i.pravatar.cc/150?u=${selectedAddPlayer.id}`}
                    size={64}
                  >
                    {selectedAddPlayer.first_name.charAt(0)}
                  </Avatar>
                </Col>
                <Col flex="auto">
                  <Title level={4} className="!mb-1">
                    {selectedAddPlayer.first_name} {selectedAddPlayer.last_name}
                  </Title>
                  <Space>
                    {selectedAddPlayer.position && (
                      <Tag color="blue">{selectedAddPlayer.position}</Tag>
                    )}
                    <Tag>{getPlayerHeight(selectedAddPlayer)}</Tag>
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        )}

        <Title level={5} className="!mb-4">
          Select Team
        </Title>

        {teams.length === 0 ? (
          <div className="text-center py-4">
            <Text type="warning">
              No teams available. Please create a team first.
            </Text>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {teams.map((team) => (
              <Col span={24} md={12} key={team.id}>
                <Card
                  hoverable
                  onClick={() => handleAddPlayerToSelectedTeam(team)}
                >
                  <Space>
                    <Avatar style={{ backgroundColor: "#1890ff" }}>
                      {team.name.charAt(0)}
                    </Avatar>
                    <div>
                      <Text strong>{team.name}</Text>
                      <div>
                        <Text type="secondary">{team.playerCount} players</Text>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <TeamOutlined />
            <Text strong>{clickedTeamDetails?.name} Details</Text>
          </Space>
        }
        open={viewTeamModalVisible}
        onCancel={() => setViewTeamModalVisible(false)}
        footer={null}
        width={1000}
      >
        {clickedTeamDetails && (
          <>
            <Row gutter={16} className="mb-6">
              <Col span={8}>
                <Card size="small" title="Country">
                  <Text>{clickedTeamDetails.country}</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Region">
                  <Text>{clickedTeamDetails.region}</Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Player Count">
                  <Text>{clickedTeamDetails.playerCount}</Text>
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">Players</Divider>

            {clickedTeamDetails.players.length === 0 ? (
              <div className="text-center py-4">
                <Text type="secondary">No players in this team</Text>
              </div>
            ) : (
              <Table
                dataSource={clickedTeamDetails.players}
                rowKey="id"
                pagination={false}
                scroll={{ x: true }}
                columns={[
                  {
                    title: "Player",
                    dataIndex: "first_name",
                    key: "player",
                    render: (_, record) => (
                      <Space>
                        <Avatar
                          src={`https://i.pravatar.cc/150?u=${record.id}`}
                        >
                          {record.first_name.charAt(0)}
                        </Avatar>
                        <Text>
                          {record.first_name} {record.last_name}
                        </Text>
                      </Space>
                    ),
                    fixed: "left",
                  },
                  {
                    title: "Position",
                    dataIndex: "position",
                    key: "position",
                    render: (position) => position || "N/A",
                  },
                  {
                    title: "Height",
                    key: "height",
                    render: (_, record) => getPlayerHeight(record),
                  },
                  {
                    title: "Current Team",
                    key: "current_team",
                    render: (_, record) => record.team?.full_name || "N/A",
                  },
                  {
                    title: "Action",
                    key: "action",
                    fixed: "right",
                    render: (_, player) => (
                      <Button
                        danger
                        onClick={() => {
                          const updatedPlayers =
                            clickedTeamDetails.players.filter(
                              (p) => p.id !== player.id
                            );
                          const updatedTeam = {
                            ...clickedTeamDetails,
                            players: updatedPlayers,
                            playerCount: updatedPlayers.length,
                          };
                          setClickedTeamDetails(updatedTeam);
                          setTeams((prev) =>
                            prev.map((team) =>
                              team.id === updatedTeam.id ? updatedTeam : team
                            )
                          );
                          setPlayers((prev) => [...prev, player]);
                          messageApi.open({
                            type: "success",
                            content: `${player.first_name} ${player.last_name} removed from ${clickedTeamDetails.name}`,
                          });
                        }}
                      >
                        Remove
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default TeamFormation;
