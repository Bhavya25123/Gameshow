

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
    const scaleRef = useAutoScale(1024, 768);

  const layoutClasses = {
    default: "min-h-screen flex flex-col gradient-bg",
    game: "min-h-screen flex flex-col gradient-bg game-bg",
    fullscreen: "min-h-screen flex flex-col gradient-bg",
  };

  const mainClasses = {
    default:
      "w-[1024px] h-[768px] flex flex-col items-center justify-center p-4 overflow-auto",
    game: "w-[1024px] h-[768px] flex flex-col md:flex-row gap-2 p-2 overflow-auto",
    fullscreen: "flex-1 relative overflow-auto",
  };

  if (variant === "default") {
    return (
      <div className={`${layoutClasses[variant]} ${className}`}>
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div ref={scaleRef} className="w-[1024px] h-[768px] flex flex-col">
            <Header gameCode={gameCode} timer={timer} />
            <main className={mainClasses[variant]}>{children}</main>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${layoutClasses[variant]} ${className}`}>
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
    </div>
  );
};

export default PageLayout;
