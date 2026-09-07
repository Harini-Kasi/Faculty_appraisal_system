import { useEffect, useMemo, useState, useRef } from "react";
import { Search, X, UserCheck, UserX, FileText, Award, Building2, BarChart2 } from "lucide-react";
import SubmissionCard from "../SubmissionCard";
import { ANALYTICS_DEPARTMENTS, DESIGNATIONS } from "../../utils/constants";
import { useNotification } from "../../context/NotificationContext";
import { api } from "../../utils/api";

export default function SubmissionsTab({ refreshKey }) {
  const { showNotification } = useNotification();
  const [deptFilter, setDeptFilter] = useState("");
  const [desigFilter, setDesigFilter] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      api.getAdminSubmissions(deptFilter, desigFilter),
      api.getAdminStaffList().catch(() => []),
    ])
      .then(([subRows, staffRows]) => {
        if (!cancelled) {
          setSubmissions(subRows);
          setStaffList(staffRows);
        }
      })
      .catch((err) => showNotification(err.message || "Could not load data.", "error"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptFilter, desigFilter, refreshKey]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submissionCountsMap = useMemo(() => {
    const map = new Map();
    submissions.forEach((sub) => {
      if (sub.username) {
        map.set(sub.username, (map.get(sub.username) || 0) + 1);
      }
    });
    return map;
  }, [submissions]);

  const suggestions = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();
    const map = new Map();

    staffList.forEach((s) => {
      if (s.username) {
        map.set(s.username, {
          username: s.username,
          name: s.name || s.username,
          department: s.department || "",
          designation: s.designation || "",
        });
      }
    });

    submissions.forEach((sub) => {
      if (sub.username && !map.has(sub.username)) {
        map.set(sub.username, {
          username: sub.username,
          name: sub.staffName || sub.username,
          department: sub.department || "",
          designation: sub.designation || "",
        });
      }
    });

    let list = Array.from(map.values());

    if (deptFilter) {
      list = list.filter((s) => s.department === deptFilter);
    }
    if (desigFilter) {
      list = list.filter((s) => s.designation === desigFilter);
    }

    if (!query) return list;

    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.username.toLowerCase().includes(query) ||
        s.department.toLowerCase().includes(query) ||
        s.designation.toLowerCase().includes(query)
    );
  }, [staffList, submissions, staffSearch, deptFilter, desigFilter]);

  const filteredSubmissions = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();
    if (!query) return submissions;
    return submissions.filter((sub) => {
      const name = (sub.staffName || "").toLowerCase();
      const username = (sub.username || "").toLowerCase();
      const dept = (sub.department || "").toLowerCase();
      return name.includes(query) || username.includes(query) || dept.includes(query);
    });
  }, [submissions, staffSearch]);

  const avgScore = useMemo(() => {
    if (submissions.length === 0) return 0;
    const sum = submissions.reduce((acc, s) => acc + (Number(s.totalScore) || 0), 0);
    return (sum / submissions.length).toFixed(1);
  }, [submissions]);

  const handleSelectSuggestion = (staff) => {
    setStaffSearch(staff.name);
    setShowSuggestions(false);
  };

  return (
    <div id="submissionsTab" className="appraisal-tab-content">
      <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "1.25rem", marginTop: "-0.5rem" }}>
        Review, analyze, and download submitted faculty appraisal responses.
      </p>

      {/* Summary Metrics Row */}
      <div className="perf-summary-cards" style={{ marginBottom: "1.5rem" }}>
        <div className="perf-card">
          <div className="perf-card-icon">
            <FileText size={24} />
          </div>
          <div className="perf-card-info">
            <span className="perf-card-label">Total Submissions</span>
            <span className="perf-card-val">{submissions.length}</span>
          </div>
        </div>

        <div className="perf-card">
          <div className="perf-card-icon">
            <Award size={24} />
          </div>
          <div className="perf-card-info">
            <span className="perf-card-label">Average Score</span>
            <span className="perf-card-val">{avgScore}</span>
          </div>
        </div>

        <div className="perf-card">
          <div className="perf-card-icon">
            <Building2 size={24} />
          </div>
          <div className="perf-card-info">
            <span className="perf-card-label">Departments Covered</span>
            <span className="perf-card-val">
              {new Set(submissions.map((s) => s.department)).size || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card details-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.75rem" }}>
        <div className="faculty-details-grid" style={{ gridTemplateColumns: "1fr 1fr 2fr", gap: "1rem" }}>
          <div className="field-group">
            <label>Department</label>
            <select
              className="input-styled"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {ANALYTICS_DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Designation</label>
            <select
              className="input-styled"
              value={desigFilter}
              onChange={(e) => setDesigFilter(e.target.value)}
            >
              <option value="">All Designations</option>
              {DESIGNATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group search-filter-item" ref={searchContainerRef} style={{ position: "relative" }}>
            <label>Search Staff</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="input-styled"
                style={{ paddingLeft: "2.4rem" }}
                value={staffSearch}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setStaffSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Search staff name or ID..."
              />
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                  pointerEvents: "none",
                }}
              />
              {staffSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setStaffSearch("");
                    setShowSuggestions(false);
                  }}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {showSuggestions && (
              <div className="search-suggestions-dropdown card">
                <div className="suggestions-header">
                  {suggestions.length > 0 ? (
                    <span>Staff Suggestions ({suggestions.length})</span>
                  ) : (
                    <span>No matching staff found</span>
                  )}
                </div>
                <ul className="suggestions-list">
                  {suggestions.map((staff) => {
                    const count = submissionCountsMap.get(staff.username) || 0;
                    return (
                      <li
                        key={staff.username}
                        className="suggestion-item"
                        onClick={() => handleSelectSuggestion(staff)}
                      >
                        <div className="suggestion-info">
                          <div className="suggestion-name-row">
                            <span className="suggestion-name">{staff.name}</span>
                            <span className="suggestion-badge">{staff.username}</span>
                          </div>
                          <div className="suggestion-meta">
                            <span>{staff.department || "Dept N/A"}</span> • <span>{staff.designation || "Desig N/A"}</span>
                          </div>
                        </div>
                        <div className="suggestion-status">
                          {count > 0 ? (
                            <span className="status-submitted" title={`${count} submission(s)`}>
                              <UserCheck size={14} /> {count} Submitted
                            </span>
                          ) : (
                            <span className="status-pending" title="No submissions yet">
                              <UserX size={14} /> Pending
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div id="submissionsList" className="submissions-list-grid">
        {loading && <div className="no-data-msg card">Loading submissions…</div>}
        {!loading && submissions.length === 0 && (
          <div className="no-data-msg card">No submissions match the selected filters yet.</div>
        )}
        {!loading && submissions.length > 0 && filteredSubmissions.length === 0 && (
          <div className="no-data-msg card">No submissions match your search "{staffSearch}".</div>
        )}
        {!loading &&
          filteredSubmissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} showReportButton />
          ))}
      </div>
    </div>
  );
}
