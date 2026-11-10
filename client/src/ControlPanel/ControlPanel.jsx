import { useState } from "react";
import { Layout, Button, Tooltip } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    UserOutlined,
    IdcardOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    LogoutOutlined
} from "@ant-design/icons";
import "./ControlPanel.css";

const { Sider } = Layout;

// BLOCK 1: FORMAT DATE AND TIME
function formatDateTime(dateValue) {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata"
    }).format(date);
}

// BLOCK 2: CALCULATE ACCOUNT EXPIRY
function getAccountExpiry(user) {
    if (user?.expires_at) {
        return user.expires_at;
    }

    if (!user?.created_at) {
        return null;
    }

    const createdAt = new Date(user.created_at);

    if (Number.isNaN(createdAt.getTime())) {
        return null;
    }

    const expiryTime = new Date(
        createdAt.getTime() + 24 * 60 * 60 * 1000
    );

    return expiryTime;
}

function ControlPanel({ user = null, onLogout }) {
    const [collapsed, setCollapsed] = useState(false);

    // BLOCK 3: ACCOUNT DETAILS
    const accountExpiry = getAccountExpiry(user);

    // BLOCK 4: PROFILE DETAILS
    const profileDetails = [
        {
            label: "Username",
            value: user?.username || "Not available",
            icon: <UserOutlined />
        },
        {
            label: "UUID",
            value: user?.user_uuid || "Not available",
            icon: <IdcardOutlined />
        },
        {
            label: "Account Created",
            value: formatDateTime(user?.created_at),
            icon: <CalendarOutlined />
        },
        {
            label: "Account Expires",
            value: formatDateTime(accountExpiry),
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
                    <Tooltip
                        title={
                            collapsed
                                ? "Expand panel"
                                : "Collapse panel"
                        }
                    >
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
                                className="control-panel-tab active"
                                type="text"
                                icon={<SettingOutlined />}
                            >
                                Settings
                            </Button>
                        </div>

                        {/* BLOCK 3: SETTINGS CONTENT */}
                        <div className="control-panel-content">

                            {/* PROFILE DETAILS HEADING */}
                            <div className="control-panel-section-heading">
                                <SettingOutlined />
                                <span>Profile Details</span>
                            </div>

                            {/* PROFILE DETAILS */}
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
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* BLOCK 4: LOGOUT */}
                            <div className="control-panel-logout">
                                <Button
                                    danger
                                    block
                                    icon={<LogoutOutlined />}
                                    onClick={onLogout}
                                    disabled={!onLogout}
                                >
                                    Logout
                                </Button>
                            </div>

                        </div>
                    </>
                )}

            </div>
        </Sider>
    );
}

export default ControlPanel;
