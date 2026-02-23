/**
 * V8 HashSphere Page - Wrapper with platform header and admin panel
 * Embeds the V8 HashSphere application with full platform navigation
 */

import React from "react";
import { Header } from "../../components/layout/Header/Header";
import V8AdminPanel from "./V8AdminPanel";

const V8Page: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Header />
      <div style={{ paddingTop: "60px", height: "calc(100vh - 60px)" }}>
        <iframe
          src="/v8-app/?embedded=true"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            background: "#0a0a0f",
          }}
          title="V8 HashSphere"
        />
      </div>
      {/* Admin Panel - Only visible to platform owners */}
      <V8AdminPanel />
    </div>
  );
};

export default V8Page;
