

import React from "react";
import Header from "./Header";
import Footer from "./Footer";

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
  const layoutClasses = {
    default: "min-h-screen flex flex-col gradient-bg",
    game: "min-h-screen flex flex-col gradient-bg game-bg",
    fullscreen: "min-h-screen flex flex-col gradient-bg",
  };

  const mainClasses = {
    default:
      "flex-1 w-full max-w-screen-xl mx-auto flex flex-col items-center justify-center p-4 overflow-auto",
    game:
      "flex-1 w-full max-w-screen-xl mx-auto flex flex-col md:flex-row gap-4 p-4 overflow-auto",
    fullscreen: "flex-1 relative overflow-auto",
  };

  return (
    <div className={`${layoutClasses[variant]} ${className}`}>
      {variant !== "fullscreen" && <Header gameCode={gameCode} timer={timer} />}
      <main className={mainClasses[variant]}>{children}</main>
      {variant === "default" && <Footer />}
    </div>
  );
};

export default PageLayout;
