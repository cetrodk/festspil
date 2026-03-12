import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { JoinPage } from "@/pages/JoinPage";
import { HostView } from "@/pages/HostView";
import { PlayerView } from "@/pages/PlayerView";
import { DrawTest } from "@/pages/DrawTest";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<JoinPage />} />
        <Route path="/play/:code" element={<PlayerView />} />
        <Route path="/host/:code" element={<HostView />} />
        <Route path="/draw-test" element={<DrawTest />} />
      </Routes>
    </BrowserRouter>
  );
}
