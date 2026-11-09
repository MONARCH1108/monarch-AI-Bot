import { useState } from "react";
import { Layout, Button, Tooltip } from "antd";

import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    UserOutlined,
    IdcardOutlined,
    CalendarOutlined,
    ClockCircleOutlined
} from "@ant-design/icons";

import "./ControlPanel.css";

const { Sider } = Layout;

function ControlPanel({ user = null }) {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("Settings");

    const profileDetails = [
        {
            label: "Username",
            value: user?.username,
            icon: <UserOutlined />
        },
        {
            label: "UUID",
            value: user?.user_uuid,
            icon: <IdcardOutlined />
        },
        {
            label: "Account Created",
            value: user?.created_at,
            icon: <CalendarOutlined />
        },
        {
            label: "Account Expires",
            value: user?.expires_at,
            icon: <ClockCircleOutlined />
        }
    ];

    return (
        <Sider
            className="control-panel"
            width={320}
            collapsedWidth={56}
            collapsed={collapsed}
            collapsible
            reverseArrow
            trigger={null}
            theme="dark"
        >
            <div className="control-panel-container">

                {/* BLOCK 1: PANEL HEADER */}
                <div className="control-panel-header">
                    <Tooltip title={collapsed ? "Expand panel" : "Collapse panel"}>
                        <Button
                            type="text"
                            icon={
                                collapsed
                                    ? <MenuFoldOutlined />
                                    : <MenuUnfoldOutlined />
                            }
                            onClick={() => setCollapsed(!collapsed)}
                        />
                    </Tooltip>
                </div>

                {!collapsed && (
                    <>
                        {/* BLOCK 2: PANEL NAVIGATION */}
                        <div className="control-panel-navigation">

                            <Button
                                className={`control-panel-tab ${
                                    activeTab === "Settings" ? "active" : ""
                                }`}
                                type="text"
                                icon={<SettingOutlined />}
                                onClick={() => setActiveTab("Settings")}
                            >
                                Settings
                            </Button>

                            <Button
                                className={`control-panel-tab ${
                                    activeTab === "Account" ? "active" : ""
                                }`}
                                type="text"
                                icon={<UserOutlined />}
                                onClick={() => setActiveTab("Account")}
                            >
                                Account
                            </Button>

                        </div>

                        {/* BLOCK 3: SETTINGS CONTENT */}
                        {activeTab === "Settings" && (
                            <div className="control-panel-content">

                                <div className="control-panel-section-heading">
                                    <SettingOutlined />
                                    <span>Profile Details</span>
                                </div>

                                <div className="profile-details">

                                    {profileDetails.map((item) => (
                                        <div
                                            className="profile-detail-item"
                                            key={item.label}
                                        >
                                            <div className="profile-detail-label">
                                                <span className="profile-detail-icon">
                                                    {item.icon}
                                                </span>

                                                <span>{item.label}</span>
                                            </div>

                                            <div className="profile-detail-value">
                                                {item.value || "Not available"}
                                            </div>
                                        </div>
                                    ))}

                                </div>

                            </div>
                        )}

                        {/* BLOCK 4: ACCOUNT CONTENT */}
                        {activeTab === "Account" && (
                            <div className="control-panel-content">

                                <div className="control-panel-section-heading">
                                    <UserOutlined />
                                    <span>Account</span>
                                </div>

                                <div className="account-placeholder">
                                    <UserOutlined className="account-placeholder-icon" />

                                    <h3>Welcome to Monarch</h3>

                                    <p>
                                        Sign up or log in to access your
                                        personal AI workspace.
                                    </p>

                                    {/* Sign Up and Login will be added here */}

                                </div>

                            </div>
                        )}
                    </>
                )}

            </div>
        </Sider>
    );
}

export default ControlPanel;