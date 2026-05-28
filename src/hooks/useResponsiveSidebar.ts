import { useCallback, useEffect, useState } from "react";

const MOBILE_SIDEBAR_MQ = "(max-width: 768px)";

function getDefaultSidebarOpen(): boolean {
  if (typeof window === "undefined") return true;
  return !window.matchMedia(MOBILE_SIDEBAR_MQ).matches;
}

/** Collapsible app sidebar with mobile overlay behavior. */
export function useResponsiveSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(getDefaultSidebarOpen);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_SIDEBAR_MQ);
    const syncSidebarForViewport = () => {
      setIsSidebarOpen(mq.matches ? false : true);
    };
    mq.addEventListener("change", syncSidebarForViewport);
    return () => mq.removeEventListener("change", syncSidebarForViewport);
  }, []);

  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_SIDEBAR_MQ).matches;
    if (mobile && isSidebarOpen) {
      document.body.classList.add("app-menu-open");
    } else {
      document.body.classList.remove("app-menu-open");
    }
    return () => document.body.classList.remove("app-menu-open");
  }, [isSidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebarOnMobile = useCallback(() => {
    if (window.matchMedia(MOBILE_SIDEBAR_MQ).matches) {
      setIsSidebarOpen(false);
    }
  }, []);

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    closeSidebarOnMobile,
    mobileSidebarMq: MOBILE_SIDEBAR_MQ
  };
}
