import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Game from "./components/Game";

export default function App() {
  return (
    <BrowserRouter>
      <div className="page-wrapper">
        <div className="math-card">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
