import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trophy, Clock, Star, RotateCcw, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Photo cards for the recall game - everyday objects
const PHOTO_SETS: Record<string, { emoji: string; label: string }[]> = {
  easy: [
    { emoji: "🍎", label: "Apple" },
    { emoji: "🐕", label: "Dog" },
    { emoji: "🏠", label: "House" },
    { emoji: "🚗", label: "Car" },
    { emoji: "🌸", label: "Flower" },
    { emoji: "☀️", label: "Sun" },
  ],
  medium: [
    { emoji: "🍎", label: "Apple" },
    { emoji: "🐕", label: "Dog" },
    { emoji: "🏠", label: "House" },
    { emoji: "🚗", label: "Car" },
    { emoji: "🌸", label: "Flower" },
    { emoji: "☀️", label: "Sun" },
    { emoji: "📖", label: "Book" },
    { emoji: "⌚", label: "Watch" },
  ],
  hard: [
    { emoji: "🍎", label: "Apple" },
    { emoji: "🐕", label: "Dog" },
    { emoji: "🏠", label: "House" },
    { emoji: "🚗", label: "Car" },
    { emoji: "🌸", label: "Flower" },
    { emoji: "☀️", label: "Sun" },
    { emoji: "📖", label: "Book" },
    { emoji: "⌚", label: "Watch" },
    { emoji: "🎵", label: "Music" },
    { emoji: "🌙", label: "Moon" },
  ],
};

