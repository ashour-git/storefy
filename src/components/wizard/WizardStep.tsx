"use client";

import React, { useEffect, useState } from "react";

interface WizardProps {
  steps: {
    id: string;
    title: string;
    subtitle: string;
    content: React.ReactNode;
    isValid: boolean;
  }[];
  onComplete: () => void;
  isSubmitting?: boolean;
}

export function Wizard({ steps, onComplete, isSubmitting }: WizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!currentStep.isValid) return;
    if (isLastStep) {
      onComplete();
    } else {
      setDirection("forward");
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setDirection("backward");
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Progress Indicators */}
      <div className="flex items-center justify-center space-x-3 mb-10 w-full">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;
          return (
            <React.Fragment key={step.id}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500
                  ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-110"
                      : isCompleted
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 max-w-[60px] rounded-full transition-all duration-500 ${
                    isCompleted ? "bg-indigo-500" : "bg-slate-800"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            {currentStep.title}
          </h2>
          <p className="text-slate-400 text-lg">{currentStep.subtitle}</p>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 relative z-10 flex flex-col justify-center animate-fade-up">
          {currentStep.content}
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex items-center justify-between relative z-10 pt-6 border-t border-slate-800/50">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isSubmitting}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              currentStepIndex === 0
                ? "opacity-0 pointer-events-none"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            ← Back
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={!currentStep.isValid || isSubmitting}
            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-lg flex items-center gap-2 ${
              !currentStep.isValid
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:scale-[1.02]"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : isLastStep ? (
              "Launch Store 🚀"
            ) : (
              "Continue →"
            )}
          </button>
        </div>

        {/* Background Decorative Blur */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}
