import { useState } from "react";
import { Layout, Menu, Button, Avatar, Tooltip } from "antd";
import {
    PlusOutlined,
    MessageOutlined,
    ApiOutlined,
    TeamOutlined,
    SearchOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined
} from "@ant-design/icons";

import "./Sidebar.css";
import monarchLogo from "../assets/monarch-logo.png"

const { Sider } = Layout;

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const navigationItems = [
        {
            key: "chat",
            icon: <MessageOutlined />,
            label: "Chat"
        },
        {
            key: "api",
            icon: <ApiOutlined />,
            label: "API"
        },
        {
            key: "community",
            icon: <TeamOutlined />,
            label: "Community"
        }
    ];

    const chatItems = [
        { key: "chat-1", label: "First conversation" },
        { key: "chat-2", label: "Second conversation" },
        { key: "chat-3", label: "Third conversation" }
    ];

    return (
        <Sider motion={true}
            className="sidebar"
            width={250}
            collapsedWidth={80}
            collapsible
            collapsed={collapsed}
            trigger={null}
            theme="dark"
        >
            <div className="sidebar-container">

                {/* BLOCK 1: BRAND HEADER */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <img
                            src={monarchLogo}
                            alt="Monarch Logo"
                            className="sidebar-logo"
                        />
                    </div>

                    <div className="sidebar-header-actions">
                        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
                            <Button
                                type="text"
                                icon={
                                    collapsed
                                        ? <MenuUnfoldOutlined />
                                        : <MenuFoldOutlined />
                                }
                                onClick={() => setCollapsed(!collapsed)}
                            />
                        </Tooltip>
                    </div>
                </div>

                {/* BLOCK 2: NEW CHAT */}
                <div className="sidebar-new-chat">
                    <Button
                        block
                        icon={<PlusOutlined />}
                        className="new-chat-button"
                    >
                        {!collapsed && "New Chat"}
                    </Button>
                </div>

                {/* BLOCK 3: NAVIGATION */}
                <div className="sidebar-navigation">
                    <Menu
                        mode="inline"
                        theme="dark"
                        selectedKeys={["chat"]}
                        items={navigationItems}
                    />
                </div>

                {/* BLOCK 4: CHAT HISTORY */}
                <div className="sidebar-chat-history">
                    {!collapsed && (
                        <div className="chat-history-heading">
                            RECENT CHATS
                        </div>
                    )}

                    <Menu
                        mode="inline"
                        theme="dark"
                        items={chatItems.map((chat) => ({
                            key: chat.key,
                            icon: <MessageOutlined />,
                            label: chat.label
                        }))}
                    />
                </div>

                {/* BLOCK 5: USER PROFILE */}
                <div className="sidebar-user">
                    <Avatar icon={<UserOutlined />} />

                    {!collapsed && (
                        <div className="sidebar-user-details">
                            <span className="sidebar-user-name">
                                Guest User
                            </span>
                            <span className="sidebar-user-status">
                                Account profile
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </Sider>
    );
}

export default Sidebar;
