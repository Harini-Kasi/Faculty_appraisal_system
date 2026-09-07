-- ============================================================
-- Faculty Appraisal Form - Level 3 (Associate Professor with Ph.D.)
-- Generated from: SH_-_Appraisal_Form_-_Level_3.docx
-- ============================================================

DROP TABLE IF EXISTS appraisal_scale_level;
DROP TABLE IF EXISTS appraisal_kpi;
DROP TABLE IF EXISTS appraisal_categories;
DROP TABLE IF EXISTS appraisal_formula;
DROP TABLE IF EXISTS appraisal_sections;
DROP TABLE IF EXISTS appraisal_form;


CREATE TABLE appraisal_form (
    form_id       INTEGER PRIMARY KEY,
    form_name     VARCHAR(255) NOT NULL,
    applicable_to VARCHAR(255)
);

CREATE TABLE appraisal_sections (
    section_id   INTEGER PRIMARY KEY,
    form_id      INTEGER NOT NULL,
    section_code VARCHAR(5)   NOT NULL,   -- A, B, C, D
    section_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (form_id) REFERENCES appraisal_form(form_id)
);

CREATE TABLE appraisal_categories (
    category_id   INTEGER PRIMARY KEY,
    section_id    INTEGER NOT NULL,
    category_code VARCHAR(20)  NOT NULL,  -- e.g. A1, A1.1, B2, ...
    category_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (section_id) REFERENCES appraisal_sections(section_id)
);

CREATE TABLE appraisal_kpi (
    kpi_id            INTEGER PRIMARY KEY,
    section_id        INTEGER NOT NULL,
    category_id       INTEGER,
    kpi_code          VARCHAR(20)  NOT NULL,   -- KPI1, RPI1, HPE1, SF1 ...
    display_label     VARCHAR(50),             -- original label as printed in the doc (e.g. 'H~1~')
    skill_set         TEXT NOT NULL,
    weightage_factor  DECIMAL(5,2) NOT NULL,
    sort_order        INTEGER,
    FOREIGN KEY (section_id)  REFERENCES appraisal_sections(section_id),
    FOREIGN KEY (category_id) REFERENCES appraisal_categories(category_id)
);

CREATE TABLE appraisal_scale_level (
    scale_id     INTEGER PRIMARY KEY,
    kpi_id       INTEGER NOT NULL,
    level_no     SMALLINT NOT NULL,   -- 5 = highest ... 1 = lowest
    level_title  VARCHAR(50) NOT NULL, -- Professional / Proficient / Specialist / Practitioner / Need improvement
    level_rating VARCHAR(50) NOT NULL, -- Excellent / Very Good / Good / Satisfactory / Low
    description  TEXT NOT NULL,
    UNIQUE (kpi_id, level_no),
    FOREIGN KEY (kpi_id) REFERENCES appraisal_kpi(kpi_id)
);

CREATE TABLE appraisal_formula (
    formula_id          INTEGER PRIMARY KEY,
    section_id          INTEGER,           -- NULL for the overall FPI formula
    formula_name        VARCHAR(50)  NOT NULL,
    formula_expression  TEXT NOT NULL,
    notes               TEXT,
    FOREIGN KEY (section_id) REFERENCES appraisal_sections(section_id)
);

-- ---------------- FORM ----------------
INSERT INTO appraisal_form (form_id, form_name, applicable_to) VALUES
(1, 'Level-3: Competency based Appraisal', 'For AP with Ph.D.');

-- ---------------- SECTIONS ----------------
INSERT INTO appraisal_sections (section_id, form_id, section_code, section_name) VALUES
(1,1,'A','Self Appraisal'),
(2,1,'B','Review based Appraisal'),
(3,1,'C','HOD/Principal Evaluation (HPE)'),
(4,1,'D','Other Criteria');

