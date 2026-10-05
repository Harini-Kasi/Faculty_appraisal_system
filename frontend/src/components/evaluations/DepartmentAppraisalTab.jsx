import React, { useState, useEffect } from "react";
import { ChevronDown, Save, Send, Award, CheckCircle } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";

const DIVISION_SCORES = {
  CSE: 445,
  IT: 430,
  ECE: 450,
  EEE: 445,
  MECH: 430,
  CIVIL: 425,
  AIDS: 415,
  SH: 270,
  "S&H": 270,
};

const SECTION_FIELDS = [
  // SG1 - ADMISSION
  // { name: "Strength", 
  //   key: "sg1_strength", 
  //   ratings: [
  //     { label: "98% - 100%", score: 5 }, 
  //     { label: "96% - 98%", score: 4 }, 
  //     { label: "94% - 96%", score: 3 }, 
  //     { label: "92% - 94%", score: 2 }, 
  //     { label: "90% - 92%", score: 1 },
  //     { label: "Not Applicable", score: 0 } ], 
  //   wf: 1 },
  { name: "Round 1", 
    key: "sg1_ug_round1", 
    ratings: [ 
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Round 2", 
    key: "sg1_ug_round2", 
    ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Round 3", 
    key: "sg1_ug_round3", 
    disableRating: true,
    ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Average Cutoff (Counseling)", 
    key: "sg1_cutoff_counseling", 
    ratings: [
      { label: "98% - 100%", score: 5 }, 
      { label: "96% - 98%", score: 4 }, 
      { label: "94% - 96%", score: 3 }, 
      { label: "92% - 94%", score: 2 }, 
      { label: "90% - 92%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Average Cutoff (Total Strength)", 
    key: "sg1_cutoff_total", 
    ratings: [
      { label: "98% - 100%", score: 5 }, 
      { label: "96% - 98%", score: 4 }, 
      { label: "94% - 96%", score: 3 }, 
      { label: "92% - 94%", score: 2 }, 
      { label: "90% - 92%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "PG Admission", 
    key: "sg1_pg", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "KVP Educational District", 
    key: "sg1_kvp", ratings: [
      { label: "95% - 100%", score: 5 }, 
      { label: "90% - 95%", score: 4 }, 
      { label: "85% - 90%", score: 3 }, 
      { label: "80% - 85%", score: 2 }, 
      { label: "75% - 80%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Districts Around KVP", 
    key: "sg1_around_kvp", ratings: [
      { label: "95% - 100%", score: 5 }, 
      { label: "90% - 95%", score: 4 }, 
      { label: "85% - 90%", score: 3 }, 
      { label: "80% - 85%", score: 2 }, 
      { label: "75% - 80%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Male Students", 
    key: "sg1_male", ratings: [
      { label: "95% - 100%", score: 5 }, 
      { label: "90% - 95%", score: 4 }, 
      { label: "85% - 90%", score: 3 }, 
      { label: "80% - 85%", score: 2 }, 
      { label: "75% - 80%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Female Students", 
    key: "sg1_female", ratings: [
      { label: "95% - 100%", score: 5 }, 
      { label: "90% - 95%", score: 4 }, 
      { label: "85% - 90%", score: 3 }, 
      { label: "80% - 85%", score: 2 }, 
      { label: "75% - 80%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  
  // SG2 - ACADEMIC ACHIEVEMENTS
  { name: "Without Backlog I Year", 
    key: "sg2_wo_backlog_i", 
    ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Without Backlog II Year", 
    key: "sg2_wo_backlog_ii", 
    ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Without Backlog III Year", 
    key: "sg2_wo_backlog_iii", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Without Backlog IV Year", 
    key: "sg2_wo_backlog_iv", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "With Backlog I Year", 
    key: "sg2_with_backlog_i", ratings: [
      { label: "95% - 100%", score: 5 }, 
      { label: "90% - 95%", score: 4 }, 
      { label: "85% - 90%", score: 3 }, 
      { label: "80% - 85%", score: 2 }, 
      { label: "75% - 80%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "With Backlog II Year", 
    key: "sg2_with_backlog_ii", ratings: [
      { label: "95% - 100%", score: 5 }, 
      { label: "90% - 95%", score: 4 }, 
      { label: "85% - 90%", score: 3 }, 
      { label: "80% - 85%", score: 2 }, 
      { label: "75% - 80%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "With Backlog III Year", 
    key: "sg2_with_backlog_iii", ratings: [
      { label: "95% - 100%", score: 5 }, 
      { label: "90% - 95%", score: 4 }, 
      { label: "85% - 90%", score: 3 }, 
      { label: "80% - 85%", score: 2 }, 
      { label: "75% - 80%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "With Backlog IV Year", 
    key: "sg2_with_backlog_iv", ratings: [
      { label: "100%", score: 5 }, 
      { label: "95% - 100%", score: 4 }, 
      { label: "90% - 95%", score: 3 },
      { label: "85% - 90%", score: 2 }, 
      { label: "Below 85%", score: 1 },
      { label: "Not Applicable", score: 0 } ],
    wf: 1 }, 
  { name: "CGPA - above 8.5", 
    key: "sg2_cgpa_1", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "CGPA 7.5 - 8.5", 
    key: "sg2_cgpa_2", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "CGPA 6.5 - 7.5", 
    key: "sg2_cgpa_3", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  
  // SG3 - STUDENTS POTENTIAL TRANSFORMATION
  { name: "Students Participation", 
    key: "sg3_participation", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Students Achievements", 
    key: "sg3_achievement", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Participation in other states/countries (Online mode)", 
    key: "sg3_online", ratings: [
     { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Participation in other states/other countries (Physical mode)", 
    key: "sg3_physical", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Technical contests like Hackathons/Ideathons", 
    key: "sg3_hackathon", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Achievements in contests like Hackathons", 
    key: "sg3_hackathon_achieve", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "SCI Indexed Journal (in Nos.)", 
    key: "sg3_sci", ratings: [
      { label: "1 No.", score: 5 },
      { label: "Not Applicable", score: 0 }, ], 
    wf: 1 },
  { name: "Scopus indexed publications / Patent Filing thro' product development (in Nos.)", 
    key: "sg3_scopus", ratings: [ 
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Journals, magazines, newsletters etc. published by the department (in Nos.)", 
    key: "sg3_journals", ratings: [
      { label: "3 Nos. & above", score: 5 }, 
      { label: "2 Nos.", score: 3 }, 
      { label: "1 No.", score: 1 },
      { label: "Not Applicable", score: 0 }, ], 
    wf: 1 },
  { name: "No. of projects (in %)", 
    key: "sg3_projects", ratings: [
      { label: "3 Nos.", score: 5 }, 
      { label: "2 Nos.", score: 3 }, 
      { label: "1 No.", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Worth of projects (5L internal + 5L external) (in Lakhs)", 
    key: "sg3_project_worth", ratings: [
      { label: "8L - 10L", score: 5 }, 
      { label: "6L - 8L", score: 4 }, 
      { label: "4L - 6L", score: 3 }, 
      { label: "2L - 4L", score: 2 }, 
      { label: "Less than 2L", score: 1 },
      { label: "Not Applicable", score: 0 } ],
    wf: 1 },
  { name: "Public sector undertakings & MNCs", 
    key: "sg3_mnc", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ],  
    wf: 1 },
  { name: "Other Private Industries", 
    key: "sg3_private", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Fellowship at NITs, IITs & IISC/Central universities & research institution",
    key: "sg3_fellowship", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 } ],
    wf: 1 },

  // SG4 - CAREER SETTLEMENT
  { name: "Through Placement Cell", 
    key: "sg4_placement", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 } ], 
    wf: 1 },
  { name: "Median Salary (in Lakhs)", 
    key: "sg4_median", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }],
    wf: 1 },
  { name: "Above 20 Lakhs (SD)", 
    key: "sg4_salary_1", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 },
      { label: "30%", score: 1 },
      { label: "Not Applicable", score: 0 } ], 
    wf: 1 },
  { name: "15-20 Lakhs (D1)", 
    key: "sg4_salary_2", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 },
      { label: "30%", score: 1 },
      { label: "Not Applicable", score: 0 } ], 
    wf: 1 },
  { name: "10-15 Lakhs (D2)", 
    key: "sg4_salary_3", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 },
      { label: "30%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "7-10 Lakhs", 
    key: "sg4_salary_4", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "5-7 Lakhs", 
    key: "sg4_salary_5", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "3.6-5 Lakhs", 
    key: "sg4_salary_6", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Below 3.6 Lakhs", 
    key: "sg4_salary_7", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Bring New Companies offering high salary packages", 
    key: "sg4_new_companies", ratings: [
     { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Conversion from Internships", 
    key: "sg4_internship_convert", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 } ],
    wf: 1 },
  { name: "Winning Contest/Hackathon", 
    key: "sg4_winning_contest", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Referral process through Alumni (in Nos.)", 
    key: "sg4_referral_alumni", ratings: [
      { label: "1 & Above", score: 5 }, 
      { label: "Not Applicable", score: 0 } ],
    wf: 1 },
  { name: "Showcasing through Social media (in Nos.)", 
    key: "sg4_social_media", ratings: [
      { label: "1 & Above", score: 5 }, 
      { label: "Not Applicable", score: 0 } ],
    wf: 1 },
  { name: "Through Foreign Languages studies", 
    key: "sg4_foreign_lang_studies", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 },
      { label: "Not Applicable", score: 0 } ],
    wf: 1 },
  { name: "GATE Exam (Only III year Students) obtain 30 score", 
    key: "sg4_gate", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "TOEFL, GRE, GMAT, IELTS, CAT, MAT etc.", 
    key: "sg4_ce_2", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Higher Education", 
    key: "sg4_higher_ed", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Foreign Universities (IELTS)", 
    key: "sg4_foreign_univ", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "IITs, NITs & IIMs (GATE & CAT)", 
    key: "sg4_iit", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Other institutions with NIRF Ranking up to 200 (Marine)", 
    key: "sg4_nirf_ranking", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Entrepreneurship", 
    key: "sg4_entrepreneurship", ratings: [
       { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }],  
    wf: 1 },
  { name: "Studying Foreign Languages (II & III year - Minimum level Certification)", 
    key: "sg4_foreign_lang", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }],
    wf: 1 },
  { name: "Studying Hindi Languages", 
    key: "sg4_hindi", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }],
    wf: 1 },
  { name: "PG Placement", 
    key: "sg4_pg_placement", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "PG Academic/Research Institution", 
    key: "sg4_research_inst", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  
  // SG5 - FACULTY MEMBERS
  { name: "Online Courses (NPTEL and other MOOC) - All Faculty", 
    key: "sg5_courses", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Attending FDP/STTP programs (Domain Specific only) - All Faculty", 
    key: "sg5_fdp", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Resource Persons in STTPs/FDPs", 
    key: "sg5_resource_persons", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "50% - 60%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Industry Know how - Industrial Visit (Asso. Prof. & Prof.)", 
    key: "sg5_ikh_visit", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Industry Know how - Industrial Training (AP with >2 yrs exp, AP(SG))", 
    key: "sg5_ikh_training", ratings: [
     { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Visit to R&D Organization/Reputed Institution (AP(SG), Asso. Prof., Prof.)", 
    key: "sg5_rd", ratings: [
     { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Fellowship (AP(SG), AP pursuing PhD, AP with PhD)", 
    key: "sg5_fellowship", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Training programs - With funding (FDP/STTP) (in Nos.)", 
    key: "sg5_training_fund", ratings: [
      { label: "1 No.", score: 5 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Training programs - Self supporting (in Nos.)", 
    key: "sg5_training_self", ratings: [
      { label: "1 No.", score: 5 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "International Webinars (Resource Person should be Foreigner) (in Nos.)", 
    key: "sg5_webinars", ratings: [
      { label: "1 No.", score: 5 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  
  // TEACHING LEARNING PROCESS
  { name: "E-Content development", 
    key: "sg5_econtent", ratings: [
      { label: "90% - 100%", score: 5 }, 
      { label: "80% - 90%", score: 4 }, 
      { label: "70% - 80%", score: 3 }, 
      { label: "60% - 70%", score: 2 }, 
      { label: "Less than 60%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ], 
    wf: 1 },
  { name: "Innovative TLP",
    key: "sg5_tlp", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }
    ],  
    wf: 1 },
  { name: "Value Added Courses", 
    key: "sg5_vac", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Memberships in Profession Societies at National/International Levels", 
    key: "sg5_memberships", ratings: [
      { label: "95% - 100%", score: 5 }, 
      { label: "90% - 95%", score: 4 }, 
      { label: "85% - 90%", score: 3 }, 
      { label: "80% - 85%", score: 2 }, 
      { label: "75% - 80%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Organizing school training programs", 
    key: "sg5_school_training", ratings: [
      { label: "100%", score: 5 }, 
      { label: "75%", score: 3 }, 
      { label: "50%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  
  // RESEARCH & DEVELOPMENT
  { name: "PhD holders", 
    key: "sg5_phd", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Supervisorship (All Ph.D. Holders)", 
    key: "sg5_phd_supervisor", ratings: [
      { label: "100%", score: 5 } ,
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "PhD Pursuing", 
    key: "sg5_phd_pursuing", ratings: [
      { label: "95% - 100%", score: 5 }, 
      { label: "90% - 95%", score: 4 }, 
      { label: "85% - 90%", score: 3 }, 
      { label: "80% - 85%", score: 2 }, 
      { label: "75% - 80%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Publications in SCI journals", 
    key: "sg5_sci", ratings: [
     { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Books/Book chapter authored (Scopus Indexed)", 
    key: "sg5_books", ratings: [
      { label: "100%", score: 5 }, 
      { label: "75%", score: 3 }, 
      { label: "50%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "No. of full time scholars (New Registration)", 
    key: "sg5_scholars", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Faculty Support - TRL8-TRL9 (All Prof. & Asso.Prof)", 
    key: "sg5_trl_high", ratings: [
     { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Faculty Support - TRL4-TRL7 (All AP(SG) and APs with PhDs)", 
    key: "sg5_trl_mid", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Faculty Support - TRL1-TRL4 (All APs)", 
    key: "sg5_trl_low", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Revenue generated from Granted Patents (in Lakhs)", 
    key: "sg5_patent_revenue", ratings: [
      { label: "1L+", score: 5 }, 
      { label: "0.8L-1L", score: 4 }, 
      { label: "0.6L-0.8L", score: 3 }, 
      { label: "0.4L-0.6L", score: 2 }, 
      { label: "Below 0.4L", score: 1 }], 
    wf: 1 },
  { name: "Consultancy", 
    key: "sg5_consultancy", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Worth of Consultancy (in Lakhs)", 
    key: "sg5_consultancy_worth", ratings: [
      { label: "4L+", score: 5 }, 
      { label: "3L+", score: 4 }, 
      { label: "2L+", score: 3 }, 
      { label: "1L+", score: 2 }, 
      { label: "Below 1L", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "No. of Project Proposals to funding Agency", 
    key: "sg5_project_proposal", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Worth of On-going projects (in Crores)", 
    key: "sg5_project_worth", ratings: [
      { label: "25L+", score: 5 }, 
      { label: "20L - 25L", score: 4 }, 
      { label: "15L - 20L", score: 3 }, 
      { label: "10L - 15L", score: 2 }, 
      { label: "Below 10L", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Institution Seed Money (in Lakhs)", 
    key: "sg5_seed_money", ratings: [
      { label: "2L+", score: 5 }, 
      { label: "1.5L - 2L", score: 4 }, 
      { label: "1L - 1.5L", score: 3 }, 
      { label: "0.5L - 1L", score: 2 }, 
      { label: "Below 0.5L", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "No. of. Special Lab/ Centre of Excellence/research facility/ Technobation centre/Industry collaborated labs (in Nos.)", 
    key: "sg5_lab", ratings: [
      { label: "1 No.", score: 5 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "No. of functional MoUs", 
    key: "sg5_mou", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "MoUs signed in the year", 
    key: "sg5_mou_signed", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "No. of Activities through MoUs", 
    key: "sg5_mou_activities", ratings: [
      { label: "80% - 100%", score: 5 }, 
      { label: "60% - 80%", score: 4 }, 
      { label: "40% - 60%", score: 3 }, 
      { label: "20% - 40%", score: 2 }, 
      { label: "Less than 20%", score: 1 },
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },

  // SG6 - OUTREACH PROGRAMMES
  { name: "International Events held at foreign countries (in Nos.)", 
    key: "sg6_international_event", ratings: [
      { label: "1 No. & above", score: 5 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "National Events", 
    key: "sg6_national_lecture", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "International collaboration (Publication, book, Project submission, etc.) (in Nos.)", 
    key: "sg6_international_colab", ratings: [
      { label: "1 No. & above", score: 5 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Inter-institutional collaboration (Publication, book, Project submission, etc.) (in Nos.)", 
    key: "sg6_institutional_collab", ratings: [
      { label: "1 No. & above", score: 5 }, 
      { label: "Not Applicable", score: 0 }],   
    wf: 1 },
  { name: "Awards/Recognitions received on research, innovations, and outstanding performance (in Nos.)", 
    key: "sg6_awards", ratings: [
      { label: "1 No. & above", score: 5 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Foreign country visited for collaborative work (in Nos.)", 
    key: "sg6_foreign_visit", ratings: [
      { label: "1 No. & above", score: 5 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Social Related activities",
    key: "sg6_social_activities", ratings: [
      { label: "100%", score: 5 }, 
      { label: "50%", score: 3 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
  { name: "Training to Industry personnel (in Nos.)", 
    key: "sg6_industry_training", ratings: [
      { label: "1 No. & above", score: 5 }, 
      { label: "Not Applicable", score: 0 }], 
    wf: 1 },
];

//   // SG7 - EXTENSION ACTIVITIES
//   { name: "Alumni meets", 
//     key: "sg7_alumni_meets", ratings: [
//       { label: "2+", score: 5 }, 
//       { label: "1", score: 3 }], 
//     wf: 1 },
//   { name: "Fund raising (in Lakhs)", 
//     key: "sg7_fund_raising", ratings: [
//       { label: "10L+", score: 5 }, 
//       { label: "8L-10L", score: 4 }, 
//       { label: "6L-8L", score: 3 }, 
//       { label: "4L-6L", score: 2 }, 
//       { label: "Below 4L", score: 1 }], 
//     wf: 1 },
//   { name: "No. of Activities - Extracurricular Activities", 
//     key: "sg7_extracurricular", ratings: [
//       { label: "10+/club", score: 5 }, 
//       { label: "8-10/club", score: 4 }, 
//       { label: "6-8/club", score: 3 }, 
//       { label: "4-6/club", score: 2 }, 
//       { label: "Below 4/club", score: 1 }], 
//     wf: 1 },
//   { name: "No. of Activities - Co-curricular Activities", 
//     key: "sg7_cocurricular", ratings: [
//       { label: "10+/club", score: 5 }, 
//       { label: "8-10/club", score: 4 }, 
//       { label: "6-8/club", score: 3 }, 
//       { label: "4-6/club", score: 2 }, 
//       { label: "Below 4/club", score: 1 }], 
//     wf: 1 },
//   { name: "Achievements - Extracurricular Activities from govt/recognized bodies", 
//     key: "sg7_extracurricular_achieve", ratings: [
//       { label: "1+/club", score: 5 }, 
//       { label: "1/club", score: 4 }, 
//       { label: "None", score: 2 }], 
//     wf: 1 },
//   { name: "Achievements - Co-curricular Activities from govt/recognized bodies", 
//     key: "sg7_cocurricular_achieve", ratings: [
//       { label: "1+/club", score: 5 }, 
//       { label: "1/club", score: 4 }, 
//       { label: "None", score: 2 }], 
//     wf: 1 },
//   { name: "Activities for promotion of universal values, national values, human values", 
//     key: "sg7_universal_values", ratings: [
//       { label: "2 out of 10+/club", score: 5 }, 
//       { label: "2 out of 10/club", score: 4 }, 
//       { label: "1 out of 10/club", score: 3 }, 
//       { label: "Less than 1", score: 2 }], 
//     wf: 1 },
//   { name: "National festivals and Anniversaries of great Indian personalities", 
//     key: "sg7_national_festivals", ratings: [
//       { label: "3 out of 10+/club", score: 5 }, 
//       { label: "3 out of 10/club", score: 4 }, 
//       { label: "2 out of 10/club", score: 3 }, 
//       { label: "1 out of 10/club", score: 2 }, 
//       { label: "Less than 1", score: 1 }], 
//     wf: 1 },
//   { name: "Sports events organized (District/Zonal/National Level)", 
//     key: "sg7_sports_events", ratings: [
//       { label: "5+/5+/5+", score: 5 }, 
//       { label: "5/5/5", score: 4 }, 
//       { label: "4/4/4", score: 3 }, 
//       { label: "3/3/3", score: 2 }, 
//       { label: "Below 3/3/3", score: 1 }], 
//     wf: 1 },
//   { name: "No. of medals won (District/Zonal/National Level)", 
//     key: "sg7_medals", ratings: [
//       { label: "5+/5+/5+", score: 5 }, 
//       { label: "5/5/5", score: 4 }, 
//       { label: "4/4/4", score: 3 }, 
//       { label: "3/3/3", score: 2 }, 
//       { label: "Below 3/3/3", score: 1 }], 
//     wf: 1 },

//   // SG8 - INSTITUTIONAL RECOGNITION
//   { name: "NIRF Ranking", 
//     key: "sg8_nirf", ratings: [
//       { label: "Within 150", score: 5 }, 
//       { label: "Within 200", score: 4 }, 
//       { label: "Within 250", score: 3 }, 
//       { label: "Within 300", score: 2 }], 
//     wf: 1 },
//   { name: "NIRF-Innovation", 
//     key: "sg8_nirf_innovation", ratings: [
//       { label: "Within 50", score: 5 }, 
//       { label: "Within 100", score: 4 }, 
//       { label: "Within 150", score: 3 }], 
//     wf: 1 },
//   { name: "NBA", 
//     key: "sg8_nba", ratings: [
//       { label: "Full Accreditation", score: 5 }, 
//       { label: "Partial", score: 3 }], 
//     wf: 1 },
//   { name: "NAAC", 
//     key: "sg8_naac", ratings: [
//       { label: "A++", score: 5 }, 
//       { label: "A+", score: 4 }, 
//       { label: "A", score: 3 }], 
//     wf: 1 },
//   { name: "AICTE-CII Survey (Dept. Level)", 
//     key: "sg8_aicte_cii", ratings: [
//       { label: "Platinum", score: 5 }, 
//       { label: "Gold", score: 4 }, 
//       { label: "Silver", score: 3 }], 
//     wf: 1 },
// ];



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



export default function DepartmentAppraisalTab() {
  const { showNotification } = useNotification();
  const { session } = useAuth();

  const deptCode = session?.department || "CSE";
  const [formData, setFormData] = useState({});
  const [specialSkills, setSpecialSkills] = useState("");
  const [expanded, setExpanded] = useState({ sg1: true, sg2: false, sg3: false, sg4: false, sg5: false, sg6: false });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [deptResult, setDeptResult] = useState(null);

  useEffect(() => {
    loadDeptAppraisal();
  }, [session?.department]);

  async function loadDeptAppraisal() {
    setLoading(true);
    try {
      const data = await api.getDepartmentAppraisal(deptCode);
      if (data) {
        setDeptResult(data);
        setIsSubmitted(Boolean(data.isSubmitted));
        if (data.specialSkills) setSpecialSkills(data.specialSkills);
        if (data.formData && typeof data.formData === "object") {
          setFormData(data.formData);
        }
      }
    } catch (err) {
      console.error("Error loading department appraisal:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(secId) {
    setExpanded((prev) => ({ ...prev, [secId]: !prev[secId] }));
  }

  function updateRowField(fieldKey, property, value) {
    setFormData((prev) => {
      const existing = prev[fieldKey] || { target: "", achievement: "", rating: null, score: 0, evidence: "" };
      const updated = { ...existing, [property]: value };
      return { ...prev, [fieldKey]: updated };
    });
  }

  function handleRatingChange(fieldKey, fieldRatings, selectedLabel) {
    const chosenRating = fieldRatings.find((r) => r.label === selectedLabel);
    const scoreVal = chosenRating ? chosenRating.score : 0;

    setFormData((prev) => {
      const existing = prev[fieldKey] || { target: "", achievement: "", rating: null, score: 0, evidence: "" };
      return {
        ...prev,
        [fieldKey]: {
          ...existing,
          rating: chosenRating || null,
          score: scoreVal,
        },
      };
    });
  }

  // Calculate Raw Total & Normalized Final Score
  const rawTotalScore = React.useMemo(() => {
    let sum = 0;
    Object.values(formData).forEach((val) => {
      if (val && val.score) {
        sum += Number(val.score) || 0;
      }
    });
    return sum;
  }, [formData]);

  const maxDivisionScore = DIVISION_SCORES[deptCode] || DIVISION_SCORES[session?.department] || 445;
  const normalizedScore = maxDivisionScore > 0 ? Number(((rawTotalScore / maxDivisionScore) * 100).toFixed(2)) : 0;

  async function handleSave(submitMode = false) {
    setLoading(true);
    try {
      const payload = {
        department: deptCode,
        formData,
        specialSkills,
        facultyInfo: {
          name: session?.name || "HOD",
          dept: deptCode,
          designation: session?.designation || "HOD",
        },
      };

      const res = submitMode
        ? await api.submitDepartmentAppraisal(payload)
        : await api.saveDepartmentAppraisalDraft(payload);

      setDeptResult(res);
      setIsSubmitted(submitMode);
      showNotification(
        submitMode
          ? `Department Appraisal submitted successfully! Score: ${normalizedScore}%`
          : "Department Appraisal saved as draft.",
        "success"
      );
    } catch (err) {
      showNotification(err.message || "Failed to save department appraisal.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="appraisal-tab-content">
      {/* Top Header Card */}
      <div className="card details-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.75, display: "block", marginBottom: "0.35rem" }}>
              NAME
            </label>
            <input
              type="text"
              className="input-styled"
              value={session?.name || "Dr. Gomathi V"}
              readOnly
              style={{ width: "100%", background: "var(--bg-secondary)", fontWeight: "600" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.75, display: "block", marginBottom: "0.35rem" }}>
              DEPARTMENT
            </label>
            <input
              type="text"
              className="input-styled"
              value={deptCode}
              readOnly
              style={{ width: "100%", background: "var(--bg-secondary)", fontWeight: "600" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.75, display: "block", marginBottom: "0.35rem" }}>
              DESIGNATION
            </label>
            <input
              type="text"
              className="input-styled"
              value={session?.designation || "Professor / HOD"}
              readOnly
              style={{ width: "100%", background: "var(--bg-secondary)", fontWeight: "600" }}
            />
          </div>
        </div>
      </div>

      {/* Main Accordion Collapsible Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {SECTIONS.map((section) => {
          const isExp = Boolean(expanded[section.id]);
          return (
            <div
              key={section.id}
              className="card details-card"
              style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-color)", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
            >
              {/* Accordion Header Card Banner (Primary Color #4F46E5) */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                style={{
                  width: "100%",
                  padding: "0.95rem 1.35rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
                  border: "none",
                  cursor: "pointer",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "1.05rem",
                  textAlign: "left",
                  boxShadow: "0 3px 12px rgba(79, 70, 229, 0.22)",
                }}
              >
                <span style={{ color: "#ffffff", letterSpacing: "0.01em" }}>{section.title}</span>
                <ChevronDown
                  size={20}
                  style={{
                    color: "#ffffff",
                    transition: "transform 0.2s ease",
                    transform: isExp ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Accordion Body */}
              {isExp && (
                <div style={{ padding: "1.35rem", background: "var(--bg-card)" }}>
                  {section.subsections.map((subsection, sIdx) => (
                    <div key={sIdx} style={{ marginBottom: "1.75rem" }}>
                      <h4
                        style={{
                          margin: "0 0 0.85rem 0",
                          paddingBottom: "0.45rem",
                          borderBottom: "2px solid #E0E7FF",
                          fontWeight: "700",
                          fontSize: "0.98rem",
                          color: "#4F46E5",
                        }}
                      >
                        {subsection.title}
                      </h4>

                      {/* Header Row Labels (Hidden if subsection has no fields, e.g. 1. Strength) */}
                      {subsection.fields.length > 0 && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2.5fr 1fr 1fr 1.5fr 0.8fr 2fr",
                            gap: "0.75rem",
                            alignItems: "center",
                            padding: "0.6rem 0.85rem",
                            background: "#EEF2FF",
                            border: "1px solid #C7D2FE",
                            borderRadius: "8px",
                            marginBottom: "0.6rem",
                            fontSize: "0.78rem",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            color: "#3730A3",
                            letterSpacing: "0.03em",
                          }}
                        >
                          <div>Criterion / Item</div>
                          <div>Target</div>
                          <div>Achievement</div>
                          <div>Rating</div>
                          <div>Score</div>
                          <div>Evidence</div>
                        </div>
                      )}

                      {/* Item Field Rows */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {subsection.fields.map((field) => {
                          const row = formData[field.key] || { target: "", achievement: "", rating: null, score: 0, evidence: "" };
                          return (
                            <div
                              key={field.key}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "2.5fr 1fr 1fr 1.5fr 0.8fr 2fr",
                                gap: "0.75rem",
                                alignItems: "center",
                                padding: "0.5rem 0.75rem",
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "8px",
                              }}
                            >
                              <div style={{ fontWeight: "600", fontSize: "0.85rem" }}>{field.name}</div>

                              {/* Target */}
                              <input
                                type="number"
                                className="input-styled"
                                placeholder="Target"
                                value={row.target || ""}
                                disabled={isSubmitted}
                                onChange={(e) => updateRowField(field.key, "target", e.target.value)}
                                style={{ width: "100%", padding: "0.4rem 0.6rem" }}
                              />

                              {/* Achievement */}
                              <input
                                type="number"
                                className="input-styled"
                                placeholder="Achievement"
                                value={row.achievement || ""}
                                disabled={isSubmitted}
                                onChange={(e) => updateRowField(field.key, "achievement", e.target.value)}
                                style={{ width: "100%", padding: "0.4rem 0.6rem" }}
                              />

                              {/* Rating Select */}
                              <select
                                className="input-styled"
                                value={row.rating?.label || ""}
                                disabled={isSubmitted || field.disableRating}
                                onChange={(e) => handleRatingChange(field.key, field.ratings, e.target.value)}
                                style={{ width: "100%", padding: "0.4rem 0.6rem" }}
                              >
                                <option value="">Select Rating</option>
                                {field.ratings.map((r, rIdx) => (
                                  <option key={rIdx} value={r.label}>
                                    {r.label} ({r.score})
                                  </option>
                                ))}
                              </select>

                              {/* Readonly Score */}
                              <input
                                type="number"
                                className="input-styled"
                                placeholder="Score"
                                value={row.score !== undefined ? row.score : ""}
                                readOnly
                                style={{ width: "100%", padding: "0.4rem 0.6rem", background: "var(--bg-card)", fontWeight: "700", textAlign: "center" }}
                              />

                              {/* Evidence Box - EMPTY BY DEFAULT */}
                              <input
                                type="text"
                                className="input-styled"
                                placeholder="Evidence (max 350)"
                                maxLength={350}
                                value={row.evidence || ""}
                                disabled={isSubmitted}
                                onChange={(e) => updateRowField(field.key, "evidence", e.target.value)}
                                style={{ width: "100%", padding: "0.4rem 0.6rem" }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Special Achievements & Total Score Card */}
      <div
        className="card details-card"
        style={{
          padding: "1.5rem",
          marginBottom: "1.5rem",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem",
        }}
      >
        <div>
          <label style={{ fontWeight: "700", fontSize: "0.95rem", textTransform: "uppercase", marginBottom: "0.5rem", display: "block" }}>
            SPECIAL ACHIEVEMENTS / REWARDS / AWARDS
          </label>
          <textarea
            className="input-styled"
            rows={4}
            maxLength={500}
            placeholder="Please provide details with evidences..."
            value={specialSkills}
            disabled={isSubmitted}
            onChange={(e) => setSpecialSkills(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", opacity: 0.8 }}>
            TOTAL SCORE
          </span>
          <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary-color)", margin: "0.35rem 0" }}>
            {normalizedScore}
          </span>
          <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Raw Score: {rawTotalScore} / Division Max: {maxDivisionScore}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn-outline-pdf"
          onClick={() => handleSave(false)}
          disabled={loading || isSubmitted}
        >
          <Save size={16} /> Save Draft
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => handleSave(true)}
          disabled={loading || isSubmitted}
        >
          <Send size={16} /> Preview & Submit
        </button>
      </div>
    </div>
  );
}
