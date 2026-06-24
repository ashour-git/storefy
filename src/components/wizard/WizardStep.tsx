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

const STEP_ESTIMATES: Record<string, string> = {
  basics: "~1 min",
  business: "~30 sec",
  niche: "~1 min",
  locale: "~30 sec",
};

export function Wizard({ steps, onComplete, isSubmitting }: WizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

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

  const totalEstimate = "~3 min";

  return (
    <div className="wizard-container">
      {/* Progress bar */}
      <div className="wizard-progress-track">
        <div className="wizard-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step indicators */}
      <div className="wizard-steps">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;
          return (
            <button
              key={step.id}
              type="button"
              className={`wizard-step-indicator ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
              onClick={() => {
                if (idx < currentStepIndex) {
                  setDirection("backward");
                  setCurrentStepIndex(idx);
                }
              }}
              disabled={idx > currentStepIndex || isSubmitting}
            >
              <div className="wizard-step-number">
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className="wizard-step-label">{step.title}</span>
              {isActive && (
                <span className="wizard-step-time">{STEP_ESTIMATES[step.id] || ""}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Step Content Card */}
      <div className="wizard-card">
        <div className="wizard-card-inner">
          {/* Header */}
          <div className="wizard-header">
            <div className="wizard-header-row">
              <h2 className="wizard-title">{currentStep.title}</h2>
            </div>
            <p className="wizard-subtitle">{currentStep.subtitle}</p>
          </div>

          {/* Dynamic Content */}
          <div className="wizard-content" key={currentStep.id}>
            {currentStep.content}
          </div>

          {/* Footer Navigation */}
          <div className="wizard-footer">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0 || isSubmitting}
              className="wizard-back-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back
            </button>

            <div className="wizard-footer-right">
              <span className="wizard-step-count">
                Step {currentStepIndex + 1} of {steps.length}
                <span className="wizard-step-total-time"> &middot; {totalEstimate}</span>
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={!currentStep.isValid || isSubmitting}
                className="wizard-next-btn"
              >
                {isSubmitting ? (
                  <span className="wizard-loading">
                    <span className="wizard-spinner" />
                    Launching...
                  </span>
                ) : isLastStep ? (
                  <>
                    Launch Store
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                ) : (
                  <>
                    Continue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Background Decorative Blur */}
        <div className="wizard-glow wizard-glow-tr" />
        <div className="wizard-glow wizard-glow-bl" />
      </div>
    </div>
  );
}
