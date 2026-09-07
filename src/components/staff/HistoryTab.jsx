import { useEffect, useState } from "react";
import SubmissionCard from "../SubmissionCard";
import { useNotification } from "../../context/NotificationContext";
import { api } from "../../utils/api";

export default function HistoryTab({ refreshKey }) {
  const { showNotification } = useNotification();
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getMySubmissions()
      .then((rows) => {
        if (!cancelled) setMine(rows);
      })
      .catch((err) => showNotification(err.message || "Could not load your submissions.", "error"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div id="historyTab" className="appraisal-tab-content">
      <header className="panel-header">
        <h2>My Submissions</h2>
        <p className="page-subtitle">A record of every appraisal you have submitted.</p>
      </header>
      <div id="staffSubmissionsList" className="submissions-list">
        {loading && <div className="no-data-msg card">Loading…</div>}
        {!loading && mine.length === 0 && (
          <div className="no-data-msg card">You haven't submitted any appraisals yet.</div>
        )}
        {!loading &&
          mine.map((sub) => <SubmissionCard key={sub.id} submission={sub} hideWeightage />)}
      </div>
    </div>
  );
}
