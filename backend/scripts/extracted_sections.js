const SECTIONS = [
  { id: "sg1", title: "1. ADMISSION", subsections: [
    { title: "1. Strength", fields: SECTION_FIELDS.filter(f => f.key === 'sg1_strength') },
    { title: "1.1. UG Admission (TNEA counseling)", fields: SECTION_FIELDS.filter(f => ['sg1_ug_round1', 'sg1_ug_round2', 'sg1_ug_round3'].includes(f.key)) },
    { title: "1.2. Cut off details (All Seats)", fields: SECTION_FIELDS.filter(f => ['sg1_cutoff_counseling', 'sg1_cutoff_total'].includes(f.key)) },
    { title: "2. PG Admission", fields: SECTION_FIELDS.filter(f => f.key === 'sg1_pg') },
    { title: "3. Regional Distribution", fields: SECTION_FIELDS.filter(f => ['sg1_kvp', 'sg1_around_kvp'].includes(f.key)) },
    { title: "4. Gender Distribution", fields: SECTION_FIELDS.filter(f => ['sg1_male', 'sg1_female'].includes(f.key)) }
  ] },
  { id: "sg2", title: "2. ACADEMIC ACHIEVEMENTS", subsections: [
    { title: "2.1. Pass Percentage", fields: SECTION_FIELDS.filter(f => ['sg2_wo_backlog_i', 'sg2_wo_backlog_ii', 'sg2_wo_backlog_iii','sg2_wo_backlog_iv','sg2_with_backlog_i','sg2_with_backlog_ii','sg2_with_backlog_iii','sg2_with_backlog_iv'].includes(f.key)) },
    { title: "2.2. Grades (Average of I, II, III & IV year students)", fields: SECTION_FIELDS.filter(f => ['sg2_cgpa_1','sg2_cgpa_2','sg2_cgpa_3'].includes(f.key)) }
  ] },
  { id: "sg3", title: "3. STUDENTS POTENTIAL TRANSFORMATION", subsections: [
    { title: "3.1. Achievements & Participation in National/International events (II & III Year Only)", fields: SECTION_FIELDS.filter(f => ['sg3_participation', 'sg3_achievement', 'sg3_online', 'sg3_physical', 'sg3_hackathon', 'sg3_hackathon_achieve'].includes(f.key)) },
    { title: "3.2. Students' Publications", fields: SECTION_FIELDS.filter(f => ['sg3_sci', 'sg3_scopus', 'sg3_journals'].includes(f.key)) },
    { title: "3.3. Funded Projects", fields: SECTION_FIELDS.filter(f => ['sg3_projects', 'sg3_project_worth'].includes(f.key)) },
    { title: "3.4. Quality of Internships", fields: SECTION_FIELDS.filter(f => ['sg3_mnc', 'sg3_private'].includes(f.key)) },
    { title: "3.5. Fellowship at NITs, IITs & IISC/Central universities", fields: SECTION_FIELDS.filter(f => f.key === 'sg3_fellowship') }
  ] },
  { id: "sg4", title: "4. CAREER SETTLEMENT", subsections: [
    { title: "4.1. Placement Process", fields: SECTION_FIELDS.filter(f => f.key === 'sg4_placement') },
    { title: "4.2. Salary Level from Placement Cell", fields: SECTION_FIELDS.filter(f => ['sg4_median', 'sg4_salary_1', 'sg4_salary_2', 'sg4_salary_3', 'sg4_salary_4', 'sg4_salary_5', 'sg4_salary_6', 'sg4_salary_7', 'sg4_new_companies'].includes(f.key)) },
    { title: "4.3. Higher Level Placement", fields: SECTION_FIELDS.filter(f => ['sg4_internship_convert', 'sg4_winning_contest', 'sg4_referral_alumni', 'sg4_social_media', 'sg4_foreign_lang_studies'].includes(f.key)) },
    { title: "4.4. Competitive Examinations", fields: SECTION_FIELDS.filter(f => ['sg4_gate', 'sg4_ce_2'].includes(f.key)) },
    { title: "4.5. Higher Education", fields: SECTION_FIELDS.filter(f => ['sg4_higher_ed', 'sg4_foreign_univ', 'sg4_iit', 'sg4_nirf_ranking'].includes(f.key)) },
    { title: "4.6. Entrepreneurship", fields: SECTION_FIELDS.filter(f => f.key === 'sg4_entrepreneurship') },
    { title: "4.7. Foreign & Hindi Languages", fields: SECTION_FIELDS.filter(f => ['sg4_foreign_lang', 'sg4_hindi'].includes(f.key)) },
    { title: "4.8. PG Career Settlement", fields: SECTION_FIELDS.filter(f => ['sg4_pg_placement', 'sg4_research_inst'].includes(f.key)) }
  ] },
  { id: "sg5", title: "5. FACULTY MEMBERS", subsections: [
    { title: "5.1. Strengthening Knowledge", fields: SECTION_FIELDS.filter(f => ['sg5_courses', 'sg5_fdp', 'sg5_resource_persons', 'sg5_ikh_visit', 'sg5_ikh_training', 'sg5_rd', 'sg5_fellowship'].includes(f.key)) },
    { title: "5.2. Training Programmes Organized", fields: SECTION_FIELDS.filter(f => ['sg5_training_fund', 'sg5_training_self', 'sg5_webinars'].includes(f.key)) },
    { title: "5.3. Teaching Learning Process", fields: SECTION_FIELDS.filter(f => ['sg5_econtent', 'sg5_tlp', 'sg5_vac', 'sg5_memberships', 'sg5_school_training'].includes(f.key)) },
    { title: "5.4. R&D Activities", fields: SECTION_FIELDS.filter(f => ['sg5_phd', 'sg5_phd_supervisor', 'sg5_phd_pursuing', 'sg5_sci', 'sg5_books', 'sg5_scholars', 'sg5_trl_high', 'sg5_trl_mid', 'sg5_trl_low', 'sg5_patent_revenue', 'sg5_consultancy', 'sg5_consultancy_worth', 'sg5_project_proposal', 'sg5_project_worth', 'sg5_seed_money', 'sg5_lab', 'sg5_mou', 'sg5_mou_signed', 'sg5_mou_activities'].includes(f.key)) }
  ] },
  { id: "sg6", title: "6. OUTREACH PROGRAMMES", subsections: [
    { title: "6.1. Delivering expert lecture and acting as session chair/judges/speaker", fields: SECTION_FIELDS.filter(f => ['sg6_international_event', 'sg6_national_lecture', 'sg6_international_colab', 'sg6_institutional_collab', 'sg6_awards', 'sg6_foreign_visit', 'sg6_social_activities', 'sg6_industry_training'].includes(f.key)) }
  ] },
  // { id: "sg7", title: "7. EXTENSION ACTIVITIES", subsections: [
  //   { title: "7.1. Alumni Association", fields: SECTION_FIELDS.filter(f => ['sg7_alumni_meets', 'sg7_fund_raising'].includes(f.key)) },
  //   { title: "7.2. Activities & Achievements", fields: SECTION_FIELDS.filter(f => ['sg7_extracurricular', 'sg7_cocurricular', 'sg7_extracurricular_achieve', 'sg7_cocurricular_achieve'].includes(f.key)) },
  //   { title: "7.3. Values & National Events", fields: SECTION_FIELDS.filter(f => ['sg7_universal_values', 'sg7_national_festivals'].includes(f.key)) },
  //   { title: "7.4. Sports", fields: SECTION_FIELDS.filter(f => ['sg7_sports_events', 'sg7_medals'].includes(f.key)) }
  // ] },
  // { id: "sg8", title: "8. INSTITUTIONAL RECOGNITION", subsections: [
  //   { title: "8.1. Recognition Parameters", fields: SECTION_FIELDS.filter(f => f.key.startsWith('sg8_')) }
  // ] },
];

