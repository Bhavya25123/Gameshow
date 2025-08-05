import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import AnimatedCard from "../components/common/AnimatedCard";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { ROUTES } from "../utils/constants";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");

  return (
    <PageLayout>
      <div className="text-center py-16">
        <AnimatedCard>
          <div className="text-6xl mb-6 animate-float">🎮</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
            Sanskrit Shabd Samvad
          </h1>
          <p className="text-xl text-slate-300 mb-2">Interactive Team Quiz</p><br></br>
          
        </AnimatedCard>

        <div className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto">
          <AnimatedCard className="flex-1" delay={200}>
            <Button
              onClick={() => navigate(ROUTES.HOST)}
              variant="primary"
              size="xl"
              className="w-full py-6 text-xl group"
              icon={
                <span className="text-3xl mr-3 group-hover:animate-bounce">
                  👑
                </span>
              }
            >
              <span className="block text-sm text-blue-200 mt-1">Create Room</span>
            </Button>
          </AnimatedCard>
          <AnimatedCard className="flex-1" delay={400}>
            <div className="glass-card p-6 text-center">
              <p className="mb-4 text-slate-300">Rejoin Game</p>
              <Input
                id="rejoinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                variant="center"
              />
              <Button
                onClick={() =>
                  joinCode.trim() && navigate(`${ROUTES.HOST}?code=${joinCode}`)
                }
                variant="secondary"
                size="xl"
                className="w-full mt-4"
              >
                Rejoin
              </Button>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageLayout>
  );
};

export default HomePage;
