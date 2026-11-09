import { Layout } from "antd";

import Sidebar from "./Sidebar/Sidebar";
import ControlPanel from "./ControlPanel/ControlPanel";

import "./App.css";

const { Content } = Layout;

function App() {
    return (
        <div className="app-container">

            <Layout className="workspace-layout">

                {/* BLOCK 1: LEFT SIDEBAR */}
                <Sidebar />

                {/* BLOCK 2: MAIN WORKSPACE */}
                <Content className="main-workspace">
                    {/* Chat component will go here */}
                </Content>

                {/* BLOCK 3: RIGHT CONTROL PANEL */}
                <ControlPanel />

            </Layout>

        </div>
    );
}

export default App;