import React, { useState, useEffect } from 'react';
import { Trophy, Award, Monitor, Maximize, Minimize, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import TimerDisplay from '../components/TimerDisplay';
import AnswerReveal from '../components/AnswerReveal';
import LeaderboardTable from '../components/LeaderboardTable';
import Podium from '../components/Podium';
import WinnerCelebration from '../components/WinnerCelebration';
import AudioUnlockBanner from '../components/AudioUnlockBanner';
import WelcomeScreen from '../components/WelcomeScreen';
import RoundQualifiersScreen from '../components/RoundQualifiersScreen';
import RoundAnnouncementOverlay from '../components/RoundAnnouncementOverlay';

export default function Display() {
  const {
    gameState,
    settings,
    currentQuestion,
    totalQuestions,
    teams,
    timerRemaining,
    audioUnlocked,
    unlockAudio,
    hideAnswer
  } = useGame();

  const [winnerModalDismissed, setWinnerModalDismissed] = useState(false);

  // Global passive listener to unlock audio on any first interaction (click, key, touch)
  useEffect(() => {
    if (audioUnlocked) return;

    const handleFirstInteraction = () => {
      unlockAudio();
    };

    window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('pointerdown', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [audioUnlocked, unlockAudio]);

  // If game is reset, allow winner modal to show again in future
  useEffect(() => {
    if (gameState.gameStatus !== 'FINISHED') {
      setWinnerModalDismissed(false);
    }
  }, [gameState.gameStatus]);

  const showWinnerScreen = gameState.gameStatus === 'FINISHED' && !winnerModalDismissed;
  const isGameStarted = gameState.gameStatus === 'RUNNING' || gameState.gameStatus === 'PAUSED';

  // Active view with strict mutual exclusion
  const activeStage = gameState.stageView || (gameState.landingVisible ? 'landing' : gameState.qualifiersVisible ? 'qualifiers' : gameState.leaderboardVisible ? 'leaderboard' : gameState.podiumVisible ? 'podium' : 'landing');

  const isLandingView = activeStage === 'landing';
  const isQualifiersView = activeStage === 'qualifiers';
  const isLeaderboardView = activeStage === 'leaderboard';
  const isPodiumView = activeStage === 'podium';
  const isQuestionView = activeStage === 'question';

  // Answer reveal overlay MUST ONLY show when in Question stage
  const showAnswerReveal = gameState.answerRevealed && isQuestionView;

  return (
    <div className="h-screen w-screen overflow-hidden select-none bg-[#06080e] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Presentation Stage or Full-Screen Winner Celebration */}
      {showWinnerScreen ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 z-20 overflow-hidden animate-fade-in w-full h-full">
          <WinnerCelebration
            teams={teams}
            onClose={() => setWinnerModalDismissed(true)}
          />
        </div>
      ) : (
        <>
          {/* Display Smart Board Header */}
          <Navbar isDisplay={true} />

          {/* Autoplay Audio Unlock Banner if needed */}
          <AudioUnlockBanner />

          {/* Main Presentation Stage */}
          <main className="flex-1 flex flex-col items-center justify-between p-2 sm:p-3 md:p-4 z-10 overflow-hidden min-h-0">
            {isLandingView ? (
              // STAGE VIEW 1: Landing / Welcome Screen (College, Department, Countdown, Rules)
              <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in overflow-y-auto min-h-0">
                <WelcomeScreen />
              </div>
            ) : isQualifiersView ? (
              // STAGE VIEW 2: Round 2 Qualifiers Screen
              <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
                <RoundQualifiersScreen />
              </div>
            ) : isLeaderboardView ? (
              // STAGE VIEW 3: Live Leaderboard (5 Teams Per Page)
              <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
                <LeaderboardTable
                  teams={teams}
                  pageSize={5}
                  autoRotate={settings.autoRotateLeaderboard !== false}
                  rotationSeconds={settings.leaderboardRotationTime || 6}
                  isHost={false}
                />
              </div>
            ) : isPodiumView ? (
              // STAGE VIEW 4: Top 3 Podium
              <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
                <Podium teams={teams} />
              </div>
            ) : (
              // STAGE VIEW 5: Question & Clues Screen
              <div className="w-full h-full flex-1 flex flex-col items-center justify-between overflow-hidden min-h-0">
                {/* Clues Card Container */}
                <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden py-1">
                  <QuestionCard
                    key={currentQuestion?.id || currentQuestion?._id || `q-${gameState.currentRound || 1}-${Number(gameState.currentQuestionIndex) || 0}`}
                    question={currentQuestion}
                    currentRound={Number(gameState.currentRound) || 1}
                    questionNumber={(Number(gameState.currentQuestionIndex) || 0) + 1}
                    totalQuestions={totalQuestions}
                    revealedCluesCount={gameState.revealedCluesCount !== undefined ? gameState.revealedCluesCount : (gameState.currentRound === 2 ? 1 : 4)}
                  />
                </div>

                {/* Giant Server-Synchronized Timer (ALWAYS visible until answer is revealed) */}
                {!gameState.answerRevealed && (
                  <div className="w-full py-1.5 flex justify-center animate-fade-in shrink-0 z-20">
                    <TimerDisplay compact={false} />
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Dramatic Answer Reveal Curtain Overlay (Strictly active only on Question Stage) */}
          <AnswerReveal
            isRevealed={showAnswerReveal}
            answerText={currentQuestion?.answerText}
            points={currentQuestion?.points || 10}
            audioType={currentQuestion?.audioType || 'tts'}
            onDismiss={hideAnswer}
          />

          {/* Full-Screen Round Commencement Announcement Overlay */}
          <RoundAnnouncementOverlay />
        </>
      )}
    </div>
  );
}
