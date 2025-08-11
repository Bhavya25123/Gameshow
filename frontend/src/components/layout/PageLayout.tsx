

import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAutoScale } from "../../hooks/useAutoScale";

interface PageLayoutProps {
  children: React.ReactNode;
  gameCode?: string;
  timer?: string;
  variant?: "default" | "game" | "fullscreen";
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  gameCode,
  timer,
  variant = "default",
  className = "",
}) => {
    const scaleRef = variant === "game" ? useAutoScale(1024, 768) : undefined;

    const layoutClasses = {
      default: "min-h-screen flex flex-col gradient-bg",
      game: "h-screen flex flex-col gradient-bg game-bg overflow-hidden",
      fullscreen: "h-screen flex flex-col gradient-bg overflow-hidden",
    };

    const mainClasses = {
      default: "flex-1 container mx-auto px-4 py-8",
      game: "w-[1024px] h-[768px] flex flex-col md:flex-row gap-2 p-2 overflow-hidden",
      fullscreen: "flex-1 relative overflow-hidden",
    };

    return (
      <div className={`${layoutClasses[variant]} ${className}`}>
        {/* Only show header if not fullscreen variant */}
        {variant !== "fullscreen" && <Header gameCode={gameCode} timer={timer} />}

        {variant === "game" ? (
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <main ref={scaleRef} className={mainClasses[variant]}>
              {children}
            </main>
          </div>
        ) : (
          <main className={mainClasses[variant]}>{children}</main>
        )}

        {variant === "default" && <Footer />}
      </div>
    );
  };

export default PageLayout;