-- ---------------- CATEGORIES (sub-sections) ----------------
INSERT INTO appraisal_categories (category_id, section_id, category_code, category_name) VALUES
(1,1,'A1','SELF DEVELOPMENT'),
(2,1,'A1.1','Knowledge Up gradation'),
(3,1,'A1.2','Skill Development'),
(4,1,'A2','RESEARCH AND DEVELOPMENT'),
(5,1,'A3','ACADEMIC CONTRIBUTION'),
(6,1,'A4','INVOLVEMENT IN INSTITUTION AND DEPARTMENT LEVEL ACTIVITY'),
(7,1,'A5','CONTRIBUTION TOWARDS SELF AND INSTITUTIONAL DISSEMINATION'),
(8,2,'B1','COMPETENCY IN THE COURSES TAUGHT'),
(9,2,'B2','COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS'),
(10,2,'B3','COMPETENCY IN DOMAIN AREA/RESEARCH AREA'),
(11,2,'B4','COMMUNICATION SKILL');

-- ---------------- KPI / RPI / HPE / SF ITEMS ----------------
INSERT INTO appraisal_kpi (kpi_id, section_id, category_id, kpi_code, display_label, skill_set, weightage_factor, sort_order) VALUES
(1,1,2,'KPI1','KPI_1','Strengthening the knowledge through online courses (like NPTEL and other MOOC offered by premier institutions, courses with min. of 8 weeks)',2.0,1),
(2,1,3,'KPI2','KPI_2','Attending FDP/Workshop (minimum 5 days)/Seminar/Conference (minimum 2 days) in physical mode - one per year, relevant to the courses taught',2.0,2),
(3,1,4,'KPI3','KPI_3','No. of publications',2.0,3),
(4,1,4,'KPI4','KPI_4','H-index (Scopus)',1.0,4),
(5,1,4,'KPI5','KPI_5','Worth of on-going research projects including seed money',1.0,5),
(6,1,4,'KPI6','KPI_6','Scholar progress',1.0,6),
(7,1,5,'KPI7','KPI_7','Course file maintenance (based on academic auditing)',2.0,7),
(8,1,5,'KPI8','KPI_8','Innovative teaching methods introduced in the course taught',1.0,8),
(9,1,5,'KPI9','KPI_9','Academic results - average pass % of the course handled (theory-only / integrated course)',1.0,9),
(10,1,5,'KPI10','KPI_10','Developing e-content and learning repository for the course taught',2.0,10),
(11,1,6,'KPI11','KPI_11','Organizing school training programs',1.0,11),
(12,1,6,'KPI12','KPI_12','Training programs organized',1.0,12),
(13,1,6,'KPI13','KPI_13','Contribution towards department and institution (excluding mentorship - mentorship credits are under HOD evaluation)',1.0,13),
(14,1,7,'KPI14','KPI_14','Continuous updation of self growth/achievements and institutional events and highlights in social media',2.0,14),
(15,2,8,'RPI1','RPI_1','Basic and fundamental knowledge in the course taught',1.5,15),
(16,2,8,'RPI2','RPI_2','Preparedness and involvement in practical/integrated/experiential learning courses',1.5,16),
(17,2,8,'RPI3','RPI_3','Capability of informing latest developments during content delivery',1.5,17),
(18,2,8,'RPI4','RPI_4','Capability of solving GATE / Company level questions',1.5,18),
(19,2,9,'RPI5','RPI_5','Usage of appropriate content delivery methods',2.0,19),
(20,2,9,'RPI6','RPI_6','Selection of assessment tools',2.0,20),
(21,2,9,'RPI7','RPI_7','Integrating library in course taught',2.0,21),
(22,2,9,'RPI8','RPI_8','Practiced project/problem based learning skills',2.0,22),
(23,2,10,'RPI9','RPI_9','Reading articles to the level of listing the title, author and research outcomes',2.0,23),
(24,2,10,'RPI10','RPI_10','Progress in the domain area/research area',2.0,24),
(25,2,11,'RPI11','RPI_11','Clarity in delivering the core content as required',2.0,25),
(26,3,NULL,'HPE1','H~1~','Academic achievements',3.0,26),
(27,3,NULL,'HPE2','H~2~','Identification and improving slow learners',3.0,27),
(28,3,NULL,'HPE3','H~3~','Encouraging students to publish journals, magazines, newsletters, etc. by the department',2.0,28),
(29,3,NULL,'HPE4','H~4~','Online courses - NPTEL',2.0,29),
(30,3,NULL,'HPE5','H~5~','Students progress in Skill Rack (75% of the students)',2.0,30),
(31,3,NULL,'HPE6','H~6~','Encouraging the students to participate in technical contests like Hackathons/Ideathons',2.0,31),
(32,3,NULL,'HPE7','H~7~ (Participation)','Students participation in Inter/Intra college events',2.0,32),
(33,3,NULL,'HPE8','H~6~ (Discipline)','Maintaining discipline',1.0,33),
(34,3,NULL,'HPE9','H~7~ (Interpersonal)','Interpersonal relationship',1.0,34),
(35,3,NULL,'HPE10','H~8~','Volunteering',1.0,35),
(36,3,NULL,'HPE11','H~9~','LMS monitoring',1.0,36),
(37,4,NULL,'SF1','E~1~','Student feedback (SF)',20.0,37);

