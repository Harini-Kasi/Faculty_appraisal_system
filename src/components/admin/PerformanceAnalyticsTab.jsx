import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Building2,
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Search,
  User,
  X,
  ChevronRight,
  BarChart3,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";
import { ANALYTICS_DEPARTMENTS, DESIGNATIONS } from "../../utils/constants";
import { designationLabel } from "../../utils/storage";
import { useNotification } from "../../context/NotificationContext";
import { api } from "../../utils/api";

export default function PerformanceAnalyticsTab() {
  const { showNotification } = useNotification();

  const [selectedDept, setSelectedDept] = useState("CSE");
  const [selectedDesig, setSelectedDesig] = useState("");
  const [selectedFacultyUser, setSelectedFacultyUser] = useState("");

  const [submissions, setSubmissions] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const individualRef = useRef(null);

  // Load submissions and staff list
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      api.getAdminSubmissions(),
      api.getAdminStaffList().catch(() => []),
    ])
      .then(([subRows, staffRows]) => {
        if (!cancelled) {
          setSubmissions(subRows || []);
          setStaffList(staffRows || []);
        }
      })
      .catch((err) =>
        showNotification(err.message || "Could not load performance analytics data.", "error")
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter staff & submissions by department
  const deptSubmissions = useMemo(() => {
    if (!selectedDept || selectedDept === "ALL") return submissions;
    return submissions.filter((s) => s.department === selectedDept);
  }, [submissions, selectedDept]);

  const deptStaff = useMemo(() => {
    if (!selectedDept || selectedDept === "ALL") return staffList;
    return staffList.filter((s) => s.department === selectedDept);
  }, [staffList, selectedDept]);

  // Apply optional designation & faculty filters
  const filteredSubmissions = useMemo(() => {
    let list = deptSubmissions;
    if (selectedDesig) {
      list = list.filter((s) => s.designation === selectedDesig);
    }
    if (selectedFacultyUser) {
      list = list.filter((s) => s.username === selectedFacultyUser);
    }
    return list;
  }, [deptSubmissions, selectedDesig, selectedFacultyUser]);

  // Combined faculty roster in department (from staff list + submission records)
  const deptFacultyMap = useMemo(() => {
    const map = new Map();

    deptStaff.forEach((s) => {
      if (s.username) {
        map.set(s.username, {
          username: s.username,
          name: s.name || s.username,
          department: s.department || selectedDept,
          designation: s.designation || "Assistant Professor",
          submission: null,
        });
      }
    });

    deptSubmissions.forEach((sub) => {
      const existing = map.get(sub.username);
      if (existing) {
        // Keep the latest submission
        if (!existing.submission || sub.id > existing.submission.id) {
          existing.submission = sub;
        }
      } else {
        map.set(sub.username, {
          username: sub.username,
          name: sub.staffName || sub.username,
          department: sub.department || selectedDept,
          designation: sub.designation || "Assistant Professor",
          submission: sub,
        });
      }
    });

    return map;
  }, [deptStaff, deptSubmissions, selectedDept]);

  const deptFacultyList = useMemo(() => {
    return Array.from(deptFacultyMap.values());
  }, [deptFacultyMap]);

  // Department Overview Metrics
  const deptOverview = useMemo(() => {
    const totalFacultyCount = deptFacultyList.length;
    const submittedRows = deptSubmissions;

    if (submittedRows.length === 0) {
      return {
        totalFacultyCount,
        submittedCount: 0,
        avgPercentage: 0,
        highestPerformer: null,
        lowestPerformer: null,
        excellentCount: 0,
        goodCount: 0,
        needsImprovementCount: 0,
      };
    }

    let totalPctSum = 0;
    let highestPct = -1;
    let highestPerformer = null;
    let lowestPct = 101;
    let lowestPerformer = null;

    let excellentCount = 0;
    let goodCount = 0;
    let needsImprovementCount = 0;

    submittedRows.forEach((sub) => {
      const maxScore = Number(sub.maxScore) || 1;
      const totalScore = Number(sub.totalScore) || 0;
      const pct = Math.min(100, Math.round((totalScore / maxScore) * 100));

      totalPctSum += pct;

      if (pct >= 80) excellentCount++;
      else if (pct >= 60) goodCount++;
      else needsImprovementCount++;

      if (pct > highestPct) {
        highestPct = pct;
        highestPerformer = { name: sub.staffName, username: sub.username, scorePct: pct };
      }

      if (pct < lowestPct) {
        lowestPct = pct;
        lowestPerformer = { name: sub.staffName, username: sub.username, scorePct: pct };
      }
    });

    const avgPct = Math.round(totalPctSum / submittedRows.length);

    return {
      totalFacultyCount,
      submittedCount: submittedRows.length,
      avgPercentage: avgPct,
      highestPerformer,
      lowestPerformer,
      excellentCount,
      goodCount,
      needsImprovementCount,
    };
  }, [deptFacultyList, deptSubmissions]);

  // Designation-wise Breakdown Chart Data
  const designationBreakdown = useMemo(() => {
    const desigGroupMap = new Map();

    DESIGNATIONS.forEach((d) => {
      desigGroupMap.set(d.value, { label: d.label, submissions: [] });
    });

    deptSubmissions.forEach((sub) => {
      if (desigGroupMap.has(sub.designation)) {
        desigGroupMap.get(sub.designation).submissions.push(sub);
      } else {
        desigGroupMap.set(sub.designation, {
          label: designationLabel(sub.designation),
          submissions: [sub],
        });
      }
    });

    const result = [];
    desigGroupMap.forEach((val, desigKey) => {
      const subs = val.submissions;
      if (subs.length > 0) {
        const sumPct = subs.reduce((acc, s) => {
          const max = Number(s.maxScore) || 1;
          const score = Number(s.totalScore) || 0;
          return acc + (score / max) * 100;
        }, 0);
        const avgPct = Math.round(sumPct / subs.length);
        result.push({
          designationKey: desigKey,
          label: val.label,
          count: subs.length,
          avgPercentage: avgPct,
        });
      }
    });

    return result.sort((a, b) => b.avgPercentage - a.avgPercentage);
  }, [deptSubmissions]);

  // Department Strengths & Areas for Improvement across questions/categories
  const deptCategoryAnalysis = useMemo(() => {
    const questionScoresMap = new Map();

    deptSubmissions.forEach((sub) => {
      if (Array.isArray(sub.answers)) {
        sub.answers.forEach((ans, idx) => {
          const title = ans.questionText || ans.groupLabel || `Criterion #${idx + 1}`;
          const section = ans.sectionLabel || "General Evaluation";
          const score = Number(ans.questionScore ?? ans.optionScore ?? 0);
          const pct = Math.min(100, Math.round((score / 5) * 100));

          if (!questionScoresMap.has(title)) {
            questionScoresMap.set(title, { title, section, totalPct: 0, count: 0, scores: [] });
          }

          const entry = questionScoresMap.get(title);
          entry.totalPct += pct;
          entry.count += 1;
          entry.scores.push(score);
        });
      }
    });

    const categories = [];
    questionScoresMap.forEach((val) => {
      if (val.count > 0) {
        const avgPct = Math.round(val.totalPct / val.count);
        const avgScore = (val.scores.reduce((a, b) => a + b, 0) / val.count).toFixed(1);
        categories.push({
          title: val.title,
          section: val.section,
          avgPercentage: avgPct,
          avgScore,
          sampleCount: val.count,
        });
      }
    });

    categories.sort((a, b) => b.avgPercentage - a.avgPercentage);

    const strengths = categories.filter((c) => c.avgPercentage >= 70).slice(0, 4);
    const weaknesses = categories.filter((c) => c.avgPercentage < 70).slice(-4).reverse();

    return { all: categories, strengths, weaknesses };
  }, [deptSubmissions]);

  // Selected Individual Faculty Details
  const selectedFacultyObject = useMemo(() => {
    if (!selectedFacultyUser) return null;
    return deptFacultyMap.get(selectedFacultyUser) || null;
  }, [selectedFacultyUser, deptFacultyMap]);

  // Individual Faculty Category comparison vs Dept Avg
  const individualAnalysis = useMemo(() => {
    if (!selectedFacultyObject || !selectedFacultyObject.submission) return null;

    const sub = selectedFacultyObject.submission;
    const maxScore = Number(sub.maxScore) || 1;
    const totalScore = Number(sub.totalScore) || 0;
    const facultyOverallPct = Math.round((totalScore / maxScore) * 100);

    const deptAvgPct = deptOverview.avgPercentage;
    const overallDiff = facultyOverallPct - deptAvgPct;

    const categoryComparison = [];

    if (Array.isArray(sub.answers)) {
      sub.answers.forEach((ans, idx) => {
        const title = ans.questionText || `Criterion #${idx + 1}`;
        const score = Number(ans.questionScore ?? ans.optionScore ?? 0);
        const facPct = Math.min(100, Math.round((score / 5) * 100));

        const deptCat = deptCategoryAnalysis.all.find((c) => c.title === title);
        const catDeptAvg = deptCat ? deptCat.avgPercentage : deptAvgPct;
        const diff = facPct - catDeptAvg;

        categoryComparison.push({
          title,
          facultyScore: score,
          facultyPct: facPct,
          deptAvgPct: catDeptAvg,
          diff,
          optionText: ans.selectedOption || "Completed",
          evidence: ans.evidence || "",
        });
      });
    }

    const strengths = categoryComparison.filter((c) => c.diff >= 0 || c.facultyPct >= 80);
    const weaknesses = categoryComparison.filter((c) => c.diff < 0 || c.facultyPct < 60);

    return {
      submission: sub,
      facultyOverallPct,
      deptAvgPct,
      overallDiff,
      categoryComparison,
      strengths,
      weaknesses,
    };
  }, [selectedFacultyObject, deptOverview, deptCategoryAnalysis]);

  const handleSelectFacultyRow = (username) => {
    setSelectedFacultyUser(username);
    setTimeout(() => {
      if (individualRef.current) {
        individualRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div id="performanceAnalyticsTab" className="appraisal-tab-content">
      {/* Page Description */}
      <p className="page-subtitle" style={{ marginBottom: "1.5rem", marginTop: "-0.25rem" }}>
        Department-level evaluation dashboard, faculty performance benchmarking, designation breakdowns, and strengths identification.
      </p>

      {/* 1. DEPARTMENT & FILTERS CONTROL BAR */}
      <div className="card details-card analytics-filter-card" style={{ marginBottom: "1.75rem" }}>
        <div className="analytics-filter-header">
          <div className="filter-header-title">
            <Filter size={18} style={{ color: "var(--primary)" }} />
            <span>Analytics Selection &amp; Filters</span>
          </div>
          {(selectedDesig || selectedFacultyUser) && (
            <button
              type="button"
              className="btn-clear-filter"
              onClick={() => {
                setSelectedDesig("");
                setSelectedFacultyUser("");
              }}
            >
              <X size={14} />
              Reset Filters
            </button>
          )}
        </div>

        <div className="analytics-filters-grid">
          {/* Department Selection */}
          <div className="field-group">
            <label>Select Department (Main Control)</label>
            <select
              className="input-styled dept-selector-highlight"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedFacultyUser("");
              }}
            >
              <option value="ALL">All Departments</option>
              {ANALYTICS_DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Designation Filter */}
          <div className="field-group">
            <label>Designation Filter (Optional)</label>
            <select
              className="input-styled"
              value={selectedDesig}
              onChange={(e) => setSelectedDesig(e.target.value)}
            >
              <option value="">All Designations</option>
              {DESIGNATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Faculty Filter */}
          <div className="field-group">
            <label>Specific Faculty (Optional)</label>
            <select
              className="input-styled"
              value={selectedFacultyUser}
              onChange={(e) => setSelectedFacultyUser(e.target.value)}
            >
              <option value="">All Department Faculty</option>
              {deptFacultyList.map((f) => (
                <option key={f.username} value={f.username}>
                  {f.name} ({f.username}) {f.submission ? "" : "— [No Submission]"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card no-data-msg">Loading department analytics data…</div>
      ) : (
        <>
          {/* 2. DEPARTMENT OVERVIEW CARDS */}
          <div className="analytics-section-title">
            <Building2 size={20} style={{ color: "var(--primary)" }} />
            <h2>
              {selectedDept === "ALL" ? "All Departments Overview" : `${selectedDept} Department Overview`}
            </h2>
          </div>

          <div className="perf-summary-cards analytics-metrics-grid" style={{ marginBottom: "2rem" }}>
            {/* Total Faculty */}
            <div className="perf-card">
              <div className="perf-card-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                <Users size={24} />
              </div>
              <div className="perf-card-info">
                <span className="perf-card-label">Total Department Faculty</span>
                <span className="perf-card-val">
                  {deptOverview.totalFacultyCount}
                  <small style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500, marginLeft: 6 }}>
                    ({deptOverview.submittedCount} Submitted)
                  </small>
                </span>
              </div>
            </div>

            {/* Department Avg Performance */}
            <div className="perf-card">
              <div className="perf-card-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                <BarChart3 size={24} />
              </div>
              <div className="perf-card-info">
                <span className="perf-card-label">Dept Average Performance</span>
                <span className="perf-card-val">{deptOverview.avgPercentage}%</span>
              </div>
            </div>

            {/* Highest Performer */}
            <div className="perf-card perf-card-strength">
              <div className="perf-card-icon icon-strength">
                <TrendingUp size={24} />
              </div>
              <div className="perf-card-info">
                <span className="perf-card-label">Highest Performer</span>
                <span className="perf-card-val" style={{ fontSize: "1.1rem" }}>
                  {deptOverview.highestPerformer
                    ? `${deptOverview.highestPerformer.name} (${deptOverview.highestPerformer.scorePct}%)`
                    : "—"}
                </span>
              </div>
            </div>

            {/* Lowest Performer */}
            <div className="perf-card perf-card-weakness">
              <div className="perf-card-icon icon-weakness">
                <TrendingDown size={24} />
              </div>
              <div className="perf-card-info">
                <span className="perf-card-label">Lowest Performer</span>
                <span className="perf-card-val" style={{ fontSize: "1.1rem" }}>
                  {deptOverview.lowestPerformer
                    ? `${deptOverview.lowestPerformer.name} (${deptOverview.lowestPerformer.scorePct}%)`
                    : "—"}
                </span>
              </div>
            </div>

            {/* Breakdown Counts */}
            <div className="perf-card">
              <div className="perf-card-icon" style={{ background: "#F5EDF2", color: "var(--primary)" }}>
                <Sparkles size={24} />
              </div>
              <div className="perf-card-info">
                <span className="perf-card-label">Performance Ratings</span>
                <div className="rating-mini-pills">
                  <span className="badge-pill pill-excellent" title="Excellent >= 80%">
                    Exc: {deptOverview.excellentCount}
                  </span>
                  <span className="badge-pill pill-good" title="Good 60-79%">
                    Good: {deptOverview.goodCount}
                  </span>
                  <span className="badge-pill pill-needs-imp" title="Needs Improvement < 60%">
                    Improve: {deptOverview.needsImprovementCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. FACULTY PERFORMANCE TABLE */}
          <div className="card analytics-table-card" style={{ marginBottom: "2rem" }}>
            <div className="table-card-header">
              <div className="table-header-left">
                <Users size={18} style={{ color: "var(--primary)" }} />
                <h3>Faculty Performance Roster ({filteredSubmissions.length} Submissions)</h3>
              </div>
              <span className="table-subtitle-hint">Click any faculty to view detailed individual analysis</span>
            </div>

            {deptFacultyList.length === 0 ? (
              <div className="no-data-msg">No faculty records found for {selectedDept}.</div>
            ) : (
              <div className="table-responsive">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Faculty Member</th>
                      <th>Designation</th>
                      <th>Overall Score</th>
                      <th>Performance %</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptFacultyList.map((fac) => {
                      const sub = fac.submission;
                      const hasSub = Boolean(sub);
                      const maxScore = hasSub ? Number(sub.maxScore) || 1 : 1;
                      const totalScore = hasSub ? Number(sub.totalScore) || 0 : 0;
                      const scorePct = hasSub ? Math.min(100, Math.round((totalScore / maxScore) * 100)) : 0;

                      let statusBadge = (
                        <span className="status-badge badge-pending">Not Submitted</span>
                      );
                      if (hasSub) {
                        if (scorePct >= 80) {
                          statusBadge = <span className="status-badge badge-excellent">Excellent</span>;
                        } else if (scorePct >= 60) {
                          statusBadge = <span className="status-badge badge-good">Good</span>;
                        } else {
                          statusBadge = (
                            <span className="status-badge badge-improvement">Needs Improvement</span>
                          );
                        }
                      }

                      const isSelected = selectedFacultyUser === fac.username;

                      return (
                        <tr
                          key={fac.username}
                          className={`table-row-interactive ${isSelected ? "row-selected" : ""}`}
                          onClick={() => handleSelectFacultyRow(fac.username)}
                        >
                          <td>
                            <div className="faculty-user-cell">
                              <div className="avatar-mini">
                                <User size={16} />
                              </div>
                              <div className="faculty-user-text">
                                <span className="faculty-name-bold">{fac.name}</span>
                                <span className="faculty-uname-sub">{fac.username}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="desig-tag">{designationLabel(fac.designation)}</span>
                          </td>

                          <td>
                            {hasSub ? (
                              <span className="score-num-text">
                                {sub.totalScore} / {sub.maxScore}
                              </span>
                            ) : (
                              <span className="score-muted">—</span>
                            )}
                          </td>

                          <td>
                            {hasSub ? (
                              <div className="progress-bar-wrapper">
                                <div className="progress-bar-bg">
                                  <div
                                    className={`progress-bar-fill ${
                                      scorePct >= 80 ? "fill-excellent" : scorePct >= 60 ? "fill-good" : "fill-improvement"
                                    }`}
                                    style={{ width: `${scorePct}%` }}
                                  />
                                </div>
                                <span className="progress-pct-label">{scorePct}%</span>
                              </div>
                            ) : (
                              <span className="score-muted">—</span>
                            )}
                          </td>

                          <td>{statusBadge}</td>

                          <td>
                            <button
                              type="button"
                              className={`btn-table-action ${isSelected ? "btn-active-action" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectFacultyRow(fac.username);
                              }}
                            >
                              View Analysis
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. DESIGNATION-WISE PERFORMANCE & 5. DEPT STRENGTHS GRID */}
          <div className="analytics-two-col-grid" style={{ marginBottom: "2rem" }}>
            {/* 4. Designation-wise Performance Chart */}
            <div className="card analytics-card-panel">
              <div className="panel-card-title">
                <BarChart3 size={18} style={{ color: "var(--primary)" }} />
                <h3>Designation-wise Average Performance</h3>
              </div>
              <p className="panel-card-sub">
                Comparative average score percentages across faculty designations within {selectedDept}.
              </p>

              {designationBreakdown.length === 0 ? (
                <div className="no-data-msg" style={{ padding: "1.5rem" }}>
                  No submission data available to compute designation breakdown.
                </div>
              ) : (
                <div className="desig-chart-list">
                  {designationBreakdown.map((item) => (
                    <div key={item.designationKey} className="desig-chart-item">
                      <div className="desig-chart-meta">
                        <span className="desig-chart-label">{item.label}</span>
                        <span className="desig-chart-val">
                          {item.avgPercentage}% <small>({item.count} Faculty)</small>
                        </span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill fill-primary-theme"
                          style={{ width: `${item.avgPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Department Strengths & Areas for Improvement */}
            <div className="card analytics-card-panel">
              <div className="panel-card-title">
                <Lightbulb size={18} style={{ color: "var(--primary)" }} />
                <h3>Department Strengths &amp; Improvement Areas</h3>
              </div>
              <p className="panel-card-sub">
                Highest and lowest scoring evaluation criteria aggregated across {selectedDept} department responses.
              </p>

              {deptCategoryAnalysis.all.length === 0 ? (
                <div className="no-data-msg" style={{ padding: "1.5rem" }}>
                  No evaluation criteria submissions available yet.
                </div>
              ) : (
                <div className="dept-strengths-grid">
                  {/* Strengths */}
                  <div className="dept-strength-col">
                    <div className="strength-subhead text-success">
                      <CheckCircle2 size={16} />
                      <span>Department Strengths</span>
                    </div>
                    {deptCategoryAnalysis.strengths.length === 0 ? (
                      <p className="empty-sub text-muted">No criteria scored &gt;= 70% average.</p>
                    ) : (
                      deptCategoryAnalysis.strengths.map((item, i) => (
                        <div key={i} className="strength-item-mini item-strength">
                          <span className="item-mini-title">{item.title}</span>
                          <span className="item-mini-score score-pill pill-strength">{item.avgPercentage}%</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Areas for Improvement */}
                  <div className="dept-weakness-col">
                    <div className="strength-subhead text-error">
                      <AlertTriangle size={16} />
                      <span>Areas for Improvement</span>
                    </div>
                    {deptCategoryAnalysis.weaknesses.length === 0 ? (
                      <p className="empty-sub text-muted">Great work! All criteria averaged &gt;= 70%.</p>
                    ) : (
                      deptCategoryAnalysis.weaknesses.map((item, i) => (
                        <div key={i} className="strength-item-mini item-weakness">
                          <span className="item-mini-title">{item.title}</span>
                          <span className="item-mini-score score-pill pill-weakness">{item.avgPercentage}%</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. INDIVIDUAL FACULTY ANALYSIS */}
          <div ref={individualRef} id="individualAnalysisSection">
            {selectedFacultyObject ? (
              <div className="card individual-analysis-card" style={{ marginBottom: "2rem" }}>
                <div className="individual-card-header">
                  <div className="ind-header-left">
                    <User size={22} style={{ color: "var(--primary)" }} />
                    <div>
                      <h3>Individual Faculty Performance Analysis</h3>
                      <span className="ind-faculty-subtitle">
                        {selectedFacultyObject.name} ({selectedFacultyObject.username}) • {designationLabel(selectedFacultyObject.designation)} • {selectedDept} Department
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-clear-selection"
                    onClick={() => setSelectedFacultyUser("")}
                  >
                    <X size={16} />
                    Clear Faculty Selection
                  </button>
                </div>

                {!individualAnalysis ? (
                  <div className="no-data-msg" style={{ padding: "2.5rem" }}>
                    <strong>{selectedFacultyObject.name}</strong> has not submitted an appraisal form yet for this cycle.
                  </div>
                ) : (
                  <div className="individual-analysis-body">
                    {/* Faculty Top Score Banner vs Department Average */}
                    <div className="ind-score-banner">
                      <div className="ind-score-box">
                        <span className="ind-score-lbl">Faculty Overall Score</span>
                        <span className="ind-score-val">{individualAnalysis.facultyOverallPct}%</span>
                        <span className="ind-score-sub">({individualAnalysis.submission.totalScore} / {individualAnalysis.submission.maxScore})</span>
                      </div>

                      <div className="ind-vs-box">
                        <span className="ind-vs-lbl">Department Average Benchmark</span>
                        <span className="ind-vs-val">{individualAnalysis.deptAvgPct}%</span>
                      </div>

                      <div className={`ind-diff-badge ${individualAnalysis.overallDiff >= 0 ? "diff-positive" : "diff-negative"}`}>
                        {individualAnalysis.overallDiff >= 0 ? (
                          <>
                            <ArrowUpRight size={18} />
                            <span>+{individualAnalysis.overallDiff}% above Dept Avg</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight size={18} />
                            <span>{individualAnalysis.overallDiff}% below Dept Avg</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Category-wise Scores Comparison Table */}
                    <h4 className="ind-section-heading">Category &amp; Criterion Performance Breakdown</h4>
                    <div className="table-responsive" style={{ marginBottom: "1.5rem" }}>
                      <table className="analytics-table table-comparison">
                        <thead>
                          <tr>
                            <th>Criterion / Category</th>
                            <th>Faculty Rating</th>
                            <th>Faculty Score %</th>
                            <th>Dept Avg %</th>
                            <th>Variance vs Dept</th>
                          </tr>
                        </thead>
                        <tbody>
                          {individualAnalysis.categoryComparison.map((cat, i) => (
                            <tr key={i}>
                              <td className="font-weight-bold">{cat.title}</td>
                              <td>
                                <span className="rating-chip">{cat.optionText}</span>
                              </td>
                              <td>
                                <span className="score-bold">{cat.facultyPct}%</span>
                              </td>
                              <td>
                                <span className="dept-avg-text">{cat.deptAvgPct}%</span>
                              </td>
                              <td>
                                <span className={`diff-pill ${cat.diff >= 0 ? "pill-plus" : "pill-minus"}`}>
                                  {cat.diff >= 0 ? `+${cat.diff}%` : `${cat.diff}%`}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Faculty Specific Strengths & Improvement Areas Side by Side */}
                    <div className="perf-grid-3col" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 0 }}>
                      <div className="card perf-col-card border-strength">
                        <div className="perf-col-header header-strength">
                          <CheckCircle2 size={18} />
                          <h3>Faculty Key Strengths</h3>
                        </div>
                        <div className="perf-col-body">
                          {individualAnalysis.strengths.length === 0 ? (
                            <p className="perf-empty-text">No criteria scored above department average.</p>
                          ) : (
                            individualAnalysis.strengths.map((item, i) => (
                              <div key={i} className="analysis-item-card item-strength" style={{ marginBottom: "0.6rem" }}>
                                <div className="item-head">
                                  <span className="item-title">{item.title}</span>
                                  <span className="score-pill pill-strength">{item.facultyPct}%</span>
                                </div>
                                <div className="item-rating-text">
                                  Rating: <strong>{item.optionText}</strong>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="card perf-col-card border-weakness">
                        <div className="perf-col-header header-weakness">
                          <AlertTriangle size={18} />
                          <h3>Areas for Faculty Improvement</h3>
                        </div>
                        <div className="perf-col-body">
                          {individualAnalysis.weaknesses.length === 0 ? (
                            <p className="perf-empty-text">Great job! All criteria meet or exceed department average.</p>
                          ) : (
                            individualAnalysis.weaknesses.map((item, i) => (
                              <div key={i} className="analysis-item-card item-weakness" style={{ marginBottom: "0.6rem" }}>
                                <div className="item-head">
                                  <span className="item-title">{item.title}</span>
                                  <span className="score-pill pill-weakness">{item.facultyPct}%</span>
                                </div>
                                <div className="item-rating-text">
                                  Rating: <strong>{item.optionText}</strong> (Dept Avg: {item.deptAvgPct}%)
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card empty-state-select-hint">
                <User size={32} style={{ color: "var(--primary)", marginBottom: "0.5rem" }} />
                <h3>Select a Faculty Member for Individual Deep-Dive</h3>
                <p>
                  Click on any faculty row in the table above or use the "Specific Faculty" dropdown filter to view detailed criterion scores, department average comparisons, and individual strengths.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
