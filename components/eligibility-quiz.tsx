"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Shield,
  HelpCircle,
  Briefcase,
} from "lucide-react";
import {
  type QuizAnswers,
  type QuizOutcome,
  QUESTIONS,
  INITIAL_ANSWERS,
  getOutcome,
  saveAnswers,
  loadAnswers,
  clearAnswers,
} from "@/lib/eligibility";

type Phase = "quiz" | "result";

export default function EligibilityQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_ANSWERS);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadAnswers();
    if (saved) {
      setAnswers(saved);
      // If all questions answered, jump to result
      const keys = Object.keys(saved) as (keyof QuizAnswers)[];
      const answered = keys.filter((k) => saved[k] !== null).length;
      if (answered === QUESTIONS.length) {
        setOutcome(getOutcome(saved));
        setPhase("result");
      } else {
        // Resume at first unanswered
        const idx = keys.findIndex((k) => saved[k] === null);
        setStep(idx >= 0 ? idx : 0);
      }
    }
    setLoaded(true);
  }, []);

  const handleAnswer = useCallback(
    (value: boolean) => {
      const questionId = QUESTIONS[step].id as keyof QuizAnswers;
      const next = { ...answers, [questionId]: value };
      setAnswers(next);
      saveAnswers(next);

      // Early exit: not a veteran → go straight to result
      if (questionId === "isVeteran" && value === false) {
        setOutcome("not-qualified");
        setPhase("result");
        return;
      }

      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        setOutcome(getOutcome(next));
        setPhase("result");
      }
    },
    [step, answers]
  );

  const handleBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const handleRestart = useCallback(() => {
    clearAnswers();
    setAnswers(INITIAL_ANSWERS);
    setStep(0);
    setPhase("quiz");
    setOutcome(null);
  }, []);

  // Don't render until localStorage has been checked (prevents flash)
  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (phase === "result" && outcome) {
    return <ResultScreen outcome={outcome} onRestart={handleRestart} />;
  }

  const current = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">
            Question {step + 1} of {QUESTIONS.length}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-cream rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-border/50 p-8 sm:p-10 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-navy mb-3 leading-tight">
          {current.question}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          {current.detail}
        </p>

        {/* Answer buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleAnswer(true)}
            className="flex-1 group relative flex items-center justify-center gap-2.5 rounded-xl border-2 border-border/50 bg-cream/50 px-6 py-4 text-navy font-semibold text-[15px] transition-all duration-200 hover:border-gold hover:bg-gold/5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 cursor-pointer"
          >
            <CheckCircle className="h-5 w-5 text-gold opacity-60 group-hover:opacity-100 transition-opacity" />
            {current.yesLabel ?? "Yes"}
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="flex-1 group relative flex items-center justify-center gap-2.5 rounded-xl border-2 border-border/50 bg-cream/50 px-6 py-4 text-navy font-semibold text-[15px] transition-all duration-200 hover:border-navy/40 hover:bg-navy/5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 cursor-pointer"
          >
            <XCircle className="h-5 w-5 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
            {current.noLabel ?? "No"}
          </button>
        </div>
      </div>

      {/* Back / Restart buttons */}
      <div className="flex items-center justify-between mt-6">
        {step > 0 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-navy transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start over
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   RESULT STATES
   ──────────────────────────────────────────── */

function ResultScreen({
  outcome,
  onRestart,
}: {
  outcome: QuizOutcome;
  onRestart: () => void;
}) {
  if (outcome === "qualified") return <QualifiedResult onRestart={onRestart} />;
  if (outcome === "needs-verification")
    return <NeedsVerificationResult onRestart={onRestart} />;
  return <NotQualifiedResult onRestart={onRestart} />;
}

function QualifiedResult({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <div className="bg-white rounded-2xl border border-gold/30 p-8 sm:p-10 shadow-sm">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center">
          <Shield className="h-8 w-8 text-gold" />
        </div>
        <Badge className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase">
          You May Qualify
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3 leading-tight">
          You may qualify for Hutchrok&apos;s free veteran filing lane.
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
          Based on your answers, you appear to meet the eligibility requirements.
          The next step is confirming your TVC verification status.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/verification-help">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-8 h-12 shadow-lg shadow-gold/10"
            >
              Continue to Verification Help
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/free-filing">
            <Button
              size="lg"
              variant="outline"
              className="border-navy/30 text-navy hover:bg-navy hover:text-white font-medium text-base px-6 h-12"
            >
              View Free Filing Details
            </Button>
          </Link>
        </div>
      </div>
      <RestartLink onRestart={onRestart} />
    </div>
  );
}

function NeedsVerificationResult({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <div className="bg-white rounded-2xl border border-border/50 p-8 sm:p-10 shadow-sm">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-navy/8 flex items-center justify-center">
          <HelpCircle className="h-8 w-8 text-navy" />
        </div>
        <Badge className="mb-4 text-navy bg-navy/10 text-xs tracking-wider uppercase">
          Almost There
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3 leading-tight">
          You may need verification support first.
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 max-w-md mx-auto">
          As a veteran, you&apos;re on the right track — but based on your
          answers, some requirements may not be met yet.
        </p>
        <ul className="text-left text-sm text-muted-foreground space-y-2 mb-8 max-w-sm mx-auto">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
            <span>The free filing is for new Texas LLCs that are 100% veteran-owned.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
            <span>Verification through the Texas Veterans Commission is required.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
            <span>Hutchrok can guide you through the process.</span>
          </li>
        </ul>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/verification-help">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-8 h-12 shadow-lg shadow-gold/10"
            >
              Get Verification Help
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="border-navy/30 text-navy hover:bg-navy hover:text-white font-medium text-base px-6 h-12"
            >
              Talk to Hutchrok
            </Button>
          </Link>
        </div>
      </div>
      <RestartLink onRestart={onRestart} />
    </div>
  );
}

function NotQualifiedResult({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <div className="bg-white rounded-2xl border border-border/50 p-8 sm:p-10 shadow-sm">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
        <Badge className="mb-4 text-muted-foreground bg-muted text-xs tracking-wider uppercase">
          Not Eligible for Free Filing
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3 leading-tight">
          This program may not be the right fit — but Hutchrok can still help.
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
          The free veteran filing lane is specifically for U.S. military veterans
          forming a 100% veteran-owned Texas LLC. Hutchrok offers paid business
          setup services including formation, branding, and compliance support.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/services">
            <Button
              size="lg"
              className="bg-navy hover:bg-navy-light text-white font-bold text-base px-8 h-12"
            >
              View Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="border-navy/30 text-navy hover:bg-navy hover:text-white font-medium text-base px-6 h-12"
            >
              Contact Hutchrok
            </Button>
          </Link>
        </div>
      </div>
      <RestartLink onRestart={onRestart} />
    </div>
  );
}

function RestartLink({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="mt-6 text-center">
      <button
        onClick={onRestart}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy transition-colors cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Retake quiz
      </button>
    </div>
  );
}
