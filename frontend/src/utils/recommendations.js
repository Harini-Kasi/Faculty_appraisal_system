/**
 * Recommendations Mapping Engine for Faculty Performance Appraisal System
 * Maps appraisal questions and scores to specific, actionable recommendations.
 */

const RECOMMENDATION_MAP = [
  {
    keywords: ["industry visit"],
    title: "Industry Visit",
    recommendations: {
      low: [
        "Participate in at least one relevant industry visit or industry interaction during the next appraisal period.",
        "Coordinate with the department to identify relevant companies for industry visits/interactions.",
        "Maintain evidence such as visit reports, participation certificates, or industry interaction records.",
      ],
      moderate: [
        "Increase participation in industry visits and seek opportunities for deeper interaction with industry professionals.",
      ],
      high: [
        "Continue industry engagement and explore opportunities for industry-academic collaboration, internships, projects, or knowledge-sharing activities.",
      ],
    },
  },
  {
    keywords: ["r&d", "reputed institution", "research laboratory"],
    title: "Visit to R&D Organization / Reputed Institution",
    recommendations: {
      low: [
        "Plan a visit to an R&D organization, research laboratory, or reputed academic institution.",
        "Participate in research-oriented workshops, seminars, or institutional interactions.",
        "Document the interaction and identify potential research/collaboration opportunities.",
      ],
      moderate: [
        "Increase engagement with R&D organizations through institutional visits, workshops, seminars, or research interactions.",
      ],
      high: [
        "Continue research-institution engagement and explore collaborative research, consultancy, or knowledge-sharing opportunities.",
      ],
    },
  },
  {
    keywords: ["fdp", "faculty development"],
    title: "Attending FDP programme",
    recommendations: {
      low: [
        "Enroll and participate in at least one 5-day or 10-day FDP/STTP program in your core domain during the next cycle.",
        "Focus on emerging technologies, modern pedagogy, or research methodologies relevant to your courses.",
        "Submit participation certificates and a brief report upon completion.",
      ],
      moderate: [
        "Participate in advanced or national-level FDPs to stay updated with current industry and academic standards.",
      ],
      high: [
        "Continue attending high-impact FDPs and consider organizing or delivering resource sessions in departmental FDPs.",
      ],
    },
  },
  {
    keywords: ["online course", "nptel", "coursera", "mooc", "swayam"],
    title: "Online Courses",
    recommendations: {
      low: [
        "Complete at least one certified online course (e.g., NPTEL, Coursera, Swayam) relevant to your subject area.",
        "Plan course registration early in the semester and complete all weekly assignments on schedule.",
        "Submit course completion certificate with final score/grade as evidence.",
      ],
      moderate: [
        "Complete additional advanced or multi-week certification courses to broaden domain expertise.",
      ],
      high: [
        "Maintain certification momentum in cutting-edge topics and guide students to enroll in relevant online courses.",
      ],
    },
  },
  {
    keywords: ["journal publication", "scopus", "sci", "peer reviewed"],
    title: "Journal Publications",
    recommendations: {
      low: [
        "Target writing and submitting at least one research paper to a Scopus/SCI indexed journal.",
        "Collaborate with senior faculty or research scholars to refine manuscript methodology and literature review.",
        "Maintain submission proof, review correspondence, and acceptance letters.",
      ],
      moderate: [
        "Aim to publish in higher-impact factor journals and increase publication frequency.",
      ],
      high: [
        "Maintain strong publication output in high-tier journals and mentor junior colleagues in manuscript writing.",
      ],
    },
  },
  {
    keywords: ["conference", "paper presented"],
    title: "Conference Papers",
    recommendations: {
      low: [
        "Prepare and present at least one research paper in a reputed national or international conference.",
        "Utilize conference reviewer feedback to expand the paper into a full journal manuscript.",
        "Preserve conference presentation certificates and published proceedings copy.",
      ],
      moderate: [
        "Target IEEE, Springer, or Scopus-indexed conferences for better research visibility.",
      ],
      high: [
        "Continue regular conference presentations and explore roles as session chair, keynote speaker, or track chair.",
      ],
    },
  },
  {
    keywords: ["book", "chapter"],
    title: "Book Chapters / Books Authored",
    recommendations: {
      low: [
        "Contribute a book chapter to an edited volume published by a recognized academic publisher.",
        "Identify open calls for chapters in your domain of specialization.",
        "Keep publication agreement and published chapter copy as supporting evidence.",
      ],
      moderate: [
        "Work towards authoring or co-authoring a full textbook, reference book, or monograph.",
      ],
      high: [
        "Continue publishing textbooks or chapters with reputed global academic publishers.",
      ],
    },
  },
  {
    keywords: ["student feedback", "feedback score"],
    title: "Student Feedback Score",
    recommendations: {
      low: [
        "Analyze student feedback to identify specific teaching area improvements (clarity, pace, interaction).",
        "Adopt interactive teaching techniques, regular doubt-clearing sessions, and active learning strategies.",
        "Seek peer guidance or teaching mentoring to enhance classroom engagement.",
      ],
      moderate: [
        "Collect informal mid-term feedback from students to address learning gaps proactively.",
      ],
      high: [
        "Sustain excellent feedback scores by continuing innovative pedagogy and student-centric mentoring.",
      ],
    },
  },
  {
    keywords: ["ict", "tools in teaching", "digital learning"],
    title: "Use of ICT Tools in Teaching",
    recommendations: {
      low: [
        "Integrate modern ICT tools (e.g., LMS, Google Classroom, simulation software, interactive quizzes) into course delivery.",
        "Attend workshops on digital teaching tools and blended learning methods.",
        "Maintain evidence of digital course content, online quizzes, or presentation slides.",
      ],
      moderate: [
        "Expand ICT usage to include virtual labs, flipped classroom models, or multimedia modules.",
      ],
      high: [
        "Share innovative ICT teaching practices with department peers and develop open educational resources.",
      ],
    },
  },
  {
    keywords: ["syllabus", "completion of syllabus"],
    title: "Timely Completion of Syllabus",
    recommendations: {
      low: [
        "Prepare a detailed lesson plan at the start of the semester and strictly adhere to lecture schedules.",
        "Conduct extra classes if needed to compensate for missed lectures or holidays.",
        "Maintain course logbook and weekly syllabus coverage records.",
      ],
      moderate: [
        "Optimize lecture pacing to allow dedicated time for revision and problem-solving sessions.",
      ],
      high: [
        "Maintain timely syllabus completion while integrating real-world case studies and tutorial sessions.",
      ],
    },
  },
  {
    keywords: ["committee", "institutional committees"],
    title: "Membership in Institutional Committees",
    recommendations: {
      low: [
        "Take active membership and responsibilities in at least 1-2 institutional or departmental committees.",
        "Actively contribute to committee meetings, documentation, and event execution.",
        "Keep appointment orders and activity reports as evidence.",
      ],
      moderate: [
        "Take initiative in key administrative responsibilities or chair sub-committees.",
      ],
      high: [
        "Continue leadership in institutional committees and drive strategic departmental/college initiatives.",
      ],
    },
  },
  {
    keywords: ["organizing", "departmental events", "event participation"],
    title: "Organizing Departmental Events",
    recommendations: {
      low: [
        "Coordinate or co-organize at least one workshop, seminar, guest lecture, or technical competition.",
        "Prepare proposal, budget, event schedule, and post-event summary report.",
        "Maintain event photos, attendance sheets, and participant feedback.",
      ],
      moderate: [
        "Take lead responsibility in organizing national-level seminars, workshops, or faculty development programs.",
      ],
      high: [
        "Lead major international conferences, symposiums, or flagship departmental events.",
      ],
    },
  },
  {
    keywords: ["mentoring", "mentor", "scholars", "junior faculty"],
    title: "Mentoring & Guidance",
    recommendations: {
      low: [
        "Engage in active mentoring of allotted students or junior faculty members with regular review meetings.",
        "Maintain mentor-mentee records, attendance tracking, and guidance logs.",
        "Assist mentees in academic performance improvement, career guidance, and project work.",
      ],
      moderate: [
        "Enhance mentoring frequency and track mentee progress systematically across semesters.",
      ],
      high: [
        "Provide exemplary mentorship leading to student publications, national awards, or junior faculty career progression.",
      ],
    },
  },
];

