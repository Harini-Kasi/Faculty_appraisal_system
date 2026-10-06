-- ============================================================
-- Faculty Appraisal Form - Level 4 (Faculty Performance Appraisal, For AP(SG))
-- Generated from: SH_-_Appraisal_Form_-_Level_4.docx
--
-- Uses the SAME schema as the Level-3 appraisal SQL file
-- (appraisal_form_level3.sql). Run that file first if you want
-- both Level-3 and Level-4 data in the same database - the
-- CREATE TABLE statements below are idempotent (IF NOT EXISTS)
-- and all IDs are offset (100+) so the two files can coexist.
-- This file is also fully self-contained and can be run on its
-- own to create just the schema + Level-4 data.
-- ============================================================


CREATE TABLE IF NOT EXISTS appraisal_form (
    form_id       INTEGER PRIMARY KEY,
    form_name     VARCHAR(255) NOT NULL,
    applicable_to VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS appraisal_sections (
    section_id   INTEGER PRIMARY KEY,
    form_id      INTEGER NOT NULL,
    section_code VARCHAR(5)   NOT NULL,   -- A, B, C, D
    section_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (form_id) REFERENCES appraisal_form(form_id)
);

CREATE TABLE IF NOT EXISTS appraisal_categories (
    category_id   INTEGER PRIMARY KEY,
    section_id    INTEGER NOT NULL,
    category_code VARCHAR(20)  NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (section_id) REFERENCES appraisal_sections(section_id)
);

CREATE TABLE IF NOT EXISTS appraisal_kpi (
    kpi_id            INTEGER PRIMARY KEY,
    section_id        INTEGER NOT NULL,
    category_id       INTEGER,
    kpi_code          VARCHAR(20)  NOT NULL,
    display_label     VARCHAR(50),
    skill_set         TEXT NOT NULL,
    weightage_factor  DECIMAL(5,2),
    sort_order        INTEGER,
    notes             TEXT,
    FOREIGN KEY (section_id)  REFERENCES appraisal_sections(section_id),
    FOREIGN KEY (category_id) REFERENCES appraisal_categories(category_id)
);

CREATE TABLE IF NOT EXISTS appraisal_scale_level (
    scale_id     INTEGER PRIMARY KEY,
    kpi_id       INTEGER NOT NULL,
    level_no     SMALLINT NOT NULL,
    level_title  VARCHAR(50) NOT NULL,
    level_rating VARCHAR(50) NOT NULL,
    description  TEXT NOT NULL,
    UNIQUE (kpi_id, level_no),
    FOREIGN KEY (kpi_id) REFERENCES appraisal_kpi(kpi_id)
);

CREATE TABLE IF NOT EXISTS appraisal_formula (
    formula_id          INTEGER PRIMARY KEY,
    section_id          INTEGER,
    formula_name        VARCHAR(50)  NOT NULL,
    formula_expression  TEXT NOT NULL,
    notes               TEXT,
    FOREIGN KEY (section_id) REFERENCES appraisal_sections(section_id)
);

-- ---------------- FORM ----------------
INSERT INTO appraisal_form (form_id, form_name, applicable_to) VALUES
(2, 'Level-4: Faculty Performance Appraisal', 'For AP(SG)');

-- ---------------- SECTIONS ----------------
INSERT INTO appraisal_sections (section_id, form_id, section_code, section_name) VALUES
(101,2,'A','Self Appraisal'),
(102,2,'B','Review based Appraisal'),
(103,2,'C','HOD/Principal Evaluation (HPE)'),
(104,2,'D','Other Criteria');

-- ---------------- CATEGORIES (sub-sections) ----------------
INSERT INTO appraisal_categories (category_id, section_id, category_code, category_name) VALUES
(101,101,'A1','SELF DEVELOPMENT'),
(102,101,'A1.1','Knowledge Up gradation'),
(103,101,'A1.2','Skill Development'),
(104,101,'A1.3','RESEARCH AND DEVELOPMENT'),
(105,101,'A2','ACADEMIC CONTRIBUTION'),
(106,101,'A4','TEAM BUILDING AND LEADERSHIP QUALITIES'),
(107,101,'A5','CONTRIBUTION TOWARDS SELF AND INSTITUTIONAL DISSEMINATION'),
(108,102,'B1','COMPETENCY IN THE COURSE TAUGHT'),
(109,102,'B2','COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS'),
(110,102,'B3','COMPETENCY IN DOMAIN AREA/RESEARCH AREA'),
(111,102,'B4','COMMUNICATION SKILL');

-- ---------------- KPI / RPI / HPE / SF ITEMS ----------------
INSERT INTO appraisal_kpi (kpi_id, section_id, category_id, kpi_code, display_label, skill_set, weightage_factor, sort_order, notes) VALUES
(101,101,102,'KPI1','KPI_1','Strengthening the knowledge through online courses (like NPTEL and other MOOC offered by premier institutions, courses with min. of 8 weeks)',2.0,1,NULL),
(102,101,103,'KPI2','KPI_2','Attending FDP/Workshop (minimum 5 days)/Seminar/Conference (minimum 2 days) in physical mode - one per year, relevant to the courses taught',2.0,2,NULL),
(103,101,103,'KPI3A','KPI_3 (a)','Visiting R&D organisations/Premier Institutions during the academic year in their area of specialization and its outcome',1.0,3,'Alternative option to KPI3(b) - faculty scores under KPI3(a) OR KPI3(b), not both.'),
(104,101,103,'KPI3B','KPI_3 (b)','Delivering expert lecture and acting as session chair/judge/speaker in reputed organizations (International/National level)',1.0,4,'Alternative option to KPI3(a) - faculty scores under KPI3(a) OR KPI3(b), not both.'),
(105,101,104,'KPI4','KPI_4','No. of publications',2.0,5,NULL),
(106,101,104,'KPI5','KPI_5','H-index (Scopus)',1.0,6,NULL),
(107,101,104,'KPI6','KPI_6','Worth of on-going research projects including seed money',1.0,7,NULL),
(108,101,104,'KPI7','KPI_7','Scholar progress',1.0,8,NULL),
(109,101,105,'KPI8','KPI_8','Course file maintenance (based on academic auditing)',2.0,9,NULL),
(110,101,105,'KPI9','KPI_9','Innovative teaching methods introduced in the course taught',1.0,10,NULL),
(111,101,105,'KPI10','KPI_10','Developing e-content and learning repository for the course taught',1.0,11,NULL),
(112,101,105,'KPI17','KPI_17','Academic results - average pass % of the course handled (theory-only / integrated course)',1.0,12,'Printed as ''KPI17'' in the source document even though it follows KPI10 in sequence - numbering as transcribed from the original form.'),
(113,101,106,'KPI18','KPI_18','Training programs organized',1.0,13,NULL),
(114,101,106,'KPI19','KPI_19','Contribution towards department and institution (excluding mentorship - mentorship credits are under HOD evaluation)',1.5,14,NULL),
(115,101,107,'KPI20','KPI_20','Continuous updation of self growth/achievements and institutional events and highlights in social media',1.5,15,NULL),
(116,102,108,'RPI1','RPI_1','Basic and fundamental knowledge in the course taught',3.0,16,NULL),
(117,102,108,'RPI2','RPI_2','Preparedness and involvement in practical/integrated/experiential learning courses',3.0,17,NULL),
(118,102,108,'RPI3','RPI_3','Capability of informing latest developments during content delivery',3.0,18,NULL),
(119,102,109,'RPI4','RPI_4','Usage of appropriate content delivery methods',2.0,19,NULL),
(120,102,109,'RPI5','RPI_5','Selection of assessment tools',2.0,20,NULL),
(121,102,110,'RPI6','RPI_6','Reading articles to the level of listing the title, author and research outcomes',3.0,21,NULL),
(122,102,110,'RPI7','RPI_7','Progress in the domain area/research area',2.0,22,NULL),
(123,102,111,'RPI8','RPI_8','Clarity in delivering the core content as required',2.0,23,NULL),
(124,103,NULL,'HPE1','H~1~','Academic achievements',4.0,24,NULL),
(125,103,NULL,'HPE2','H~2~','Journals, magazines, newsletters, etc. published by the department',4.0,25,NULL),
(126,103,NULL,'HPE3','H~3~','No. of slow learners improved',4.0,26,NULL),
(127,103,NULL,'HPE4','H~4~','Encouraging outstanding students for project activities with funding',3.0,27,NULL),
(128,103,NULL,'HPE5','H~5~','Encouraging the students to participate in technical contests like Hackathons/Ideathons',2.5,28,NULL),
(129,103,NULL,'HPE6','H~6~','Maintaining discipline',2.0,29,NULL),
(130,103,NULL,'HPE7','H~7~','Interpersonal relationship',2.0,30,'Weightage factor not printed against this row in the source table (it appears in a merged/shared WF cell with the surrounding rows); transcribed here as 2 by analogy with H6, H8 and H9.'),
(131,103,NULL,'HPE8','H~8~','Volunteering',2.0,31,'Weightage factor not printed against this row in the source table (merged/shared WF cell); transcribed here as 2 by analogy with H6, H7 and H9.'),
(132,103,NULL,'HPE9','H~9~','LMS monitoring',2.0,32,'Weightage factor not printed against this row in the source table (merged/shared WF cell); transcribed here as 2 by analogy with H6, H7 and H8.'),
(133,103,NULL,'HPE10',NULL,'Foreign university visited - R&D activities / Delivering lecture / Attending conference',NULL,33,'Row heading present in the source document but the performance-scaling columns and weightage factor were left blank/incomplete in the original table - no scale levels are recorded for this item.'),
(134,104,NULL,'SF1','E~1~','Student feedback (SF)',20.0,34,NULL);

-- ---------------- 5-POINT PERFORMANCE SCALE FOR EACH ITEM ----------------
INSERT INTO appraisal_scale_level (kpi_id, level_no, level_title, level_rating, description) VALUES
(101,5,'Professional','Excellent','5% Topper'),
(101,4,'Proficient','Very Good','Elite Gold'),
(101,3,'Specialist','Good','Elite Silver'),
(101,2,'Practitioner','Satisfactory','Elite / >80% score in Non-proctored MOOC courses'),
(101,1,'Need improvement','Low','NPTEL course completed / 60% to 80% score in Non-proctored MOOC courses'),
(102,5,'Professional','Excellent','At least one at other-state institution under NIRF Ranking / IITs / NITs'),
(102,4,'Proficient','Very Good','At least one at Anna University and other premier institutions'),
(102,3,'Specialist','Good','At least one at Govt / Govt aided institutions'),
(102,2,'Practitioner','Satisfactory','Undergone one offline FDP at autonomous and self financing institutions'),
(102,1,'Need improvement','Low','Undergone one Online FDP at autonomous and self financing institutions'),
(103,5,'Professional','Excellent','Received R&D grant / Collaborative SCI paper publication as a result of R&D / Reputed Institution visit'),
(103,4,'Proficient','Very Good','Applied R&D proposal as a result of R&D visit / Reputed Institution'),
(103,3,'Specialist','Good','Sent students for an internship as a result of R&D visit'),
(103,2,'Practitioner','Satisfactory','Visited more than 1 day of R&D visit / Reputed Institution'),
(103,1,'Need improvement','Low','Visited one day of R&D visit / Reputed Institution'),
(104,5,'Professional','Excellent','Delivering expert lecture in International events (online/offline)'),
(104,4,'Proficient','Very Good','Delivering expert lecture at National level'),
(104,3,'Specialist','Good','Delivering expert lecture in state level events'),
(104,2,'Practitioner','Satisfactory','Delivering expert lecture in inter-institution events'),
(104,1,'Need improvement','Low','Delivering expert lecture intra-institution'),
(105,5,'Professional','Excellent','One Q1 journal, or Two Q2 journals, or Three Q3 journals'),
(105,4,'Proficient','Very Good','One Q2 journal, or Two Q3 journals, or Three Q4 journals'),
(105,3,'Specialist','Good','One Q3 journal'),
(105,2,'Practitioner','Satisfactory','Two Q4 journals'),
(105,1,'Need improvement','Low','One Q4 journal'),
(106,5,'Professional','Excellent','7 and more than 7'),
(106,4,'Proficient','Very Good','6'),
(106,3,'Specialist','Good','5'),
(106,2,'Practitioner','Satisfactory','4'),
(106,1,'Need improvement','Low','3'),
(107,5,'Professional','Excellent','Received funding worth more than 5 Lakhs'),
(107,4,'Proficient','Very Good','Received funding worth 3.01 Lakhs ≤ amount ≤ 5.00 Lakhs'),
(107,3,'Specialist','Good','Received funding worth 1.01 Lakhs ≤ amount ≤ 3.00 Lakhs'),
(107,2,'Practitioner','Satisfactory','Received funding worth 0.51 Lakhs ≤ amount ≤ 1.00 Lakhs'),
(107,1,'Need improvement','Low','Received funding worth 0.25 Lakhs ≤ amount ≤ 0.50 Lakhs'),
(108,5,'Professional','Excellent','Guiding at least 2 full time scholars'),
(108,4,'Proficient','Very Good','Guiding at least 1 full time scholar and 1 part time scholar'),
(108,3,'Specialist','Good','Guiding at least 1 full time scholar'),
(108,2,'Practitioner','Satisfactory','Guiding at least 2 scholars'),
(108,1,'Need improvement','Low','Got supervisorship'),
(109,5,'Professional','Excellent','Outstanding maintenance with timely submission, complete documentation, and incorporation of continuous improvement suggestions from previous audits'),
(109,4,'Proficient','Very Good','Positive comments'),
(109,3,'Specialist','Good','No negative remarks'),
(109,2,'Practitioner','Satisfactory','Some negative remarks'),
(109,1,'Need improvement','Low','Deficiency in documentation'),
(110,5,'Professional','Excellent','Innovative practice is published in Scopus/SCI indexed journal'),
(110,4,'Proficient','Very Good','Innovative practice is disseminated in social media after posting on college website'),
(110,3,'Specialist','Good','Innovative practice approved by HOD, Dean-Academic & Principal and posted on college website'),
(110,2,'Practitioner','Satisfactory','Innovative practice is documented and available in LMS'),
(110,1,'Need improvement','Low','Innovative practice is not properly done'),
(111,5,'Professional','Excellent','100% of video content for any two COs is available in LMS as well as in social media'),
(111,4,'Proficient','Very Good','100% of video content for any one CO and 50% of video content for another CO is available in LMS as well as in social media'),
(111,3,'Specialist','Good','100% of video content for any one CO is available in LMS as well as in social media'),
(111,2,'Practitioner','Satisfactory','75% of video content for any one CO is available in LMS as well as in social media'),
(111,1,'Need improvement','Low','50% of video content for any one CO is available in LMS as well as in social media'),
(112,5,'Professional','Excellent','95-100%'),
(112,4,'Proficient','Very Good','90-95%'),
(112,3,'Specialist','Good','85-90%'),
(112,2,'Practitioner','Satisfactory','80-85%'),
(112,1,'Need improvement','Low','75-80%'),
(113,5,'Professional','Excellent','Workshops/Seminars/FDP/STTP with funding'),
(113,4,'Proficient','Very Good','Workshops/Seminars/FDP/STTP - self supporting'),
(113,3,'Specialist','Good','Intra college programmes'),
(113,2,'Practitioner','Satisfactory','Intra dept. programmes (one day)'),
(113,1,'Need improvement','Low','Intra dept. programmes (one session)'),
(114,5,'Professional','Excellent','In-charge in both department and institution level'),
(114,4,'Proficient','Very Good','In-charge of college level committee'),
(114,3,'Specialist','Good','Member in college level committee'),
(114,2,'Practitioner','Satisfactory','In-charge in department level'),
(114,1,'Need improvement','Low','Member in department level'),
(115,5,'Professional','Excellent','Number of connections: more than 1200; Number of posts per year: more than 99; Average post responses (comments + likes): more than 2499'),
(115,4,'Proficient','Very Good','Number of connections: 900 to 1199; Number of posts per year: 80 to 99; Average post responses (comments + likes): 2000 to 2499'),
(115,3,'Specialist','Good','Number of connections: 600 to 899; Number of posts per year: 60 to 79; Average post responses (comments + likes): 1500 to 1999'),
(115,2,'Practitioner','Satisfactory','Number of connections: 300 to 599; Number of posts per year: 40 to 59; Average post responses (comments + likes): 1000 to 1499'),
(115,1,'Need improvement','Low','Number of connections: 100 to 299; Number of posts per year: 20 to 39; Average post responses (comments + likes): 500 to 999'),
(116,5,'Professional','Excellent','Capable of clarifying the doubts in the courses effectively'),
(116,4,'Proficient','Very Good','Capable of delivering the courses effectively'),
(116,3,'Specialist','Good','Profound knowledge by gathering support materials'),
(116,2,'Practitioner','Satisfactory','Adequate knowledge by referring the text books'),
(116,1,'Need improvement','Low','Inadequate knowledge - referring only local author books and notes'),
(117,5,'Professional','Excellent','Offering new experiments every year at the level of design of the experiments'),
(117,4,'Proficient','Very Good','Offering the experiments every year at the level of design of the experiments'),
(117,3,'Specialist','Good','Offering conventional experiments with modern tools like virtual lab, simulation, etc.'),
(117,2,'Practitioner','Satisfactory','Conducting the conventional experiments with clarity'),
(117,1,'Need improvement','Low','Assisting in conducting experiments'),
(118,5,'Professional','Excellent','Makes the students read and discuss research articles relevant to COs/POs'),
(118,4,'Proficient','Very Good','Makes the students read and present research articles relevant to COs/POs'),
(118,3,'Specialist','Good','Informing research status relevant to COs/POs'),
(118,2,'Practitioner','Satisfactory','Delivering contents beyond curriculum relevant to COs/POs'),
(118,1,'Need improvement','Low','Delivering only curriculum contents'),
(119,5,'Professional','Excellent','Innovative content delivery methods declared/presented'),
(119,4,'Proficient','Very Good','Effective use of active and hybrid learning methods'),
(119,3,'Specialist','Good','Conventional methods & appropriate other tools'),
(119,2,'Practitioner','Satisfactory','Conventional methods & quality demonstration'),
(119,1,'Need improvement','Low','Lectures and tutorials (conventional)'),
(120,5,'Professional','Excellent','Innovative assessment methods declared/presented'),
(120,4,'Proficient','Very Good','Conventional methods & uncontrolled tests/open book test'),
(120,3,'Specialist','Good','Conventional methods & appropriate other tools'),
(120,2,'Practitioner','Satisfactory','Conventional methods & quality assignments'),
(120,1,'Need improvement','Low','IAT and tutorials (conventional)'),
(121,5,'Professional','Excellent','Scopus indexed journals'),
(121,4,'Proficient','Very Good','Indian citation indexed journals'),
(121,3,'Specialist','Good','Newsletters and magazines'),
(121,2,'Practitioner','Satisfactory','S&T sections of newspapers'),
(121,1,'Need improvement','Low','Any other online materials'),
(122,5,'Professional','Excellent','Conducted research to the level of publishing a paper in SCI indexed journals'),
(122,4,'Proficient','Very Good','Applied the knowledge and obtained the expected results'),
(122,3,'Specialist','Good','Capable of applying the knowledge for a problem identified in the area of research'),
(122,2,'Practitioner','Satisfactory','Acquiring knowledge relevant to the area of research'),
(122,1,'Need improvement','Low','Initiating the research work'),
(123,5,'Professional','Excellent','Clear articulation with enthusiasm and confidence'),
(123,4,'Proficient','Very Good','Poised and clear articulation; proper volume and steady rate'),
(123,3,'Specialist','Good','Clear articulation but not as polished'),
(123,2,'Practitioner','Satisfactory','Some mumbling; uneven rate; little or no expression'),
(123,1,'Need improvement','Low','Inaudible or too loud; slow/too fast delivery; uninterested and monotonic'),
(124,5,'Professional','Excellent','Making more than 90% of the students achieve the allotted CGPAs'),
(124,4,'Proficient','Very Good','Making more than 80% of the students achieve the allotted CGPAs'),
(124,3,'Specialist','Good','Making more than 70% of the students achieve the allotted CGPAs'),
(124,2,'Practitioner','Satisfactory','Making more than 60% of the students achieve the allotted CGPAs'),
(124,1,'Need improvement','Low','Making more than 50% of the students achieve the allotted CGPAs'),
(125,5,'Professional','Excellent','Making 50% of the targeted students publish articles'),
(125,4,'Proficient','Very Good','Making 40% of the targeted students publish articles'),
(125,3,'Specialist','Good','Making 30% of the targeted students publish articles'),
(125,2,'Practitioner','Satisfactory','Making 20% of the targeted students publish articles'),
(125,1,'Need improvement','Low','Making 10% of the targeted students publish articles'),
(126,5,'Professional','Excellent','Identified and improved the performance of all slow learners'),
(126,4,'Proficient','Very Good','Identified and improved the performance of 50% of slow learners'),
(126,3,'Specialist','Good','Identified and improved the performance of 25% of slow learners'),
(126,2,'Practitioner','Satisfactory','Identified all slow learners and efforts taken'),
(126,1,'Need improvement','Low','Only identified the slow learners'),
(127,5,'Professional','Excellent','Making all the targeted students achieve'),
(127,4,'Proficient','Very Good','Making 80% of the targeted students achieve'),
(127,3,'Specialist','Good','Making 60% of the targeted students achieve'),
(127,2,'Practitioner','Satisfactory','Making 40% of the targeted students achieve'),
(127,1,'Need improvement','Low','Making 20% of the targeted students achieve'),
(128,5,'Professional','Excellent','Making all the targeted students achieve'),
(128,4,'Proficient','Very Good','Making 80% of the targeted students achieve'),
(128,3,'Specialist','Good','Making 60% of the targeted students achieve'),
(128,2,'Practitioner','Satisfactory','Making 40% of the targeted students achieve'),
(128,1,'Need improvement','Low','Making 20% of the targeted students achieve'),
(129,5,'Professional','Excellent','Excellent'),
(129,4,'Proficient','Very Good','Very good'),
(129,3,'Specialist','Good','Good'),
(129,2,'Practitioner','Satisfactory','Satisfactory'),
(129,1,'Need improvement','Low','Low'),
(130,5,'Professional','Excellent','Excellent'),
(130,4,'Proficient','Very Good','Very good'),
(130,3,'Specialist','Good','Good'),
(130,2,'Practitioner','Satisfactory','Satisfactory'),
(130,1,'Need improvement','Low','Low'),
(131,5,'Professional','Excellent','Excellent'),
(131,4,'Proficient','Very Good','Very good'),
(131,3,'Specialist','Good','Good'),
(131,2,'Practitioner','Satisfactory','Satisfactory'),
(131,1,'Need improvement','Low','Low'),
(132,5,'Professional','Excellent','Excellent'),
(132,4,'Proficient','Very Good','Very good'),
(132,3,'Specialist','Good','Good'),
(132,2,'Practitioner','Satisfactory','Satisfactory'),
(132,1,'Need improvement','Low','Low'),
(134,5,'Professional','Excellent','90-100%'),
(134,4,'Proficient','Very Good','80-90%'),
(134,3,'Specialist','Good','70-80%'),
(134,2,'Practitioner','Satisfactory','60-70%'),
(134,1,'Need improvement','Low','50-60%');

-- ---------------- SCORING FORMULAS ----------------
INSERT INTO appraisal_formula (formula_id, section_id, formula_name, formula_expression, notes) VALUES
(101,101,'API','API = SUM(KPI_i * WF_i) for i = 1 to 20','Academic Performance Index - Section A (Self Appraisal), Level-4 form'),
(102,102,'RBA','RBA = SUM(RPI_i * WF_i) for i = 1 to 8','Review Based Appraisal score - Section B, Level-4 form'),
(103,NULL,'FPI','FPI = 0.50 * SA + 0.30 * RBA + 0.10 * HPE + 0.10 * SF','Faculty Performance Index for Level-4. SA = Section A (API) score, RBA = Section B score, HPE = Section C score, SF = Section D Student Feedback score. Weights transcribed as printed in the source document.');

-- ---------------- HELPFUL VIEW: full form in one place ----------------

CREATE VIEW IF NOT EXISTS v_appraisal_full AS
SELECT
    f.form_name,
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
JOIN appraisal_form f       ON f.form_id     = s.form_id
LEFT JOIN appraisal_categories c ON c.category_id = k.category_id
LEFT JOIN appraisal_scale_level sl ON sl.kpi_id = k.kpi_id
ORDER BY f.form_id, k.sort_order, sl.level_no DESC;