function CustomDropdown({ value, onChange, ratings, disabled }) {
  const [open, setOpen] = useState(false);
  const btnRef = React.useRef(null);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current && 
        !btnRef.current.contains(e.target) && 
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
    
  return (
    <div className="relative w-full">
      <button
        ref={btnRef}
        onClick={() => !disabled && setOpen(!open)}
        className="w-full px-4 py-3 border border-gray-300 rounded bg-white text-base text-gray-700 flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <span className="text-base font-medium">{value?.label || "Select Rating"}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-sm transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !disabled && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {ratings.map((opt) => (
            <div
              key={opt.label}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-5 py-3 cursor-pointer text-base font-medium ${
                value?.label === opt.label
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldRow({ field, data, setData, disabled }) {
  const row = data[field.key] || {
    target: "",
    achievement: "",
    rating: field.disableRating ? { label: "Not Applicable", score: 0 } : null,
    score: field.disableRating ? "0" : "",
    evidence: "",
  };

  const update = (key, val) => {
    setData((prev) => {
      const currentRow = prev[field.key] || {
        target: "",
        achievement: "",
        rating: null,
        score: "",
        evidence: "",
      };
      return {
        ...prev,
        [field.key]: { ...currentRow, [key]: val },
      };
    });
  };

  const handleRatingChange = (selectedRating) => {
    if (disabled || field.disableRating) return;
    setData((prev) => {
      const currentRow = prev[field.key] || {
        target: "",
        achievement: "",
        rating: null,
        score: "",
        evidence: "",
      };
      return {
        ...prev,
        [field.key]: {
          ...currentRow,
          rating: selectedRating,
          score: selectedRating.score.toString(),
        },
      };
    });
  };

  // Prevent scroll from changing number input values
  const handleWheel = (e) => {
    e.currentTarget.blur();
  };

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50 items-center">
      <span className="text-base text-gray-800 font-medium">{field.name}</span>
      <input
        type="number"
        placeholder="Target"
        value={row.target}
        onChange={(e) => update("target", e.target.value)}
        onWheel={handleWheel}
        disabled={disabled}
        className="px-4 py-3 border border-gray-300 rounded bg-white text-base"
      />
      <input
        type="number"
        placeholder="Achievement"
        value={row.achievement}
        onChange={(e) => update("achievement", e.target.value)}
        onWheel={handleWheel}
        disabled={disabled}
        className="px-4 py-3 border border-gray-300 rounded bg-white text-base"
      />
      <div className="overflow-visible">
        <CustomDropdown value={row.rating} onChange={handleRatingChange} ratings={field.ratings} disabled={disabled || field.disableRating} />
      </div>
      <input
        type="number"
        placeholder="Score"
        value={row.score}
        readOnly
        disabled={disabled}
        className="px-4 py-3 border border-gray-300 rounded bg-gray-50 text-base"
      />
      <input
        type="text"
        placeholder="Evidence (max 350)"
        maxLength={350}
        value={row.evidence}
        onChange={(e) => update("evidence", e.target.value)}
        disabled={disabled}
        className="px-4 py-3 border border-gray-300 rounded bg-white text-base"
      />
    </div>
  );
}

const Section = React.forwardRef(({ section, data, setData, expanded, onToggle, disabled }, ref) => {
  return (
    <div ref={ref} className="mb-6 border border-gray-300 rounded-lg overflow-visible shadow-sm bg-white">
      <button
        onClick={onToggle}
        className="w-full bg-blue-100 text-gray-800 px-8 py-5 flex justify-between items-center hover:bg-blue-150 font-bold text-lg text-left transition"
      >
        <span>{section.title}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-lg transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="px-6 py-4 bg-gray-50">
          {section.subsections.map((subsection, idx) => (
            <div key={idx} className="mb-6">
              <h4 className="font-bold text-base text-gray-900 mb-3 border-b border-gray-300 pb-2">
                {subsection.title}
              </h4>
              {subsection.fields.map((field) => (
                <FieldRow key={field.key} field={field} data={data} setData={setData} disabled={disabled} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

Section.displayName = "Section";