const DEFAULT_RECOMMENDATIONS = {
  low: [
    "Review performance criteria for this question and develop a targeted improvement plan.",
    "Seek guidance from department head or senior peers to address performance gaps.",
    "Maintain complete documentation and evidence of progress for the next appraisal cycle.",
  ],
  moderate: [
    "Strengthen performance in this criterion to achieve higher appraisal ratings.",
    "Seek opportunities to expand contributions and evidence in this area.",
  ],
  high: [
    "Maintain high standards of performance and share best practices with department peers.",
    "Explore leadership or mentoring opportunities related to this criterion.",
  ],
};

/**
 * Get question-specific recommendations based on score
 * @param {string} questionText - Title or text of the appraisal question
 * @param {number} score - Score value (e.g. 0 to 5)
 * @returns {string[]} Array of actionable recommendations
 */
export function getRecommendationsForQuestion(questionText = "", score = 0) {
  const numScore = Number(score);
  const textLower = String(questionText).toLowerCase();

  const categoryKey = numScore < 3 ? "low" : numScore === 3 ? "moderate" : "high";

  const matched = RECOMMENDATION_MAP.find((item) =>
    item.keywords.some((kw) => textLower.includes(kw))
  );

  if (matched && matched.recommendations[categoryKey]) {
    return matched.recommendations[categoryKey];
  }

  return DEFAULT_RECOMMENDATIONS[categoryKey];
}
