import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import car from "../assets/car.json";

export default function Home() {
    return (
        <div className="home-container">
            <div className="top-area">
                <div style={{ height: "40px" }} /> {/* Spacer */}
            </div>

            <div className="home-content">
                <div style={{ width: "120px", margin: "0 auto" }}>
                    <Lottie animationData={car} loop={false} />
                </div>

                <h1 className="hero-title">Math Race</h1>
                <p className="hero-desc">
                    A calm, predictable, and sensory-friendly addition game designed for autistic children.
                </p>

                <div className="feature-list">
                    <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Soft colors & predictable animations</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Clear, encouraging feedback</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Daily streak & high score tracking</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Zero distractions or sudden sounds</span>
                    </div>
                </div>
            </div>

            <div className="bottom-area" style={{ paddingBottom: "40px" }}>
                <Link to="/game" className="btn-play" style={{ display: 'block', textDecoration: 'none' }}>
                    Start Racing
                </Link>
                <p style={{ fontSize: "11px", color: "#b0a89e", marginTop: "16px", fontWeight: 600 }}>
                    Ready for the addition challenge?
                </p>
            </div>
        </div>
    );
}
