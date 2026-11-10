
import { useEffect, useRef } from "react";
import "./AuthenticationScreen.css";
import monarchLogo from "../assets/monarch-logo-transparent.png";

// BLOCK 1: INTERACTIVE NETWORK BACKGROUND
function NetworkBackground({ screenRef }) {
    const canvasRef = useRef(null);
    const pointerRef = useRef({
        x: -1000,
        y: -1000,
        active: false
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const screen = screenRef.current;

        if (!canvas || !screen) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        let animationFrame;
        let nodes = [];
        let width = 0;
        let height = 0;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        // BLOCK 1.1: CREATE NETWORK NODES
        const createNodes = () => {
            const area = width * height;
            const nodeCount = Math.min(
                110,
                Math.max(35, Math.floor(area / 14000))
            );

            nodes = Array.from({ length: nodeCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.22,
                vy: (Math.random() - 0.5) * 0.22,
                radius: Math.random() * 1.5 + 0.7
            }));
        };

        // BLOCK 1.2: RESIZE CANVAS
        const resizeCanvas = () => {
            const bounds = screen.getBoundingClientRect();
            const pixelRatio = Math.min(
                window.devicePixelRatio || 1,
                2
            );

            width = bounds.width;
            height = bounds.height;

            canvas.width = Math.floor(width * pixelRatio);
            canvas.height = Math.floor(height * pixelRatio);

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            context.setTransform(
                pixelRatio,
                0,
                0,
                pixelRatio,
                0,
                0
            );

            createNodes();
        };

        // BLOCK 1.3: DRAW NETWORK
        const drawNetwork = () => {
            context.clearRect(0, 0, width, height);

            const pointer = pointerRef.current;
            const connectionDistance = 155;
            const hoverDistance = 230;

            nodes.forEach((node) => {
                if (!reducedMotion) {
                    node.x += node.vx;
                    node.y += node.vy;

                    if (node.x < 0 || node.x > width) {
                        node.vx *= -1;
                    }

                    if (node.y < 0 || node.y > height) {
                        node.vy *= -1;
                    }
                }

                node.x = Math.max(0, Math.min(width, node.x));
                node.y = Math.max(0, Math.min(height, node.y));
            });

            // Draw connections between nearby nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const first = nodes[i];
                    const second = nodes[j];

                    const dx = first.x - second.x;
                    const dy = first.y - second.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity =
                            (1 - distance / connectionDistance) * 0.22;

                        context.beginPath();
                        context.moveTo(first.x, first.y);
                        context.lineTo(second.x, second.y);

                        context.strokeStyle =
                            `rgba(165, 111, 230, ${opacity})`;

                        context.lineWidth = 0.7;
                        context.stroke();
                    }
                }
            }

            // Cursor-reactive connections
            if (pointer.active) {
                nodes.forEach((node) => {
                    const dx = node.x - pointer.x;
                    const dy = node.y - pointer.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < hoverDistance) {
                        const intensity =
                            1 - distance / hoverDistance;

                        const opacity = intensity * 0.75;

                        context.beginPath();
                        context.moveTo(pointer.x, pointer.y);
                        context.lineTo(node.x, node.y);

                        context.strokeStyle =
                            `rgba(195, 143, 255, ${opacity})`;

                        context.lineWidth =
                            0.7 + intensity * 1.2;

                        context.shadowBlur = 12;
                        context.shadowColor = "#b77aff";
                        context.stroke();
                        context.shadowBlur = 0;

                        // Highlight nearby nodes
                        context.beginPath();
                        context.arc(
                            node.x,
                            node.y,
                            node.radius + intensity * 2.5,
                            0,
                            Math.PI * 2
                        );

                        context.fillStyle =
                            `rgba(220, 180, 255, ${opacity})`;

                        context.shadowBlur = 16;
                        context.shadowColor = "#b77aff";
                        context.fill();
                        context.shadowBlur = 0;
                    }
                });

                // Cursor glow
                const glow = context.createRadialGradient(
                    pointer.x,
                    pointer.y,
                    0,
                    pointer.x,
                    pointer.y,
                    150
                );

                glow.addColorStop(0, "rgba(155, 85, 230, 0.12)");
                glow.addColorStop(1, "rgba(155, 85, 230, 0)");

                context.fillStyle = glow;
                context.fillRect(
                    pointer.x - 150,
                    pointer.y - 150,
                    300,
                    300
                );
            }

            // Draw network nodes
            nodes.forEach((node) => {
                context.beginPath();
                context.arc(
                    node.x,
                    node.y,
                    node.radius,
                    0,
                    Math.PI * 2
                );

                context.fillStyle = "rgba(190, 150, 235, 0.65)";
                context.fill();
            });
        };

        // BLOCK 1.4: RECEIVE POINTER EVENTS
        const handleNetworkPointerMove = (event) => {
            pointerRef.current = {
                x: event.detail.x,
                y: event.detail.y,
                active: true
            };

            if (reducedMotion) {
                drawNetwork();
            }
        };

        const handleNetworkPointerLeave = () => {
            pointerRef.current.active = false;

            if (reducedMotion) {
                drawNetwork();
            }
        };

        canvas.addEventListener(
            "auth-pointer-move",
            handleNetworkPointerMove
        );

        canvas.addEventListener(
            "auth-pointer-leave",
            handleNetworkPointerLeave
        );

        // BLOCK 1.5: ANIMATION LOOP
        const animate = () => {
            drawNetwork();

            if (!reducedMotion) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        resizeCanvas();
        animate();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", resizeCanvas);

            canvas.removeEventListener(
                "auth-pointer-move",
                handleNetworkPointerMove
            );

            canvas.removeEventListener(
                "auth-pointer-leave",
                handleNetworkPointerLeave
            );
        };
    }, [screenRef]);

    return (
        <canvas
            ref={canvasRef}
            className="auth-network-canvas"
            aria-hidden="true"
        />
    );
}

