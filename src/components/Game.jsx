import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import car from "../assets/car.json";
import flag from "../assets/flag.json";

function makeQuestion() {
    const a = Math.floor(Math.random() * 11);
    const b = Math.floor(Math.random() * 11);
    return { a, b, answer: a + b };
}

const PRAISE = ["Well done", "Correct", "Nicely done", "Great work", "Excellent", "Keep it up"];
const WIN_STEPS = 5;
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function Game() {
    const navigate = useNavigate();
    const [steps, setSteps] = useState(0);
    const [q, setQ] = useState(makeQuestion);
    const [input, setInput] = useState("");
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [won, setWon] = useState(false);
    const [showWin, setShowWin] = useState(false);
    const [shake, setShake] = useState(false);

    const [userId] = useState(() => {
        let id = localStorage.getItem("mathRaceUserId");
        if (!id) {
            id = "user_" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("mathRaceUserId", id);
        }
        return id;
    });

    const [stats, setStats] = useState({
        currentStreak: 0,
        bestStreak: 0,
        bestTimeMs: null,
    });

    const [lastRun, setLastRun] = useState({ timeMs: 0, isNewBest: false });

    const startTimeRef = useRef(null);
    const wrongCountRef = useRef(0);
    const inputRef = useRef(null);

    useEffect(() => {
        fetch(`${API_BASE}/stats?userId=${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setStats(data);
            })
            .catch(() => { });
        startTimeRef.current = Date.now();
    }, [userId]);

    useEffect(() => {
        if (!won) inputRef.current?.focus();
    }, [q, won]);

    useEffect(() => {
        if (!showWin) return;
        const t = setTimeout(handleReset, 6000);
        return () => clearTimeout(t);
    }, [showWin]);

    useEffect(() => {
        if (!msg.text || msg.type === "win") return;
        const t = setTimeout(() => setMsg({ text: "", type: "" }), 2500);
        return () => clearTimeout(t);
    }, [msg]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (won) return;

        const val = parseInt(input, 10);
        if (isNaN(val)) {
            setMsg({ text: "Please enter a number.", type: "error" });
            return;
        }

        if (val === q.answer) {
            const next = steps + 1;
            setSteps(next);

            if (next >= WIN_STEPS) {
                const totalTime = Date.now() - startTimeRef.current;
                const isNewBest = stats.bestTimeMs === null || totalTime < stats.bestTimeMs;

                setWon(true);
                setLastRun({ timeMs: totalTime, isNewBest });
                setShowWin(true);

                try {
                    const res = await fetch(`${API_BASE}/finish`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId,
                            timeMs: totalTime,
                            wrongCount: wrongCountRef.current,
                        }),
                    });
                    const data = await res.json();
                    setMsg({ text: data.message || "Amazing!", type: "win" });
                    if (data.stats) setStats(data.stats);
                } catch {
                    setMsg({ text: "Finish line! Great job!", type: "win" });
                }
            } else {
                setMsg({ text: PRAISE[Math.floor(Math.random() * PRAISE.length)], type: "success" });
                setQ(makeQuestion());
                setInput("");
            }
        } else {
            setShake(true);
            setMsg({ text: "Not quite — try again.", type: "error" });
            wrongCountRef.current += 1;
            setInput("");
            setTimeout(() => setShake(false), 420);
        }
    }

    function handleReset() {
        setSteps(0);
        setQ(makeQuestion());
        setInput("");
        setMsg({ text: "", type: "" });
        setWon(false);
        setShowWin(false);
        wrongCountRef.current = 0;
        startTimeRef.current = Date.now();
    }

    const formatStatsTime = (ms) => {
        if (ms === null || ms === undefined) return "--";
        return (ms / 1000).toFixed(1) + "s";
    };

    const formatMMSS = (ms) => {
        if (ms === null || ms === undefined) return "00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const carPct = Math.min((steps / WIN_STEPS) * 82, 82);
    const progressPct = Math.min((steps / WIN_STEPS) * 100, 100);

    return (
        <>
            {/* Win overlay */}
            {showWin && (
                <div
                    className="win-overlay"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 200,
                        background: "rgba(50,46,42,0.8)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                    }}
                >
                    <div
                        className="win-panel"
                        style={{
                            background: "#faf8f4",
                            borderRadius: "24px",
                            border: "1px solid #ddd8d0",
                            padding: "40px 24px",
                            textAlign: "center",
                            maxWidth: "360px",
                            width: "100%",
                            boxShadow: "0 32px 100px rgba(50,46,42,0.25)",
                        }}
                    >
                        {lastRun.isNewBest && (
                            <div
                                style={{
                                    background: "#fef3c7",
                                    color: "#92400e",
                                    fontWeight: 800,
                                    padding: "8px 16px",
                                    borderRadius: "99px",
                                    display: "inline-block",
                                    marginBottom: "16px",
                                    fontSize: "14px",
                                    border: "1px solid #fcd34d",
                                }}
                            >
                                New High Score! 🎉
                            </div>
                        )}

                        <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#a09a92", marginBottom: "8px" }}>
                            Race complete
                        </p>
                        <p style={{ fontFamily: "'Lora', serif", fontSize: "32px", color: "#2e2b27", lineHeight: 1.1, marginBottom: "20px" }}>
                            🏁 Success!
                        </p>

                        <div style={{ background: "#f3f0eb", borderRadius: "20px", padding: "24px 16px", marginBottom: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "16px" }}>
                                <div>
                                    <p style={{ fontSize: "11px", color: "#b0a89e", textTransform: "uppercase", fontWeight: 700 }}>Time Taken</p>
                                    <p style={{ fontSize: "24px", fontWeight: 800, color: "#2e2b27" }}>{formatMMSS(lastRun.timeMs)}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: "11px", color: "#b0a89e", textTransform: "uppercase", fontWeight: 700 }}>Best Time</p>
                                    <p style={{ fontSize: "24px", fontWeight: 800, color: "#9db8a3" }}>{formatMMSS(stats.bestTimeMs)}</p>
                                </div>
                            </div>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "#6b6661" }}>{msg.text || "Wonderful job! You're getting faster."}</p>
                        </div>

                        <button
                            onClick={handleReset}
                            style={{
                                width: "100%",
                                padding: "16px",
                                borderRadius: "16px",
                                border: "none",
                                background: "#9db8a3",
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: "16px",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(157,184,163,0.3)",
                            }}
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* TOP */}
            <div className="top-area">
                <div className="stats-row">
                    <div className="stats-item">
                        <p className="muted-label">Streak</p>
                        <p className="stats-value">{stats.currentStreak} 🔥</p>
                    </div>
                    <div className="stats-item">
                        <p className="muted-label">Best Streak</p>
                        <p className="stats-value">{stats.bestStreak} 🏆</p>
                    </div>
                    <div className="stats-item">
                        <p className="muted-label">Best Time</p>
                        <p className="stats-value">{formatStatsTime(stats.bestTimeMs)} ⚡</p>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <Link
                        to="/"
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#b0a89e", fontWeight: 700, textDecoration: 'none' }}
                    >
                        ← HOME
                    </Link>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: "#9db8a3", whiteSpace: "nowrap" }}>
                        {steps} / {WIN_STEPS}
                    </p>
                </div>

                <div style={{ height: "6px", background: "#eee7de", borderRadius: "99px", overflow: "hidden", marginTop: 10 }}>
                    <div style={{ height: "100%", width: `${progressPct}%`, background: "#9db8a3", borderRadius: "99px", transition: "width 0.4s ease-out" }} />
                </div>
            </div>

            {/* MIDDLE */}
            <div className="mid-area">
                <div className="race-container">
                    <div style={{ height: "100%", background: "linear-gradient(to bottom, #daeaf5 55%, #cad9c8 100%)", width: "100%", position: "relative" }}>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: "#c6d4c2" }} />

                        <div style={{ position: "absolute", bottom: "24%", left: 0, right: 0, display: "flex", justifyContent: "space-evenly", alignItems: "center" }}>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} style={{ height: "3px", width: "clamp(10px, 2vw, 25px)", background: "#b4c4b6", borderRadius: "2px", opacity: 0.6 }} />
                            ))}
                        </div>

                        <div className="car-float" style={{ position: "absolute", bottom: "16%", left: `${carPct}%`, width: "clamp(40px, 10vw, 70px)", transition: "left 0.8s cubic-bezier(0.34, 1.4, 0.64, 1)", zIndex: 10 }}>
                            <Lottie animationData={car} loop style={{ width: "100%" }} />
                        </div>

                        <div style={{ position: "absolute", right: "10px", bottom: "8%", width: "clamp(30px, 7vw, 50px)" }}>
                            <Lottie animationData={flag} loop style={{ width: "100%" }} />
                        </div>
                    </div>
                </div>

                <div className="question-block">
                    <span className="question-num">{q.a}</span>
                    <span className="question-op">+</span>
                    <span className="question-num">{q.b}</span>
                    <span className="question-op">=</span>
                    <span className="question-ans">?</span>
                </div>
            </div>

            {/* BOTTOM */}
            <div className="bottom-area">
                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-row">
                        <input
                            ref={inputRef}
                            className={`math-input${shake ? " do-shake" : ""}`}
                            type="number"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            inputMode="numeric"
                            placeholder="?"
                            disabled={won}
                            autoComplete="off"
                            style={{
                                border: `2px solid ${msg.type === "error" ? "#c9a89a" : msg.type === "success" ? "#9db8a3" : "#d4cec6"
                                    }`,
                            }}
                        />
                        <button type="submit" disabled={won} className="btn-check" style={{ cursor: won ? "not-allowed" : "pointer", opacity: won ? 0.6 : 1 }}>
                            Check
                        </button>
                    </div>
                    <button type="button" onClick={handleReset} className="btn-reset">
                        ↺
                    </button>
                </form>

                <div style={{ minHeight: "40px", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
                    {msg.text && msg.type !== "win" && (
                        <p
                            key={msg.text + msg.type}
                            className="msg-anim"
                            style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                padding: "10px 16px",
                                borderRadius: "12px",
                                textAlign: "center",
                                ...(msg.type === "success" && { background: "#d6e8d8", color: "#3a6840" }),
                                ...(msg.type === "error" && { background: "#f0dbd6", color: "#7a3a30" }),
                            }}
                        >
                            {msg.text}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
