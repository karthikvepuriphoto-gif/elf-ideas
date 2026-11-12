import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { DetailPage } from "./components/DetailPage";
import { Guide, OpenGuideProvider } from "./components/Guide";
import { GridPage } from "./components/GridPage";
import { MyPlanPage } from "./components/MyPlanPage";
import { PlanPage } from "./components/PlanPage";
import { Shell } from "./components/Shell";
import { TrackerProvider } from "./context/Tracker";
import { detectMobileBrowser, isStandalone } from "./lib/install";
import { INSTALL_SEEN_KEY } from "./lib/storage";

function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== "/") window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [guideOpen, setGuideOpen] = useState(false);
  const openGuide = useCallback(() => setGuideOpen(true), []);
  const dismissGuide = useCallback(() => {
    try {
      localStorage.setItem(INSTALL_SEEN_KEY, "1");
    } catch {
      /* private mode */
    }
    setGuideOpen(false);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(INSTALL_SEEN_KEY) === "1") return;
      if (isStandalone()) return;
      if (!detectMobileBrowser()) return;
      setGuideOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <BrowserRouter basename={basename}>
      <TrackerProvider>
        <OpenGuideProvider open={openGuide}>
          <ScrollManager />
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<GridPage />} />
              <Route path="idea/:id" element={<DetailPage />} />
              <Route path="plan" element={<PlanPage />} />
              <Route path="mine" element={<MyPlanPage />} />
              <Route path="*" element={<GridPage />} />
            </Route>
          </Routes>
          {guideOpen && <Guide onClose={dismissGuide} />}
        </OpenGuideProvider>
      </TrackerProvider>
    </BrowserRouter>
  );
}