-- ---------------- 5-POINT PERFORMANCE SCALE FOR EACH ITEM ----------------
INSERT INTO appraisal_scale_level (kpi_id, level_no, level_title, level_rating, description) VALUES
(1,5,'Professional','Excellent','5% Topper'),
(1,4,'Proficient','Very Good','Elite Gold'),
(1,3,'Specialist','Good','Elite Silver'),
(1,2,'Practitioner','Satisfactory','Elite / >80% score in Non-proctored MOOC courses'),
(1,1,'Need improvement','Low','NPTEL course completed / 60% to 80% score in Non-proctored MOOC courses'),
(2,5,'Professional','Excellent','At least one at other-state institution under NIRF Ranking / IITs / NITs'),
(2,4,'Proficient','Very Good','At least one at Anna University and other premier institutions'),
(2,3,'Specialist','Good','At least one at Govt / Govt-aided institutions'),
(2,2,'Practitioner','Satisfactory','Undergone one Workshop/Seminar/Conference at autonomous and self-financing institutions'),
(2,1,'Need improvement','Low','Undergone one Online FDP at autonomous and self-financing institutions'),
(3,5,'Professional','Excellent','One Q1 journal, or Two Q2 journals, or Three Q3 journals'),
(3,4,'Proficient','Very Good','One Q2 journal, or Two Q3 journals, or Three Q4 journals'),
(3,3,'Specialist','Good','One Q3 journal'),
(3,2,'Practitioner','Satisfactory','Two Q4 journals'),
(3,1,'Need improvement','Low','One Q4 journal'),
(4,5,'Professional','Excellent','7 and more than 7'),
(4,4,'Proficient','Very Good','6'),
(4,3,'Specialist','Good','5'),
(4,2,'Practitioner','Satisfactory','4'),
(4,1,'Need improvement','Low','3'),
(5,5,'Professional','Excellent','Received funding worth more than 5 Lakhs'),
(5,4,'Proficient','Very Good','Received funding worth 3.01 Lakhs ≤ amount ≤ 5.00 Lakhs'),
(5,3,'Specialist','Good','Received funding worth 1.01 Lakhs ≤ amount ≤ 3.00 Lakhs'),
(5,2,'Practitioner','Satisfactory','Received funding worth 0.51 Lakhs ≤ amount ≤ 1.00 Lakhs'),
(5,1,'Need improvement','Low','Received funding worth 0.25 Lakhs ≤ amount ≤ 0.50 Lakhs'),
(6,5,'Professional','Excellent','Guiding at least 2 full time scholars'),
(6,4,'Proficient','Very Good','Guiding at least 1 full time scholar and 1 part time scholar'),
(6,3,'Specialist','Good','Guiding at least 1 full time scholar'),
(6,2,'Practitioner','Satisfactory','Guiding at least 2 scholars'),
(6,1,'Need improvement','Low','Got supervisorship'),
(7,5,'Professional','Excellent','Outstanding maintenance with timely submission, complete documentation, and incorporation of continuous improvement suggestions from previous audits'),
(7,4,'Proficient','Very Good','Positive comments'),
(7,3,'Specialist','Good','No negative remarks'),
(7,2,'Practitioner','Satisfactory','Some negative remarks'),
(7,1,'Need improvement','Low','Deficiency in documentation'),
(8,5,'Professional','Excellent','Innovative practice is published in Scopus/SCI indexed journal'),
(8,4,'Proficient','Very Good','Innovative practice is disseminated in social media after posting on college website'),
(8,3,'Specialist','Good','Innovative practice approved by HOD, Dean-Academic & Principal and posted on college website'),
(8,2,'Practitioner','Satisfactory','Innovative practice is documented and available in LMS'),
(8,1,'Need improvement','Low','Innovative practice is not properly done'),
(9,5,'Professional','Excellent','95-100%'),
(9,4,'Proficient','Very Good','90-95%'),
(9,3,'Specialist','Good','85-90%'),
(9,2,'Practitioner','Satisfactory','80-85%'),
(9,1,'Need improvement','Low','75-80%'),
(10,5,'Professional','Excellent','100% of video content for any two COs is available in LMS as well as in social media'),
(10,4,'Proficient','Very Good','100% of video content for any one CO and 50% of video content for another CO is available in LMS as well as in social media'),
(10,3,'Specialist','Good','100% of video content for any one CO is available in LMS as well as in social media'),
(10,2,'Practitioner','Satisfactory','75% of video content for any one CO is available in LMS as well as in social media'),
(10,1,'Need improvement','Low','50% of video content for any one CO is available in LMS as well as in social media'),
(11,5,'Professional','Excellent','Coordinator for 1 program'),
(11,4,'Proficient','Very Good','Co-coordinator for 1 program'),
(11,3,'Specialist','Good','Member in 2 programs'),
(11,2,'Practitioner','Satisfactory','Member in 1 program'),
(11,1,'Need improvement','Low','Supporting program committee member'),
(12,5,'Professional','Excellent','Workshops/Seminars/FDP/STTP with funding'),
(12,4,'Proficient','Very Good','Workshops/Seminars/FDP/STTP - self supporting'),
(12,3,'Specialist','Good','Intra college programmes'),
(12,2,'Practitioner','Satisfactory','Intra dept. programmes (one day)'),
(12,1,'Need improvement','Low','Intra dept. programmes (one session)'),
(13,5,'Professional','Excellent','In-charge in both department and institution level'),
(13,4,'Proficient','Very Good','In-charge of college level committee'),
(13,3,'Specialist','Good','Member in college level committee'),
(13,2,'Practitioner','Satisfactory','In-charge in department level'),
(13,1,'Need improvement','Low','Member in department level'),
(14,5,'Professional','Excellent','Number of connections: more than 1200; Number of posts per year: more than 99; Average post responses (comments + likes): more than 2499'),
(14,4,'Proficient','Very Good','Number of connections: 900 to 1199; Number of posts per year: 80 to 99; Average post responses (comments + likes): 2000 to 2499'),
(14,3,'Specialist','Good','Number of connections: 600 to 899; Number of posts per year: 60 to 79; Average post responses (comments + likes): 1500 to 1999'),
(14,2,'Practitioner','Satisfactory','Number of connections: 300 to 599; Number of posts per year: 40 to 59; Average post responses (comments + likes): 1000 to 1499'),
(14,1,'Need improvement','Low','Number of connections: 100 to 299; Number of posts per year: 20 to 39; Average post responses (comments + likes): 500 to 999'),
(15,5,'Professional','Excellent','Capable of clarifying the doubts in the courses effectively'),
(15,4,'Proficient','Very Good','Capable of delivering the courses effectively'),
(15,3,'Specialist','Good','Profound knowledge by gathering support materials'),
(15,2,'Practitioner','Satisfactory','Adequate knowledge by referring the text books'),
(15,1,'Need improvement','Low','Inadequate knowledge - referring only local author books and notes'),
(16,5,'Professional','Excellent','Offering new experiments every year at the level of design of the experiments'),
(16,4,'Proficient','Very Good','Offering the experiments every year at the level of design of the experiments'),
(16,3,'Specialist','Good','Offering conventional experiments with modern tools like virtual lab, simulation, etc.'),
(16,2,'Practitioner','Satisfactory','Conducting the conventional experiments with clarity'),
(16,1,'Need improvement','Low','Assisting in conducting experiments'),
(17,5,'Professional','Excellent','Makes the students read and discuss research articles relevant to COs/POs'),
(17,4,'Proficient','Very Good','Makes the students read and present research articles relevant to COs/POs'),
(17,3,'Specialist','Good','Informing research status relevant to COs/POs'),
(17,2,'Practitioner','Satisfactory','Delivering contents beyond curriculum relevant to COs/POs'),
(17,1,'Need improvement','Low','Delivering only curriculum contents'),
(18,5,'Professional','Excellent','Posts 50+ CO-mapped GATE/company questions in LMS, solves complex problems in every class, assigns weekly challenging assessments, and maintains comprehensive question banks covering all COs with varied difficulty levels'),
(18,4,'Proficient','Very Good','Posts 35-49 CO-mapped GATE/company questions in LMS, solves 2-3 problems per class, assigns regular moderate-level homework, and covers 80%+ COs with proper categorization and solutions'),
(18,3,'Specialist','Good','Posts 25-34 CO-mapped GATE/company questions in LMS, demonstrates problem-solving in 50%+ classes, assigns periodic basic-to-moderate problems, and covers major COs with standard solution approaches'),
(18,2,'Practitioner','Satisfactory','Posts 15-24 CO-mapped GATE/company questions in LMS, occasionally solves problems in class, assigns simple problems as assignments, and covers essential COs with basic explanations'),
(18,1,'Need improvement','Low','Posts 5-14 CO-mapped GATE/company questions in LMS, demonstrates fundamental problem-solving in selected classes, assigns elementary problems occasionally, and covers core COs with simple solutions'),
(19,5,'Professional','Excellent','Innovative content delivery methods declared/presented'),
(19,4,'Proficient','Very Good','Effective use of active and hybrid learning methods'),
(19,3,'Specialist','Good','Conventional methods & appropriate other tools'),
(19,2,'Practitioner','Satisfactory','Conventional methods & quality demonstration'),
(19,1,'Need improvement','Low','Lectures and tutorials (conventional)'),
(20,5,'Professional','Excellent','Innovative assessment methods declared/presented'),
(20,4,'Proficient','Very Good','Conventional methods & uncontrolled tests/open book test'),
(20,3,'Specialist','Good','Conventional methods & appropriate other tools'),
(20,2,'Practitioner','Satisfactory','Conventional methods & quality assignments'),
(20,1,'Need improvement','Low','IAT and tutorials (conventional)'),
(21,5,'Professional','Excellent','Conducted more than one time-bounded quality assessment (assignments, open book test, etc.) utilizing library resources; assessments were given, evaluated, and feedback on library integration was obtained'),
(21,4,'Proficient','Very Good','Conducted one time-bounded quality assessment (assignments, open book test, etc.) utilizing library resources; assessment was given, evaluated, and feedback on library integration was obtained'),
(21,3,'Specialist','Good','Conducted one time-bounded quality assessment (assignments, open book test, etc.) utilizing library resources; assessment was given and evaluated'),
(21,2,'Practitioner','Satisfactory','Conducted instruction sessions in the library using library resources'),
(21,1,'Need improvement','Low','Embedded NEC and Anna University e-library books/references in the NEC LMS course page'),
(22,5,'Professional','Excellent','Conducted and evaluated more than one project/problem based learning activity planned for the course taught; also identified the strengths and weaknesses of the students'),
(22,4,'Proficient','Very Good','Conducted and evaluated at least one project/problem based learning activity planned for the course taught; also identified the strengths and weaknesses of the students'),
(22,3,'Specialist','Good','Conducted and evaluated at least one project/problem based learning activity planned for the course taught'),
(22,2,'Practitioner','Satisfactory','Conducted at least one project/problem based learning activity planned for the course taught'),
(22,1,'Need improvement','Low','Project/problem based learning activities were planned for the course taught and the respective activity was mentioned in the course plan'),
(23,5,'Professional','Excellent','Scopus indexed journals'),
(23,4,'Proficient','Very Good','Indian citation indexed journals'),
(23,3,'Specialist','Good','Newsletters and magazines'),
(23,2,'Practitioner','Satisfactory','S&T sections of newspapers'),
(23,1,'Need improvement','Low','Any other online materials'),
(24,5,'Professional','Excellent','Conducted research to the level of publishing a paper in SCI indexed journals'),
(24,4,'Proficient','Very Good','Applied the knowledge and obtained the expected results'),
(24,3,'Specialist','Good','Capable of applying the knowledge for a problem identified in the area of research'),
(24,2,'Practitioner','Satisfactory','Acquiring knowledge relevant to the area of research'),
(24,1,'Need improvement','Low','Initiating the research work'),
(25,5,'Professional','Excellent','Clear articulation with enthusiasm and confidence'),
(25,4,'Proficient','Very Good','Poised and clear articulation; proper volume and steady rate'),
(25,3,'Specialist','Good','Clear articulation but not as polished'),
(25,2,'Practitioner','Satisfactory','Some mumbling; uneven rate; little or no expression'),
(25,1,'Need improvement','Low','Inaudible or too loud; slow/too fast delivery; uninterested and monotonic'),
(26,5,'Professional','Excellent','Making more than 90% of the students achieve the allotted CGPAs'),
(26,4,'Proficient','Very Good','Making more than 80% of the students achieve the allotted CGPAs'),
(26,3,'Specialist','Good','Making more than 70% of the students achieve the allotted CGPAs'),
(26,2,'Practitioner','Satisfactory','Making more than 60% of the students achieve the allotted CGPAs'),
(26,1,'Need improvement','Low','Making more than 50% of the students achieve the allotted CGPAs'),
(27,5,'Professional','Excellent','Identified the learning capability and disability and improved the performance of all slow learners'),
(27,4,'Proficient','Very Good','Identified the learning capability and disability and improved the performance of 50% of slow learners'),
(27,3,'Specialist','Good','Identified the learning capability and disability and improved the performance of 25% of slow learners'),
(27,2,'Practitioner','Satisfactory','Identified all slow learners and efforts taken'),
(27,1,'Need improvement','Low','Only identified the slow learners'),
(28,5,'Professional','Excellent','Making 50% of the targeted students publish articles'),
(28,4,'Proficient','Very Good','Making 40% of the targeted students publish articles'),
(28,3,'Specialist','Good','Making 30% of the targeted students publish articles'),
(28,2,'Practitioner','Satisfactory','Making 20% of the targeted students publish articles'),
(28,1,'Need improvement','Low','Making 10% of the targeted students publish articles'),
(29,5,'Professional','Excellent','100% participation and 10% Elite Silver'),
(29,4,'Proficient','Very Good','100% participation and 50% Elite'),
(29,3,'Specialist','Good','100% participation and 30% Elite'),
(29,2,'Practitioner','Satisfactory','100% participation and 75% successfully completed'),
(29,1,'Need improvement','Low','100% participation'),
(30,5,'Professional','Excellent','Solved 600 programs'),
(30,4,'Proficient','Very Good','Solved 500 programs'),
(30,3,'Specialist','Good','Solved 400 programs'),
(30,2,'Practitioner','Satisfactory','Solved 300 programs'),
(30,1,'Need improvement','Low','Solved 200 programs'),
(31,5,'Professional','Excellent','Making all the targeted students achieve'),
(31,4,'Proficient','Very Good','Making 80% of the targeted students achieve'),
(31,3,'Specialist','Good','Making 60% of the targeted students achieve'),
(31,2,'Practitioner','Satisfactory','Making 40% of the targeted students achieve'),
(31,1,'Need improvement','Low','Making 20% of the targeted students achieve'),
(32,5,'Professional','Excellent','25% won prize in Inter'),
(32,4,'Proficient','Very Good','15% won prize in Inter and 90% (intra and Inter) participation'),
(32,3,'Specialist','Good','100% (intra and Inter) participation only'),
(32,2,'Practitioner','Satisfactory','75% (intra and Inter) participation only'),
(32,1,'Need improvement','Low','50% (intra and Inter) participation only'),
(33,5,'Professional','Excellent','Excellent'),
(33,4,'Proficient','Very Good','Very good'),
(33,3,'Specialist','Good','Good'),
(33,2,'Practitioner','Satisfactory','Satisfactory'),
(33,1,'Need improvement','Low','Low'),
(34,5,'Professional','Excellent','Excellent'),
(34,4,'Proficient','Very Good','Very good'),
(34,3,'Specialist','Good','Good'),
(34,2,'Practitioner','Satisfactory','Satisfactory'),
(34,1,'Need improvement','Low','Low'),
(35,5,'Professional','Excellent','Excellent'),
(35,4,'Proficient','Very Good','Very good'),
(35,3,'Specialist','Good','Good'),
(35,2,'Practitioner','Satisfactory','Satisfactory'),
(35,1,'Need improvement','Low','Low'),
(36,5,'Professional','Excellent','Excellent'),
(36,4,'Proficient','Very Good','Very good'),
(36,3,'Specialist','Good','Good'),
(36,2,'Practitioner','Satisfactory','Satisfactory'),
(36,1,'Need improvement','Low','Low'),
(37,5,'Professional','Excellent','90-100%'),
(37,4,'Proficient','Very Good','80-90%'),
(37,3,'Specialist','Good','70-80%'),
(37,2,'Practitioner','Satisfactory','60-70%'),
(37,1,'Need improvement','Low','50-60%');

