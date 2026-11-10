import { Layout } from "antd";
import Sidebar from "./Sidebar/Sidebar";
import ControlPanel from "./ControlPanel/ControlPanel";
import ChatArea from "./ChatArea/ChatArea";
import useAppState from "./state";
import "./App.css";

const { Content } = Layout;
function App() {

    // BLOCK 1: APPLICATION STATE
    const {
        user,
        conversations,
        selectedChatId,
        chatsLoading,
        chatsError,
        chatHistory,
        historyLoading,
        historyError,
        sending,
        sendingError,

        // MODEL STATES
        availableModels,
        selectedModel,
        setSelectedModel,
        modelsLoading,
        modelsError,
        selectedChatTitle,
        handleAuthenticated,
        handleSelectChat,
        handleNewChat,
        handleSendMessage
    } = useAppState();

    // BLOCK 2: APPLICATION LAYOUT
    return (
        <div className="app-container">
            <Layout className="workspace-layout">
                {/* BLOCK 1: LEFT SIDEBAR */}
                <Sidebar
                    user={user}
                    conversations={conversations}
                    chatsLoading={chatsLoading}
                    chatsError={chatsError}
                    selectedChatId={selectedChatId}
                    onSelectChat={handleSelectChat}
                    onNewChat={handleNewChat}
                />

                {/* BLOCK 2: MAIN CHAT WORKSPACE */}
                <Content className="main-workspace">
                    <ChatArea
                        chatTitle={selectedChatTitle}
                        messages={chatHistory}
                        loading={historyLoading}
                        sending={sending}
                        error={historyError || sendingError}
                        onSend={handleSendMessage}

                        // MODEL SELECTOR PROPS
                        availableModels={availableModels}
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        modelsLoading={modelsLoading}
                        modelsError={modelsError}
                    />
                </Content>

                {/* BLOCK 3: RIGHT CONTROL PANEL */}
                <ControlPanel
                    user={user}
                    onAuthenticated={handleAuthenticated}
                />
            </Layout>
        </div>
    );
}
export default App;
