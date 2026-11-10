import "./AuthenticationScreen.css";
import purpleLandscape from "../assets/purple-landscape.svg";

function AuthenticationScreen({ children }) {
    return (
        <div className="auth-screen">
            <div className="auth-card">
                <div className="auth-illustration-panel">
                    <img
                        src={purpleLandscape}
                        alt="Monarch AI Landscape"
                        className="auth-illustration-image"
                    />
                </div>
                <div className="auth-form-panel">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AuthenticationScreen;