// BLOCK 2: AUTHENTICATION SCREEN
function AuthenticationScreen({ children }) {
    const screenRef = useRef(null);

    const handlePointerMove = (event) => {
        const canvas = screenRef.current?.querySelector(
            ".auth-network-canvas"
        );

        if (!canvas || !screenRef.current) return;

        const bounds = screenRef.current.getBoundingClientRect();

        canvas.dispatchEvent(
            new CustomEvent("auth-pointer-move", {
                detail: {
                    x: event.clientX - bounds.left,
                    y: event.clientY - bounds.top
                }
            })
        );
    };

    const handlePointerLeave = () => {
        const canvas = screenRef.current?.querySelector(
            ".auth-network-canvas"
        );

        canvas?.dispatchEvent(
            new CustomEvent("auth-pointer-leave")
        );
    };

    return (
        <div
            className="auth-screen"
            ref={screenRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
        >
            {/* BLOCK 3: INTERACTIVE BACKGROUND */}
            <div className="auth-background">
                <NetworkBackground screenRef={screenRef} />
            </div>

            {/* BLOCK 4: AUTHENTICATION CARD */}
            <div className="auth-card">

                {/* MONARCH BRAND PANEL */}
                <div className="auth-illustration-panel">
                    <div className="auth-brand-content">
                        <img
                            src={monarchLogo}
                            alt="Monarch AI"
                            className="auth-brand-logo"
                        />

                        <div className="auth-brand-divider" />

                        <p className="auth-brand-tagline">
                            Intelligence, with privacy at its core.
                        </p>
                    </div>

                    <div className="auth-brand-decoration" />
                </div>

                {/* EXISTING LOGIN / SIGNUP FORM */}
                <div className="auth-form-panel">
                    {children}
                </div>

            </div>
        </div>
    );
}

export default AuthenticationScreen;
