import React from "react";
import { useAuth } from "../../context/AuthContext";

const FIELDS = [
  { key: "areaOfSpecialization", label: "Area of Specialization", type: "text", placeholder: "e.g. Artificial Intelligence" },
  { key: "teachingExperience", label: "Teaching Experience (Years)", type: "number", placeholder: "0" },
  { key: "industryExperience", label: "Industry Experience (Years)", type: "number", placeholder: "0" },
  { key: "coursesTaughtOdd", label: "Courses Taught (Odd Semester)", type: "text", placeholder: "e.g. Data Structures, AI Basics" },
  { key: "coursesTaughtEven", label: "Courses Taught (Even Semester)", type: "text", placeholder: "e.g. Machine Learning, DBMS" },
  { key: "ugProjectsGuided", label: "UG Projects Guided", type: "number", placeholder: "0" },
  { key: "pgProjectsGuided", label: "PG Projects Guided", type: "number", placeholder: "0" },
  { key: "tutorship", label: "Select Tutorship", type: "text", placeholder: "Select Tutorship" },
];

const TUTORSHIP_OPTIONS = [
  "II Year",
  "III Year",
  "IV Year",
  "PG",
  "Not applicable"
];

export default function FacultyDetailsForm({ details, onChange, errorKeys }) {
  const { session } = useAuth();

  return (
    <div className="card details-card">
      <h3 className="details-card-title">Faculty Details</h3>
      <div className="faculty-details-grid">
        {FIELDS.map((field) => {
          const isTutorship = field.key === "tutorship";

          return (
            <div className="field-group" key={field.key}>
              <label htmlFor={`fd-${field.key}`}>{field.label}</label>
              {isTutorship ? (
                <select
                  id={`fd-${field.key}`}
                  className={`input-styled ${errorKeys?.has(field.key) ? "input-error" : ""}`}
                  value={details[field.key] || ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                >
                  <option value="" disabled>
                    Select Tutorship
                  </option>
                  {TUTORSHIP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`fd-${field.key}`}
                  type={field.type === "number" ? "number" : "text"}
                  min={field.type === "number" ? "0" : undefined}
                  step={field.type === "number" ? "1" : undefined}
                  className={`input-styled ${errorKeys?.has(field.key) ? "input-error" : ""}`}
                  value={details[field.key] || ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const EMPTY_FACULTY_DETAILS = {
  areaOfSpecialization: "",
  teachingExperience: "",
  industryExperience: "",
  coursesTaughtOdd: "",
  coursesTaughtEven: "",
  ugProjectsGuided: "",
  pgProjectsGuided: "",
  tutorship: "",
};

export const FACULTY_DETAIL_FIELDS = FIELDS;