interface GameCard {
  id: number;
  emoji: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type Difficulty = "easy" | "medium" | "hard";
type GamePhase = "menu" | "playing" | "results";

interface GameStats {
  score: number;
  maxScore: number;
  accuracy: number;
  duration: number;
}

const MemoryGames = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Load history
  useEffect(() => {
    if (!user) return;
    supabase
      .from("game_sessions")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setHistory(data);
      });
  }, [user, phase]);

  // Timer
  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, startTime]);

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    const set = PHOTO_SETS[diff];
    // Create pairs
    const paired = set.flatMap((item, i) => [
      { id: i * 2, ...item, isFlipped: false, isMatched: false },
      { id: i * 2 + 1, ...item, isFlipped: false, isMatched: false },
    ]);
    // Shuffle
    for (let i = paired.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paired[i], paired[j]] = [paired[j], paired[i]];
    }
    setCards(paired);
    setFlippedIds([]);
    setMatchedPairs(0);
    setAttempts(0);
    setStartTime(Date.now());
    setElapsed(0);
    setPhase("playing");
  };

  const handleCardClick = useCallback(
    (id: number) => {
      if (flippedIds.length >= 2) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.isFlipped || card.isMatched) return;

      const newCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
      setCards(newCards);
      const newFlipped = [...flippedIds, id];
      setFlippedIds(newFlipped);

      if (newFlipped.length === 2) {
        setAttempts((a) => a + 1);
        const [first, second] = newFlipped.map((fid) => newCards.find((c) => c.id === fid)!);
        if (first.label === second.label) {
          // Match!
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) => (c.id === first.id || c.id === second.id ? { ...c, isMatched: true } : c))
            );
            setMatchedPairs((p) => {
              const newP = p + 1;
              const totalPairs = PHOTO_SETS[difficulty].length;
              if (newP === totalPairs) {
                finishGame(newP, totalPairs);
              }
              return newP;
            });
            setFlippedIds([]);
          }, 500);
        } else {
          // No match
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) => (c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c))
            );
            setFlippedIds([]);
          }, 800);
        }
      }
    },
    [cards, flippedIds, difficulty]
  );

  const finishGame = async (matched: number, total: number) => {
    clearInterval(timerRef.current);
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = Math.round((matched / (attempts + 1)) * 100);
    const score = Math.max(0, Math.round(accuracy * (1 + (total * 10) / Math.max(duration, 1))));
    const maxScore = total * 100;

    const gameStats: GameStats = { score, maxScore, accuracy, duration };
    setStats(gameStats);
    setPhase("results");

    if (user) {
      await supabase.from("game_sessions").insert({
        patient_id: user.id,
        game_type: "photo_recall",
        score,
        max_score: maxScore,
        accuracy,
        duration_seconds: duration,
        difficulty,
      });
    }

    toast.success("Game complete! Great work 🎉");
  };

  const difficultyConfig = {
    easy: { label: "Easy", pairs: 6, color: "text-sage", bg: "bg-accent" },
    medium: { label: "Medium", pairs: 8, color: "text-primary", bg: "bg-primary/10" },
    hard: { label: "Hard", pairs: 10, color: "text-warm-amber", bg: "bg-warm-amber-light" },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-serif text-foreground flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" />
              Memory Games
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Photo-based recall exercises for cognitive health</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "menu" && (
            <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => {
                  const cfg = difficultyConfig[diff];
                  return (
                    <Card
                      key={diff}
                      className="shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
                      onClick={() => startGame(diff)}
                    >
                      <CardContent className="pt-6 text-center space-y-3">
                        <div className={`w-14 h-14 rounded-xl ${cfg.bg} flex items-center justify-center mx-auto`}>
                          <Brain className={`w-7 h-7 ${cfg.color}`} />
                        </div>
                        <h3 className="font-serif text-lg text-foreground">{cfg.label}</h3>
                        <p className="text-sm text-muted-foreground">{cfg.pairs} pairs to match</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Play <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Score History */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-warm-amber" />
                    Recent Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No games played yet. Pick a difficulty to start!</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((s) => (
                        <div key={s.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-foreground capitalize">{s.difficulty}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(s.created_at).toLocaleDateString()} · {s.duration_seconds}s
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{s.accuracy}%</p>
                            <p className="text-xs text-muted-foreground">accuracy</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === "playing" && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Game HUD */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {elapsed}s
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" /> {matchedPairs}/{PHOTO_SETS[difficulty].length}
                  </span>
                  <span>Attempts: {attempts}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPhase("menu")}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Quit
                </Button>
              </div>

              {/* Card Grid */}
              <div
                className={`grid gap-3 ${
                  difficulty === "easy"
                    ? "grid-cols-3 sm:grid-cols-4"
                    : difficulty === "medium"
                    ? "grid-cols-4"
                    : "grid-cols-4 sm:grid-cols-5"
                }`}
              >
                {cards.map((card) => (
                  <motion.button
                    key={card.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCardClick(card.id)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-4xl sm:text-5xl transition-all duration-300 cursor-pointer select-none ${
                      card.isMatched
                        ? "bg-accent border-2 border-sage opacity-70"
                        : card.isFlipped
                        ? "bg-card border-2 border-primary shadow-card"
                        : "bg-primary/10 border-2 border-border hover:border-primary/40"
                    }`}
                    disabled={card.isMatched}
                  >
                    {card.isFlipped || card.isMatched ? (
                      <motion.span initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ duration: 0.2 }}>
                        {card.emoji}
                      </motion.span>
                    ) : (
                      <span className="text-2xl text-muted-foreground/40">?</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "results" && stats && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <Card className="shadow-elevated">
                <CardContent className="pt-8 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto">
                    <Trophy className="w-10 h-10 text-warm-amber" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-foreground">Great Job!</h2>
                    <p className="text-muted-foreground text-sm capitalize">{difficulty} difficulty</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted rounded-xl p-3">
                      <p className="text-2xl font-bold text-foreground">{stats.accuracy}%</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3">
                      <p className="text-2xl font-bold text-foreground">{stats.duration}s</p>
                      <p className="text-xs text-muted-foreground">Time</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3">
                      <p className="text-2xl font-bold text-foreground">{stats.score}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setPhase("menu")}>
                      Menu
                    </Button>
                    <Button className="flex-1" onClick={() => startGame(difficulty)}>
                      <RotateCcw className="w-4 h-4 mr-1" /> Play Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MemoryGames;
