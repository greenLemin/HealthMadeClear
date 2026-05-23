import { useState, useEffect } from "react";
import { HEALTH_TOPICS, TopicData, QuizQuestion } from "./data/healthData";
import JargonBuilder from "./components/JargonBuilder";
import PrescriptionDiagram from "./components/PrescriptionDiagram";
import NutritionFactPicker from "./components/NutritionFactPicker";
import CostCalculator from "./components/CostCalculator";
import AskMeThreeBuilder from "./components/AskMeThreeBuilder";
import AiCompanion from "./components/AiCompanion";
import {
  BookOpen,
  Award,
  Flame,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  GraduationCap,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  Stethoscope,
  Pill,
  Apple,
  Map,
  ChevronRight,
  TrendingUp,
  Heart,
  FileText,
  Percent,
  Shield,
  Notebook,
  TrendingDown,
  CalendarDays,
  Check,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Safe dictionary to handle Lucide string names
const ICON_MAP: Record<string, any> = {
  Stethoscope,
  Pill,
  Apple,
  Map,
  Volume2,
  TrendingUp,
  Heart,
  FileText,
  Percent,
  Shield,
  Notebook,
  TrendingDown,
  CalendarDays
};

export default function App() {
  const [completedTopics, setCompletedTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("hl_completed_topics");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [streak, setStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("hl_streak");
      return saved ? parseInt(saved) : 3; // Start with an encouraging default
    } catch {
      return 3;
    }
  });

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"lesson" | "quiz">("lesson");

  // Quiz playing state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Sync completions
  useEffect(() => {
    try {
      localStorage.setItem("hl_completed_topics", JSON.stringify(completedTopics));
    } catch (e) {
      console.error(e);
    }
  }, [completedTopics]);

  useEffect(() => {
    try {
      localStorage.setItem("hl_streak", streak.toString());
    } catch (e) {
      console.error(e);
    }
  }, [streak]);

  // Find currently running focus topic
  const activeTopic = HEALTH_TOPICS.find((t) => t.id === selectedTopicId) || null;

  const handleStartTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setActiveWorkspaceTab("lesson");
    setCurrentQuestionIdx(0);
    setSelectedAnswerIdx(null);
    setCorrectCount(0);
    setQuizFinished(false);
    setShowCelebration(false);
  };

  const handleSelectAnswer = (idx: number, correctIdx: number) => {
    if (selectedAnswerIdx !== null) return; // Prevent double clicks
    setSelectedAnswerIdx(idx);
    if (idx === correctIdx) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeTopic) return;
    setSelectedAnswerIdx(null);
    const hasNext = currentQuestionIdx + 1 < activeTopic.quiz.length;
    if (hasNext) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      // Quiz finished! Evaluate outcome
      setQuizFinished(true);
      // Passing criteria: answer at least 2 questions correctly (or 100% since most has 3)
      const isPassed = correctCount >= Math.ceil(activeTopic.quiz.length * 0.6);
      if (isPassed && !completedTopics.includes(activeTopic.id)) {
        setCompletedTopics((prev) => [...prev, activeTopic.id]);
        setStreak((prev) => prev + 1);
        setShowCelebration(true);
      }
    }
  };

  const resetAllProgress = () => {
    setCompletedTopics([]);
    setStreak(1);
    setSelectedTopicId(null);
    try {
      localStorage.removeItem("hl_completed_topics");
      localStorage.setItem("hl_streak", "1");
    } catch (e) {
      console.error(e);
    }
  };

  const graduationPct = Math.round((completedTopics.length / HEALTH_TOPICS.length) * 100);

  // Render correct category tags
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner": return "bg-emerald-50 text-emerald-700 border-emerald-150";
      case "Intermediate": return "bg-amber-50 text-amber-700 border-amber-150";
      case "Advanced": return "bg-purple-50 text-purple-700 border-purple-150";
      default: return "bg-slate-50 text-slate-700";
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#fafbfc] text-slate-900 selection:bg-indigo-100 flex flex-col font-sans">
      
      {/* Top Header Panel */}
      <header className="bg-white border-b border-slate-100 shadow-xs sticky top-0 z-55 py-3 px-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setSelectedTopicId(null)}>
            <div className="bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-none">Health Made Clear</h1>
              <span className="text-[10px] text-slate-400 font-medium">Empowering patient self-advocacy & clinical vocabulary</span>
            </div>
          </div>

          {/* User Achievement Ledger indicators */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
            {/* Daily Streak */}
            <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full border border-amber-150 font-medium select-none shadow-xs">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{streak} Day Learning Streak</span>
            </div>

            {/* Hub Graduation Gauge */}
            <div className="flex items-center gap-3 bg-indigo-50/50 text-indigo-900 px-3.5 py-1.5 rounded-full border border-indigo-100 shadow-xs">
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-500 block leading-none mb-0.5">Academic Progress</span>
                <span className="font-bold font-mono">{graduationPct}% Certified</span>
              </div>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${graduationPct}%` }}></div>
              </div>
            </div>

            {/* Hard Reset btn */}
            <button
              id="global-reset-progress-btn"
              onClick={() => { if (confirm("Sure you want to restart all course scores and badges?")) resetAllProgress(); }}
              title="Reset progress"
              className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-slate-50 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Learning core workspace (Spans 8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {!selectedTopicId ? (
              /* Topic Dashboard Card grid */
              <motion.div
                key="dash"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Intro Hero Box */}
                <div className="bg-radial from-indigo-50 to-indigo-100 border border-indigo-150 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 select-none opacity-10">
                    <GraduationCap className="w-72 h-72 text-indigo-950" />
                  </div>
                  
                  <div className="space-y-2 relative z-10 text-center md:text-left">
                    <span className="bg-indigo-600 text-white text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase">Public Health Literacy Initiative</span>
                    <h2 className="text-xl font-bold font-mono text-slate-900 tracking-tight leading-snug">Raise Your Health IQ</h2>
                    <p className="text-slate-600 text-xs leading-relaxed max-w-lg">
                      Up to <b>90% of physical errors</b>, hospital re-admissions, and surprise medical debts trace back directly to patients misunderstanding basic medication labels or healthcare jargon. Select a module below to start learning.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="text-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm min-w-[100px]">
                      <div className="font-mono text-xl font-bold text-indigo-700">{HEALTH_TOPICS.length}</div>
                      <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Lessons</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm min-w-[100px]">
                      <div className="font-mono text-xl font-bold text-emerald-600">
                        {completedTopics.length}
                      </div>
                      <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Badges Won</div>
                    </div>
                  </div>
                </div>

                {/* Grid Lists */}
                <div>
                  <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Core Health Literacy Classes
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {HEALTH_TOPICS.map((topic) => {
                      const isCompleted = completedTopics.includes(topic.id);
                      const BadgeIcon = ICON_MAP[topic.badgeIcon] || Award;
                      return (
                        <div
                          key={topic.id}
                          id={`topic-card-${topic.id}`}
                          className="bg-white border hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider leading-none">
                                {topic.category}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${getDifficultyColor(topic.difficulty)}`}>
                                {topic.difficulty}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{topic.title}</h4>
                              <p className="text-slate-500 text-xs leading-relaxed mt-1">{topic.shortDesc}</p>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between select-none">
                            {/* Completion Status / Badges badge indicator */}
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                              {isCompleted ? (
                                <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-150">
                                  <BadgeIcon className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                                  <span className="text-[10px]">Badge earned!</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10px] font-medium block">Quiz unlocks Badge</span>
                              )}
                            </div>

                            <button
                              id={`start-course-btn-${topic.id}`}
                              onClick={() => handleStartTopic(topic.id)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl shadow-xs flex items-center gap-1 transition-all"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              {isCompleted ? "Review Class" : "Start Class"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Topic Lesson Workspace */
              <motion.div
                key="workspace"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6"
              >
                {/* Workspace navigation Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      id="back-to-dashboard-btn"
                      onClick={() => setSelectedTopicId(null)}
                      className="p-1 px-2 hover:bg-slate-150 text-slate-500 hover:text-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    >
                      <ArrowLeft className="w-4 h-4" /> Dashboard
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activeTopic.category}</span>
                  </div>

                  <div className="flex gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-2xl select-none">
                    <button
                      id="workspace-tab-lesson-btn"
                      onClick={() => setActiveWorkspaceTab("lesson")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeWorkspaceTab === "lesson"
                          ? "bg-white text-indigo-900 border border-slate-200/50 shadow-xs"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      Interactive Lesson
                    </button>
                    <button
                      id="workspace-tab-quiz-btn"
                      onClick={() => {
                        setActiveWorkspaceTab("quiz");
                        // Reset quiz state when tab switches to prevent hanging on results
                        setCurrentQuestionIdx(0);
                        setSelectedAnswerIdx(null);
                        setCorrectCount(0);
                        setQuizFinished(false);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeWorkspaceTab === "quiz"
                          ? "bg-white text-indigo-900 border border-slate-200/50 shadow-xs"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      Take the Quiz ({activeTopic.quiz.length} Qs)
                    </button>
                  </div>
                </div>

                {/* Workspace core body display */}
                {activeWorkspaceTab === "lesson" ? (
                  /* Interactive Lesson space */
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 underline decoration-indigo-400 decoration-wavy">{activeTopic.lesson.title}</h2>
                        <span className="text-[9px] font-bold font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border leading-none">{activeTopic.readTime} reading</span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{activeTopic.lesson.subtitle}</p>
                    </div>

                    {/* Lesson Core points explanations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTopic.lesson.points.map((pt, index) => {
                        const PtIcon = ICON_MAP[pt.iconName] || HelpCircle;
                        return (
                          <div key={index} className="p-4 bg-[#f8fafc] border border-[rgba(226,232,240,0.7)] rounded-xl flex items-start gap-3">
                            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                              <PtIcon className="w-4 h-4" />
                            </span>
                            <div>
                              <h5 className="font-bold text-xs text-slate-900 leading-tight mb-1">{pt.title}</h5>
                              <p className="text-slate-500 text-xs leading-normal font-sans">{pt.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DYNAMIC INTERACTIVE COMPONENT TARGET */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[9px] font-extrabold tracking-widest text-[#4f46e5] uppercase block mb-3 pl-1">Interactive Learning Activity:</span>
                      {activeTopic.lesson.interactiveComponentId === "jargon-builder" && <JargonBuilder />}
                      {activeTopic.lesson.interactiveComponentId === "prescription-diagram" && <PrescriptionDiagram />}
                      {activeTopic.lesson.interactiveComponentId === "nutrition-fact-picker" && <NutritionFactPicker />}
                      {activeTopic.lesson.interactiveComponentId === "cost-calculator" && <CostCalculator />}
                      {activeTopic.lesson.interactiveComponentId === "ask-me-three-builder" && <AskMeThreeBuilder />}
                    </div>

                    {/* Key takeaway wrap banner */}
                    <div className="p-4 bg-indigo-50 text-indigo-900 rounded-2xl border border-indigo-150 flex items-start gap-3 shadow-xs">
                      <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Core Lesson Takeaway:</strong>
                        <p className="text-xs text-indigo-800 leading-relaxed mt-0.5">{activeTopic.lesson.takeaway}</p>
                      </div>
                    </div>

                    {/* Forward quiz trigger */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedTopicId(null)}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        Cancel review
                      </button>
                      <button
                        id="start-quiz-forward-btn"
                        onClick={() => {
                          setActiveWorkspaceTab("quiz");
                          setCurrentQuestionIdx(0);
                          setSelectedAnswerIdx(null);
                          setCorrectCount(0);
                          setQuizFinished(false);
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md feel-animate flex items-center gap-1.5"
                      >
                        Start Interactive Quiz
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Interactive Quiz Panel space */
                  <div className="space-y-6">
                    {!quizFinished ? (
                      /* Active Question state */
                      <div className="space-y-5">
                        
                        {/* Progress Indicators */}
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                          <span>Question {currentQuestionIdx + 1} of {activeTopic.quiz.length}</span>
                          <span>Score: {correctCount} Correct</span>
                        </div>

                        {/* Question title text */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                          <h4 className="font-bold text-slate-900 text-sm leading-relaxed">
                            {activeTopic.quiz[currentQuestionIdx].question}
                          </h4>
                        </div>

                        {/* Option Buttons list */}
                        <div className="space-y-3">
                          {activeTopic.quiz[currentQuestionIdx].options.map((opt, idx) => {
                            const isSelected = selectedAnswerIdx === idx;
                            const isCorrect = idx === activeTopic.quiz[currentQuestionIdx].correctIndex;
                            const isWrongSelected = isSelected && !isCorrect;
                            
                            // Determine buttons color
                            let elementStyle = "bg-white border-slate-200 text-slate-800 hover:bg-slate-50";
                            if (selectedAnswerIdx !== null) {
                              if (isCorrect) {
                                elementStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold";
                              } else if (isWrongSelected) {
                                elementStyle = "bg-red-50 border-red-400 text-red-950";
                              } else {
                                elementStyle = "bg-white border-slate-200 text-slate-400 select-none opacity-50";
                              }
                            }

                            return (
                              <button
                                key={idx}
                                id={`quiz-option-btn-${idx}`}
                                disabled={selectedAnswerIdx !== null}
                                onClick={() => handleSelectAnswer(idx, activeTopic.quiz[currentQuestionIdx].correctIndex)}
                                className={`w-full text-left p-3.5 rounded-2xl border text-xs leading-normal flex items-start gap-3 transition-colors ${elementStyle}`}
                              >
                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold font-mono mt-0.5 ${
                                  isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="flex-1">{opt}</span>

                                {selectedAnswerIdx !== null && isCorrect && <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
                                {selectedAnswerIdx !== null && isWrongSelected && <X className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Interactive Explanation banner */}
                        {selectedAnswerIdx !== null && (
                          <div className={`p-4 rounded-2xl border ${
                            selectedAnswerIdx === activeTopic.quiz[currentQuestionIdx].correctIndex
                              ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                              : "bg-amber-50 border-amber-100 text-amber-900"
                          } text-xs font-sans space-y-1`}>
                            <div className="font-bold flex items-center gap-1">
                              {selectedAnswerIdx === activeTopic.quiz[currentQuestionIdx].correctIndex ? "Correct Answer!" : "Not Quite!"}
                            </div>
                            <p className="leading-relaxed">{activeTopic.quiz[currentQuestionIdx].explanation}</p>
                          </div>
                        )}

                        {/* Forward navigation button */}
                        {selectedAnswerIdx !== null && (
                          <div className="flex justify-end pt-2 border-t border-slate-100">
                            <button
                              id="quiz-next-question-btn"
                              onClick={handleNextQuestion}
                              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md"
                            >
                              {currentQuestionIdx + 1 < activeTopic.quiz.length ? "Next Question" : "See Results"}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Final Quiz score Results page show */
                      <div className="flex flex-col items-center py-8 text-center space-y-6 max-w-md mx-auto">
                        <div className="space-y-2">
                          <CheckCircle className="w-12 h-12 text-indigo-600 mx-auto" />
                          <h4 className="font-bold text-slate-900 text-lg">Quiz Complete!</h4>
                        </div>

                        {/* Ring score gauge */}
                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl w-full flex flex-col items-center shadow-inner">
                          <div className="font-mono text-3xl font-black text-indigo-900 leading-none">
                            {correctCount} / {activeTopic.quiz.length}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Questions Correct</span>
                          
                          {/* Evaluate passed */}
                          {correctCount >= Math.ceil(activeTopic.quiz.length * 0.6) ? (
                            <div className="mt-4 text-emerald-700 bg-emerald-50 border border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                              <span>Congratulations! Certified Passed!</span>
                            </div>
                          ) : (
                            <div className="mt-4 text-rose-700 bg-rose-50 border border-rose-100 text-xs font-semibold px-4 py-1.5 rounded-full">
                              Score under 60% standard. Give it another try!
                            </div>
                          )}
                        </div>

                        {/* Unlock badge highlight with animation */}
                        {showCelebration && (
                          <div className="bg-radial from-amber-50 to-amber-100 p-5 border border-amber-200 rounded-2xl text-center shadow-md animate-bounce w-full space-y-2">
                            <Award className="w-10 h-10 text-amber-500 mx-auto" />
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs">Unlocked Medical Literacy Badge!</h5>
                              <span className="text-xs font-mono font-bold text-amber-800 block text-sm">
                                {activeTopic.badgeName}
                              </span>
                            </div>
                            <p className="text-[10px] text-amber-900 px-6 font-medium">This badge proves your professional comprehension in {activeTopic.category}.</p>
                          </div>
                        )}

                        {/* Restart or Back desk triggers */}
                        <div className="flex gap-3 w-full justify-center select-none pt-2 border-t border-slate-100">
                          <button
                            id="quiz-retry-btn"
                            onClick={() => {
                              setCurrentQuestionIdx(0);
                              setSelectedAnswerIdx(null);
                              setCorrectCount(0);
                              setQuizFinished(false);
                              setShowCelebration(false);
                            }}
                            className="px-4 py-2 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl"
                          >
                            Retry Quiz
                          </button>
                          <button
                            id="results-back-dashboard-btn"
                            onClick={() => setSelectedTopicId(null)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
                          >
                            Return to Hub
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: AI Companion Sidebar (Spans 4 columns) */}
        <div className="lg:col-span-4 h-full">
          <AiCompanion />
        </div>

      </main>

      {/* Aesthetic humbles margin credits */}
      <footer className="bg-white border-t border-slate-100 py-6 px-5 mt-auto text-center select-none text-[10px] text-slate-400 font-sans">
        <p>© 2026 Health Made Clear. Building real public medicine comprehension.</p>
      </footer>
    </div>
  );
}
