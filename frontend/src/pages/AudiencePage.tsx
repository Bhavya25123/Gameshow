import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import AnimatedCard from "../components/common/AnimatedCard";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import GameBoard from "../components/game/GameBoard";
import TeamPanel from "../components/game/TeamPanel";
import TurnIndicator from "../components/game/TurnIndicator";
import { useSocket } from "../hooks/useSocket";
import gameApi from "../services/gameApi";
import { Game, RoundData } from "../types";
import { ROUTES } from "../utils/constants";

const defaultRoundData: RoundData = {
  round1: [
    { firstAttemptCorrect: null, pointsEarned: 0 },
    { firstAttemptCorrect: null, pointsEarned: 0 },
    { firstAttemptCorrect: null, pointsEarned: 0 },
  ],
  round2: [
    { firstAttemptCorrect: null, pointsEarned: 0 },
    { firstAttemptCorrect: null, pointsEarned: 0 },
    { firstAttemptCorrect: null, pointsEarned: 0 },
  ],
  round3: [
    { firstAttemptCorrect: null, pointsEarned: 0 },
    { firstAttemptCorrect: null, pointsEarned: 0 },
    { firstAttemptCorrect: null, pointsEarned: 0 },
  ],
};

const AudiencePage: React.FC = () => {
  const [gameCode, setGameCode] = useState("");
  const [spectatorName, setSpectatorName] = useState("");
  const [spectatorId, setSpectatorId] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { connect, audienceJoinGame } = useSocket({
    onGameStarted: (data: any) => setGame(data.game),
    onNextQuestion: (data: any) => setGame(data.game),
    onAnswerRevealed: (data: any) => setGame(data.game),
    onTurnChanged: (data: any) => setGame(data.game),
    onRoundComplete: (data: any) => {
      if (data.game) setGame(data.game);
    },
    onRoundStarted: (data: any) => setGame(data.game),
    onGameOver: (data: any) => setGame(data.game),
    onTeamUpdated: (data: any) => setGame(data.game),
    onPlayersListReceived: (data: any) => {
      setGame((prev) => (prev ? { ...prev, players: data.players } : prev));
    },
  });

  const handleJoin = async () => {
    if (!gameCode.trim() || !spectatorName.trim()) {
      setError("Please enter game code and your name");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await gameApi.joinAudience({
        gameCode: gameCode.toUpperCase(),
        spectatorName: spectatorName.trim(),
      });
      setSpectatorId(res.spectatorId);
      setGame(res.game);
      connect();
      audienceJoinGame(gameCode.toUpperCase(), res.spectatorId);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to join audience");
    }
    setIsLoading(false);
  };

  const getTeamQuestionData = (teamKey: "team1" | "team2"): RoundData => {
    if (!game?.gameState?.questionData?.[teamKey]) {
      return defaultRoundData;
    }
    return game.gameState.questionData[teamKey];
  };

  if (!spectatorId || !game) {
    return (
      <PageLayout>
        <AnimatedCard>
          <div className="max-w-md mx-auto glass-card p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Join as Audience</h2>
            {error && (
              <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-300">
                {error}
              </div>
            )}
            <div className="space-y-4 mb-6">
              <Input
                id="gameCode"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Enter game code"
                label="Game Code"
                maxLength={6}
              />
              <Input
                id="spectatorName"
                value={spectatorName}
                onChange={(e) => setSpectatorName(e.target.value)}
                placeholder="Your name"
                label="Name"
              />
            </div>
            <Button
              onClick={handleJoin}
              disabled={isLoading || !gameCode || !spectatorName}
              loading={isLoading}
              variant="primary"
              className="mb-4"
            >
              {isLoading ? "Joining..." : "Join Audience"}
            </Button>
            <div>
              <Link to={ROUTES.PLAYERHOME} className="text-slate-400 hover:text-white">
                ← Back
              </Link>
            </div>
          </div>
        </AnimatedCard>
      </PageLayout>
    );
  }

  const team1QuestionsAnswered = game.gameState.questionsAnswered.team1;
  const team2QuestionsAnswered = game.gameState.questionsAnswered.team2;

  return (
    <PageLayout gameCode={game.code} variant="game">
      <div className="w-48 flex-shrink-0">
        <TeamPanel
          team={game.teams[0]}
          teamIndex={0}
          isActive={game.teams[0]?.active}
          showMembers={false}
          currentRound={game.currentRound}
          roundScore={game.teams[0].currentRoundScore}
          questionsAnswered={team1QuestionsAnswered}
          questionData={getTeamQuestionData("team1")}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <TurnIndicator
          currentTeam={game.gameState.currentTurn}
          teams={game.teams}
          currentQuestion={game.questions[game.currentQuestionIndex]}
          questionsAnswered={game.gameState.questionsAnswered}
          round={game.currentRound}
          variant="compact"
        />
        <GameBoard game={game} variant="player" />
        <div className="text-center text-sm text-slate-400 mt-2">
          Audience members: {game.audiences?.length ?? 1}
        </div>
      </div>
      <div className="w-48 flex-shrink-0">
        <TeamPanel
          team={game.teams[1]}
          teamIndex={1}
          isActive={game.teams[1]?.active}
          showMembers={false}
          currentRound={game.currentRound}
          roundScore={game.teams[1].currentRoundScore}
          questionsAnswered={team2QuestionsAnswered}
          questionData={getTeamQuestionData("team2")}
        />
      </div>
    </PageLayout>
  );
};

export default AudiencePage;
