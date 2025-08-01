import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import AudienceJoinForm from "../components/forms/AudienceJoinForm";
import GameBoard from "../components/game/GameBoard";
import TeamPanel from "../components/game/TeamPanel";
import TurnIndicator from "../components/game/TurnIndicator";
import RoundSummaryComponent from "../components/game/RoundSummaryComponent";
import GameResults from "../components/game/GameResults";
import { useSocket } from "../hooks/useSocket";
import { Game, RoundSummary, RoundData } from "../types";
import { getCurrentQuestion } from "../utils/gameHelper";

const AudienceGamePage: React.FC = () => {
  const [gameCode, setGameCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const getTeamQuestionData = (teamKey: "team1" | "team2"): RoundData => {
    if (!game?.gameState?.questionData?.[teamKey]) {
      return {
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
    }
    return game.gameState.questionData[teamKey];
  };

  const { connect, audienceJoinGame } = useSocket({
    onAudienceJoined: (data: any) => {
      setGame(data.game);
    },
    onGameStarted: (data: any) => {
      setGame(data.game);
      if (data.activeTeam) {
        setMessages((prev) => [
          ...prev.slice(-9),
          `Game started! ${
            data.activeTeam === "team1" ? "Team 1" : "Team 2"
          } goes first.`,
        ]);
      } else {
        setMessages((prev) => [
          ...prev.slice(-9),
          "Game started! Buzz in for the toss-up question.",
        ]);
      }
    },
    onPlayerBuzzed: (data: any) => {
      setGame(data.game);
      setMessages((prev) => [
        ...prev.slice(-9),
        `${data.teamName} buzzed in! ${data.playerName}, answer now!`,
      ]);
    },
    onAnswerCorrect: (data: any) => {
      setGame(data.game);
      setMessages((prev) => [
        ...prev.slice(-9),
        `✅ ${data.teamName} answered "${data.submittedText}" correctly! +${data.pointsAwarded} points.`,
      ]);
    },
    onAnswerIncorrect: (data: any) => {
      setGame(data.game);
      setMessages((prev) => [
        ...prev.slice(-9),
        `❌ ${data.teamName} answered "${data.submittedText}" incorrectly.`,
      ]);
    },
    onRemainingCardsRevealed: (data: any) => {
      setGame(data.game);
      setMessages((prev) => [...prev.slice(-9), "All cards revealed!"]);
    },
    onAnswersRevealed: (data: any) => {
      setGame(data.game);
      setMessages((prev) => [...prev.slice(-9), "All answers have been revealed!"]);
    },
    onTurnChanged: (data: any) => {
      setGame(data.game);
      setMessages((prev) => [...prev.slice(-9), `Turn switched to ${data.teamName}!`]);
    },
    onNextQuestion: (data: any) => {
      setGame(data.game);
    },
    onQuestionComplete: (data: any) => {
      setGame(data.game);
    },
    onRoundComplete: (data: any) => {
      if (data.game) setGame(data.game);
      if (data.roundSummary) setRoundSummary(data.roundSummary);
    },
    onRoundStarted: (data: any) => {
      setGame(data.game);
      setRoundSummary(null);
      setMessages((prev) => [
        ...prev.slice(-9),
        `Round ${data.round} started! ${
          data.activeTeam === "team1" ? "Team 1" : "Team 2"
        } goes first.`,
      ]);
    },
    onGameOver: (data: any) => {
      setGame(data.game);
    },
    onPlayersListReceived: (data: any) => {
      if (game) {
        setGame((prev) => {
          if (!prev) return null;
          return { ...prev, players: data.players };
        });
      }
    },
  });

  const joinGame = async () => {
    if (!gameCode.trim()) {
      setError("Please enter a game code");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      connect();
      audienceJoinGame(gameCode.toUpperCase());
    } catch (err: any) {
      console.error(err);
      setError("Failed to join game");
    }
    setIsLoading(false);
  };

  const currentQuestion = game ? getCurrentQuestion(game) : null;

  if (!game) {
    return (
      <PageLayout>
        <AudienceJoinForm
          gameCode={gameCode}
          onGameCodeChange={setGameCode}
          onJoin={joinGame}
          isLoading={isLoading}
          error={error}
        />
      </PageLayout>
    );
  }

  if (game.status === "waiting") {
    return (
      <PageLayout gameCode={game.code}>
        <div className="glass-card p-6 text-center">
          <p className="text-xl text-slate-300">Waiting for the host to start...</p>
        </div>
      </PageLayout>
    );
  }

  if (game.status === "round-summary" && roundSummary) {
    return (
      <PageLayout gameCode={game.code} variant="game">
        <div className="p-4">
          <RoundSummaryComponent
            roundSummary={roundSummary}
            teams={game.teams}
            isHost={false}
            isGameFinished={game.currentRound >= 3}
          />
        </div>
      </PageLayout>
    );
  }

  if (game.status === "finished") {
    return (
      <PageLayout gameCode={game.code}>
        <GameResults teams={game.teams} />
      </PageLayout>
    );
  }

  if (game.status === "active" && currentQuestion) {
    const team1Answered = game.gameState.questionsAnswered.team1 || 0;
    const team2Answered = game.gameState.questionsAnswered.team2 || 0;
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
            questionsAnswered={team1Answered}
            questionData={getTeamQuestionData("team1")}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <TurnIndicator
            currentTeam={game.gameState.currentTurn}
            teams={game.teams}
            currentQuestion={currentQuestion}
            questionsAnswered={game.gameState.questionsAnswered}
            round={game.currentRound}
            variant="compact"
          />
          <GameBoard
            game={game}
            variant="host"
            isHost={false}
          />
          {messages.length > 0 && (
            <div className="glass-card p-4 text-center mt-2 text-blue-300 text-base max-h-48 overflow-y-auto space-y-1">
              {messages.map((msg, idx) => (
                <div key={idx}>{msg}</div>
              ))}
            </div>
          )}
        </div>
        <div className="w-48 flex-shrink-0">
          <TeamPanel
            team={game.teams[1]}
            teamIndex={1}
            isActive={game.teams[1]?.active}
            showMembers={false}
            currentRound={game.currentRound}
            roundScore={game.teams[1].currentRoundScore}
            questionsAnswered={team2Answered}
            questionData={getTeamQuestionData("team2")}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout gameCode={game.code}>
      <div className="glass-card p-8 text-center">
        <p className="text-xl font-bold mb-4">Unexpected Game State</p>
      </div>
    </PageLayout>
  );
};

export default AudienceGamePage;