-- ---------------- SCORING FORMULAS ----------------
INSERT INTO appraisal_formula (formula_id, section_id, formula_name, formula_expression, notes) VALUES
(1,1,'API','API = SUM(KPI_i * WF_i) for i = 1 to 14','Academic Performance Index - Section A (Self Appraisal)'),
(2,2,'RBA','RBA = SUM(RPI_i * WF_i) for i = 1 to 11','Review Based Appraisal score - Section B'),
(3,NULL,'FPI','FPI = 0.40 * SA + 0.45 * RBA + 0.10 * HPE + 0.5 * SF','Faculty Performance Index. SA = Section A (API) score, RBA = Section B score, HPE = Section C score, SF = Section D Student Feedback score. Weights transcribed as printed in the source document.');

-- ---------------- HELPFUL VIEW: full form in one place ----------------

CREATE VIEW v_appraisal_full AS
SELECT
    s.section_code,
    s.section_name,
    c.category_code,
    c.category_name,
    k.kpi_code,
    k.display_label,
    k.skill_set,
    k.weightage_factor,
    sl.level_no,
    sl.level_title,
    sl.level_rating,
    sl.description
FROM appraisal_kpi k
JOIN appraisal_sections s   ON s.section_id  = k.section_id
LEFT JOIN appraisal_categories c ON c.category_id = k.category_id
JOIN appraisal_scale_level sl ON sl.kpi_id = k.kpi_id
ORDER BY k.sort_order, sl.level_no DESC;
