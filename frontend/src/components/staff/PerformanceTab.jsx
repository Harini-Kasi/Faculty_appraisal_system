import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, Award, CheckCircle2, AlertTriangle, MinusCircle, Lightbulb, ArrowRight, HelpCircle } from "lucide-react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { readDraft } from "../../utils/storage";
import { getRecommendationsForQuestion } from "../../utils/recommendations";

export default function PerformanceTab() {
  const { session } = useAuth();
  const { showNotification } = useNotification();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getMySubmissions()
      .then((data) => setSubmissions(data || []))
      .catch((err) => showNotification(err.message || "Failed to load performance metrics.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const latestSub = submissions[0];

  // Read draft answers if no final submission exists yet
  const draftData = useMemo(() => {
    if (submissions.length > 0) return null;
    return readDraft(session?.username);
  }, [submissions, session]);

  // Compute strengths, moderate, weaknesses based on score threshold
  // > 3 : Strength
  // == 3 : Moderate
  // < 3 : Weakness
  const analysis = useMemo(() => {
    let answersList = [];

    if (latestSub && Array.isArray(latestSub.answers)) {
      answersList = latestSub.answers;
    }

    const strengths = [];
    const moderate = [];
    const weaknesses = [];

    answersList.forEach((ans, index) => {
      const score = Number(ans.questionScore ?? ans.optionScore ?? 0);
      const item = {
        index: index + 1,
        text: ans.questionText || `Evaluation Criterion #${index + 1}`,
        option: ans.selectedOption || "Selected Rating",
        score: score,
        evidence: ans.evidence || "",
      };

      if (score > 3) {
        strengths.push(item);
      } else if (score === 3) {
        moderate.push(item);
      } else {
        weaknesses.push(item);
      }
    });

    return { strengths, moderate, weaknesses, totalEvaluated: answersList.length };
  }, [latestSub]);

  return (
    <div className="appraisal-tab-content">
      <header className="panel-header">
        <h2>Faculty Performance Analysis</h2>
        <p className="page-subtitle">Comprehensive identification of your key strengths, moderate performance areas, and targeted weaknesses.</p>
      </header>

      {loading ? (
        <div className="card empty-state">Analyzing performance data…</div>
      ) : submissions.length === 0 ? (
        <div className="perf-no-sub-container">
          <div className="card empty-state" style={{ padding: "2.5rem 2rem" }}>
            <TrendingUp size={44} style={{ color: "var(--primary)", marginBottom: "0.75rem" }} />
            <h3>No Submitted Appraisal Found</h3>
            <p className="empty-sub" style={{ maxWidth: "540px", margin: "0.5rem auto 1.25rem" }}>
              Complete and submit your faculty appraisal form to generate an automated live analysis of your strengths and weaknesses.
            </p>
          </div>
        </div>
      ) : (
        <div className="performance-container">
          {/* Top 4 Metrics Row */}
          <div className="perf-summary-cards">
            <div className="perf-card perf-card-strength">
              <div className="perf-card-icon icon-strength">
                <CheckCircle2 size={24} />
              </div>
              <div className="perf-card-info">
                <span className="perf-card-label">Strengths (Score &gt; 3)</span>
                <span className="perf-card-val">{analysis.strengths.length}</span>
              </div>
            </div>

            <div className="perf-card perf-card-moderate">
              <div className="perf-card-icon icon-moderate">
                <MinusCircle size={24} />
              </div>
              <div className="perf-card-info">
                <span className="perf-card-label">Moderate (Score = 3)</span>
                <span className="perf-card-val">{analysis.moderate.length}</span>
              </div>
            </div>

            <div className="perf-card perf-card-weakness">
              <div className="perf-card-icon icon-weakness">
                <AlertTriangle size={24} />
              </div>
              <div className="perf-card-info">
                <span className="perf-card-label">Weaknesses (Score &lt; 3)</span>
                <span className="perf-card-val">{analysis.weaknesses.length}</span>
              </div>
            </div>

            <div className="perf-card">
              <div className="perf-card-icon">
                <Award size={24} />
              </div>
              <div className="perf-card-info">
                <span className="perf-card-label">Latest Total Score</span>
                <span className="perf-card-val">
                  {latestSub.totalScore} / {latestSub.maxScore}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Columns: Strengths | Moderate | Weaknesses */}
          <div className="perf-grid-3col">
            {/* STRENGTHS COLUMN (> 3) */}
            <div className="card perf-col-card border-strength">
              <div className="perf-col-header header-strength">
                <CheckCircle2 size={20} />
                <h3>Strengths (Score &gt; 3)</h3>
                <span className="perf-count-chip chip-strength">{analysis.strengths.length}</span>
              </div>
              <div className="perf-col-body">
                {analysis.strengths.length === 0 ? (
                  <p className="perf-empty-text">No criteria scored above 3 in the latest appraisal.</p>
                ) : (
                  analysis.strengths.map((item) => (
                    <div key={item.index} className="analysis-item-card item-strength">
                      <div className="item-head">
                        <p className="item-title">
                          Q{String(item.index).padStart(2, "0")} {item.text}
                        </p>
                        <span className="score-pill pill-strength">Score: {item.score}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* MODERATE COLUMN (= 3) */}
            <div className="card perf-col-card border-moderate">
              <div className="perf-col-header header-moderate">
                <MinusCircle size={20} />
                <h3>Moderate Areas (Score = 3)</h3>
                <span className="perf-count-chip chip-moderate">{analysis.moderate.length}</span>
              </div>
              <div className="perf-col-body">
                {analysis.moderate.length === 0 ? (
                  <p className="perf-empty-text">No criteria scored exactly 3 in the latest appraisal.</p>
                ) : (
                  analysis.moderate.map((item) => (
                    <div key={item.index} className="analysis-item-card item-moderate">
                      <div className="item-head">
                        <p className="item-title">
                          Q{String(item.index).padStart(2, "0")} {item.text}
                        </p>
                        <span className="score-pill pill-moderate">Score: {item.score}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* WEAKNESSES COLUMN (< 3) */}
            <div className="card perf-col-card border-weakness">
              <div className="perf-col-header header-weakness">
                <AlertTriangle size={20} />
                <h3>Weaknesses (Score &lt; 3)</h3>
                <span className="perf-count-chip chip-weakness">{analysis.weaknesses.length}</span>
              </div>
              <div className="perf-col-body">
                {analysis.weaknesses.length === 0 ? (
                  <p className="perf-empty-text">Great job! No weaknesses identified below score 3.</p>
                ) : (
                  analysis.weaknesses.map((item) => (
                    <div key={item.index} className="analysis-item-card item-weakness">
                      <div className="item-head">
                        <p className="item-title">
                          Q{String(item.index).padStart(2, "0")} {item.text}
                        </p>
                        <span className="score-pill pill-weakness">Score: {item.score}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations Summary Box */}
          <div className="card perf-recommendation-card">
            <div className="rec-header">
              <Lightbulb size={22} style={{ color: "var(--primary)" }} />
              <h3>Development & Recommendations Summary</h3>
            </div>
            <div className="rec-content" style={{ marginTop: "0.5rem" }}>
              <p className="rec-text" style={{ marginBottom: "1rem" }}>
                Based on your appraisal responses, you have <strong>{analysis.strengths.length} key {analysis.strengths.length === 1 ? "strength" : "strengths"}</strong>, <strong>{analysis.moderate.length} moderate performance {analysis.moderate.length === 1 ? "criterion" : "criteria"}</strong>, and <strong>{analysis.weaknesses.length} {analysis.weaknesses.length === 1 ? "area" : "areas"} identified for improvement</strong>.
              </p>

              {/* TARGETED AREAS FOR FOCUS & IMPROVEMENT (Weaknesses Alone: Score < 3) */}
              {analysis.weaknesses.length > 0 ? (
                <div className="rec-section rec-section-weakness">
                  <h4 style={{ color: "var(--error)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.68rem" }}>
                    Targeted Areas for Focus &amp; Improvement:
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {analysis.weaknesses.map((w) => {
                      const recs = getRecommendationsForQuestion(w.text, w.score);
                      return (
                        <div key={w.index} className="rec-item-card" style={{ background: "rgba(239, 68, 68, 0.04)", borderLeft: "3px solid var(--error)", padding: "0.85rem 1.1rem", borderRadius: "0 8px 8px 0" }}>
                          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", marginBottom: "0.4rem" }}>
                            • Q{String(w.index).padStart(2, "0")} {w.text} <span style={{ fontWeight: 600, color: "var(--error)", fontSize: "0.82rem" }}>(Score: {w.score})</span>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: "1.35rem", color: "var(--text)", fontSize: "0.85rem", lineHeight: "1.5" }}>
                            {recs.map((r, i) => (
                              <li key={i} style={{ marginBottom: "0.25rem" }}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rec-no-weakness-box" style={{ background: "rgba(16, 185, 129, 0.04)", borderLeft: "3px solid var(--success)", padding: "0.85rem 1.1rem", borderRadius: "0 8px 8px 0" }}>
                  <strong style={{ color: "var(--success)", display: "block", marginBottom: "0.25rem" }}>
                    Great job! No areas identified for improvement.
                  </strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text)" }}>
                    All evaluated criteria scored 3 or above. Maintain your high standards across teaching, research, and institutional contributions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
