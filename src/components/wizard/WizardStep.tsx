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
    <div className="wizard-container">
      {/* Progress Indicators */}
      <div className="wizard-progress">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;
          return (
            <React.Fragment key={step.id}>
              <div
                className={`wizard-step-node ${isActive ? "active" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`wizard-step-line ${isCompleted ? "completed" : ""}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content Card */}
      <div className="wizard-card">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px", position: "relative", zIndex: 10 }}>
          <h2 className="wizard-title">
            {currentStep.title}
          </h2>
          <p className="wizard-subtitle" style={{ marginBottom: 0 }}>{currentStep.subtitle}</p>
        </div>

        {/* Dynamic Content */}
        <div className="wizard-content animate-fade-up" style={{ position: "relative", zIndex: 10 }}>
          {currentStep.content}
        </div>

        {/* Footer Navigation */}
        <div className="wizard-footer" style={{ position: "relative", zIndex: 10 }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isSubmitting}
            className="wizard-back-btn"
          >
            ← Back
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={!currentStep.isValid || isSubmitting}
            className="btn-primary"
            style={{ padding: "12px 28px", borderRadius: "var(--radius-full)" }}
          >
            {isSubmitting ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="auth-spinner" style={{ width: "16px", height: "16px" }} />
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
        <div style={{ position: "absolute", top: "-128px", right: "-128px", width: "384px", height: "384px", background: "var(--accent-glow)", borderRadius: "var(--radius-full)", filter: "blur(100px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-128px", left: "-128px", width: "384px", height: "384px", background: "rgba(168, 85, 247, 0.08)", borderRadius: "var(--radius-full)", filter: "blur(100px)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}
