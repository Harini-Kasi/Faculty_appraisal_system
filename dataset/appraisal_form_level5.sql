-- ============================================================
-- Faculty Appraisal Form - Level 5 (Faculty Performance Appraisal, For Associate Professor)
-- Generated from: SH_-_Appraisal_Form_-_Level_5.docx
--
-- Uses the SAME schema as the Level-3/Level-4 appraisal SQL files.
-- CREATE TABLE/VIEW statements are idempotent (IF NOT EXISTS) and
-- all IDs are offset (200+) so this file can be run standalone or
-- combined with appraisal_form_level3.sql / appraisal_form_level4.sql
-- in the same database.
-- ============================================================


CREATE TABLE IF NOT EXISTS appraisal_form (
    form_id       INTEGER PRIMARY KEY,
    form_name     VARCHAR(255) NOT NULL,
    applicable_to VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS appraisal_sections (
    section_id   INTEGER PRIMARY KEY,
    form_id      INTEGER NOT NULL,
    section_code VARCHAR(5)   NOT NULL,
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
(3, 'Level-5: Faculty Performance Appraisal', 'For Associate Professor');

-- ---------------- SECTIONS ----------------
INSERT INTO appraisal_sections (section_id, form_id, section_code, section_name) VALUES
(201,3,'A','Self-Appraisal'),
(202,3,'B','Other Criteria');

-- ---------------- CATEGORIES (sub-sections) ----------------
INSERT INTO appraisal_categories (category_id, section_id, category_code, category_name) VALUES
(201,201,'A-1','Knowledge / Skill Development'),
(202,201,'A-2','Research and Development'),
(203,201,'B','Academic Contribution'),
(204,201,'C','Outreach Programs'),
(205,201,'D','Team building and Leadership Skills'),
(206,202,'E1','HOD’s Evaluation (HE)'),
(207,202,'E2','Principal’s Evaluation (PE)');

-- ---------------- KPI / HE / PE ITEMS ----------------
INSERT INTO appraisal_kpi (kpi_id, section_id, category_id, kpi_code, display_label, skill_set, weightage_factor, sort_order, notes) VALUES
(201,201,201,'KPI1','KPI_1','Attending FDP programme (domain specific only)',2.0,1,NULL),
(202,201,201,'KPI2','KPI_2','Online courses (like NPTEL and other MOOC offered by premier institutions for a period of minimum 8 weeks)',1.0,2,NULL),
(203,201,201,'KPI3','KPI_3','Visit to R&D organization / reputed institution',1.0,3,NULL),
(204,201,202,'KPI4','KPI_4','No. of publications',2.0,4,NULL),
(205,201,202,'KPI5','KPI_5','No. of research scholars (FT/PT)',1.0,5,NULL),
(206,201,202,'KPI6','KPI_6','H-index (Scopus)',1.0,6,NULL),
(207,201,202,'KPI7','KPI_7','Worth of on-going research projects including seed money',2.0,7,NULL),
(208,201,203,'KPI8','KPI_8','E-content development and learning repository',1.0,8,'Levels 5 and 1 are transcribed exactly as printed in the source table and read identically (''100% video content for an elective/core course uploaded in LMS and YouTube''); this duplication appears to be an error/typo in the original document rather than a transcription issue here.'),
(209,201,203,'KPI9','KPI_9','Innovative TLP (teaching-learning process)',1.0,9,NULL),
(210,201,204,'KPI10','KPI_10','Resource person in STTPs/FDPs',1.0,10,NULL),
(211,201,204,'KPI11','KPI_11','Inter-institutional collaboration',1.0,11,NULL),
(212,201,204,'KPI12','KPI_12','Disseminating self, department and institutional activities/achievements through social media (LinkedIn, Facebook)',2.0,12,NULL),
(213,201,205,'KPI13','KPI_13','Contribution to department and institution',2.0,13,'Transcribed in the exact left-to-right order printed in the source table (level 5 down to level 1). The level-1 description (''In-charge in both department and institution level'') reads as a stronger achievement than level 5''s description, suggesting a possible ordering inconsistency in the original document; reproduced as-is rather than reordered.'),
(214,201,205,'KPI14','KPI_14','Training programs organized',2.0,14,NULL),
(215,202,206,'HE1','E1','Proficiency in the subject',5.0,15,NULL),
(216,202,206,'HE2','E1','Involvement in assigned duties',5.0,16,NULL),
(217,202,206,'HE3','E1','Maintaining discipline',5.0,17,NULL),
(218,202,206,'HE4','E1','Interpersonal relationship',5.0,18,NULL),
(219,202,207,'PE1','E2','In-charge in college level activities like placement, higher studies, EDP, innovation centre, domain in-charge, alumni, etc.',20.0,19,NULL);

-- ---------------- 5-POINT PERFORMANCE SCALE FOR EACH ITEM ----------------
INSERT INTO appraisal_scale_level (kpi_id, level_no, level_title, level_rating, description) VALUES
(201,5,'Professional','Excellent','Participation in a 5-day FDP/Seminar/Workshop at IITs/NITs in offline mode, and organizing a value-added course/workshop relevant to the programme'),
(201,4,'Proficient','Very Good','Participation in a 5-day FDP/Seminar/Workshop at institutions other than IITs/NITs in offline mode, and organizing a value-added course/workshop relevant to the programme'),
(201,3,'Specialist','Good','Participation in a 5-day FDP/Seminar/Workshop in online mode, and organizing a value-added course/workshop relevant to the programme'),
(201,2,'Practitioner','Satisfactory','Participation in a 5-day FDP/Seminar/Workshop at IITs/NITs (online/offline)'),
(201,1,'Need improvement','Low','Participation in a 5-day FDP/Seminar/Workshop at institutions other than IITs/NITs (online/offline)'),
(202,5,'Professional','Excellent','5% Topper'),
(202,4,'Proficient','Very Good','Elite Gold'),
(202,3,'Specialist','Good','Elite Silver'),
(202,2,'Practitioner','Satisfactory','Elite / >80% score in Non-proctored MOOC courses'),
(202,1,'Need improvement','Low','NPTEL course completed / 60% to 80% score in Non-proctored MOOC courses'),
(203,5,'Professional','Excellent','Received R&D grant / collaborative SCI paper publication as a result of R&D / reputed institution visit'),
(203,4,'Proficient','Very Good','Applied R&D proposal as a result of R&D visit / reputed institution'),
(203,3,'Specialist','Good','Sent students for an internship as a result of R&D visit'),
(203,2,'Practitioner','Satisfactory','Visited more than 1 day of R&D visit / reputed institution'),
(203,1,'Need improvement','Low','Visited one day of R&D visit / reputed institution'),
(204,5,'Professional','Excellent','One Q1 journal, or Two Q2 journals, or Three Q3 journals'),
(204,4,'Proficient','Very Good','One Q2 journal, or Two Q3 journals, or Three Q4 journals'),
(204,3,'Specialist','Good','One Q3 journal'),
(204,2,'Practitioner','Satisfactory','Two Q4 journals'),
(204,1,'Need improvement','Low','One Q4 journal'),
(205,5,'Professional','Excellent','Produced at least one PhD within 3 years from registration with one publication'),
(205,4,'Proficient','Very Good','Produced at least one PhD with more than 3 years from registration with two publications'),
(205,3,'Specialist','Good','Produced at least one PhD with more than 3 years from registration with one publication'),
(205,2,'Practitioner','Satisfactory','Guiding at least 2 part time research scholars, or 1 full time research scholar'),
(205,1,'Need improvement','Low','Guiding at least 1 part time research scholar'),
(206,5,'Professional','Excellent','8 and more than 8'),
(206,4,'Proficient','Very Good','7'),
(206,3,'Specialist','Good','6'),
(206,2,'Practitioner','Satisfactory','5'),
(206,1,'Need improvement','Low','4'),
(207,5,'Professional','Excellent','Received funding worth more than 6.00 Lakhs'),
(207,4,'Proficient','Very Good','Received funding worth 4.01 Lakhs ≤ amount ≤ 6.00 Lakhs'),
(207,3,'Specialist','Good','Received funding worth 2.01 Lakhs ≤ amount ≤ 4.00 Lakhs'),
(207,2,'Practitioner','Satisfactory','Received funding worth 1.1 Lakhs ≤ amount ≤ 2.00 Lakhs'),
(207,1,'Need improvement','Low','Received funding worth 0.50 Lakhs ≤ amount ≤ 1 Lakh'),
(208,5,'Professional','Excellent','100% video content for an elective/core course uploaded in LMS and YouTube'),
(208,4,'Proficient','Very Good','75% video content (minimum 3 COs) for an elective/core course uploaded in LMS and YouTube'),
(208,3,'Specialist','Good','50% video content (minimum 2 COs) for an elective/core course uploaded in LMS and YouTube'),
(208,2,'Practitioner','Satisfactory','100% video content for a one-credit course'),
(208,1,'Need improvement','Low','100% video content for an elective/core course uploaded in LMS and YouTube'),
(209,5,'Professional','Excellent','Innovative practice is published in Scopus/SCI indexed journal'),
(209,4,'Proficient','Very Good','Innovative practice is disseminated in social media after posting on college website'),
(209,3,'Specialist','Good','Innovative practice approved by HOD, Dean-Academic & Principal and posted on college website'),
(209,2,'Practitioner','Satisfactory','Innovative practice is documented and available in LMS'),
(209,1,'Need improvement','Low','Innovative practice is not properly done'),
(210,5,'Professional','Excellent','Reputed institutions (NIRF rank 1-100) (offline)'),
(210,4,'Proficient','Very Good','Reputed institutions (NIRF rank 101-150) (offline)'),
(210,3,'Specialist','Good','Reputed institutions (NIRF rank 151-200) (offline)'),
(210,2,'Practitioner','Satisfactory','Reputed institutions (offline)'),
(210,1,'Need improvement','Low','Schools in Tamil Nadu (offline)'),
(211,5,'Professional','Excellent','One SCI indexed journal publication involving one author from only one other well-regarded institution'),
(211,4,'Proficient','Very Good','Research project proposal submission'),
(211,3,'Specialist','Good','Book publication involving one author from only one other well-regarded institution'),
(211,2,'Practitioner','Satisfactory','Book chapter publication involving one author from only one other well-regarded institution'),
(211,1,'Need improvement','Low','Scopus indexed conference presentation involving one author from only one other well-regarded institution'),
(212,5,'Professional','Excellent','Number of connections: more than 1200; Number of posts per year: more than 99; Average post responses (comments + likes): more than 2499'),
(212,4,'Proficient','Very Good','Number of connections: 900 to 1199; Number of posts per year: 80 to 99; Average post responses (comments + likes): 2000 to 2499'),
(212,3,'Specialist','Good','Number of connections: 600 to 899; Number of posts per year: 60 to 79; Average post responses (comments + likes): 1500 to 1999'),
(212,2,'Practitioner','Satisfactory','Number of connections: 300 to 599; Number of posts per year: 40 to 59; Average post responses (comments + likes): 1000 to 1499'),
(212,1,'Need improvement','Low','Number of connections: 100 to 299; Number of posts per year: 20 to 39; Average post responses (comments + likes): 500 to 999'),
(213,5,'Professional','Excellent','New development activities are implemented and outcomes are partially achieved'),
(213,4,'Proficient','Very Good','Got approval for new development activities from HOD and Principal and implemented'),
(213,3,'Specialist','Good','Got approval for new development activities and outcomes from HOD and Principal'),
(213,2,'Practitioner','Satisfactory','New development activities initiated'),
(213,1,'Need improvement','Low','In-charge in both department and institution level'),
(214,5,'Professional','Excellent','ATAL/Anna University sponsored one-week FDP, or training to industry personnel for a duration of more than 1 day'),
(214,4,'Proficient','Very Good','One-week Workshops/Seminars/FDP/STTP with funding, or training to industry personnel for a duration of 1 day'),
(214,3,'Specialist','Good','Two-day Workshops/Seminars/FDP/STTP with funding'),
(214,2,'Practitioner','Satisfactory','Two-day Workshop/Seminars/FDP/STTP/International webinars (resource person should be a foreigner) - self supporting'),
(214,1,'Need improvement','Low','One-day Workshops/Seminars/FDP/STTP/International webinars (resource person should be a foreigner) - self supporting'),
(215,5,'Professional','Excellent','Excellent'),
(215,4,'Proficient','Very Good','Very good'),
(215,3,'Specialist','Good','Good'),
(215,2,'Practitioner','Satisfactory','Satisfactory'),
(215,1,'Need improvement','Low','Low'),
(216,5,'Professional','Excellent','Excellent'),
(216,4,'Proficient','Very Good','Very good'),
(216,3,'Specialist','Good','Good'),
(216,2,'Practitioner','Satisfactory','Satisfactory'),
(216,1,'Need improvement','Low','Low'),
(217,5,'Professional','Excellent','Excellent'),
(217,4,'Proficient','Very Good','Very good'),
(217,3,'Specialist','Good','Good'),
(217,2,'Practitioner','Satisfactory','Satisfactory'),
(217,1,'Need improvement','Low','Low'),
(218,5,'Professional','Excellent','Excellent'),
(218,4,'Proficient','Very Good','Very good'),
(218,3,'Specialist','Good','Good'),
(218,2,'Practitioner','Satisfactory','Satisfactory'),
(218,1,'Need improvement','Low','Low'),
(219,5,'Professional','Excellent','Excellent'),
(219,4,'Proficient','Very Good','Very good'),
(219,3,'Specialist','Good','Good'),
(219,2,'Practitioner','Satisfactory','Satisfactory'),
(219,1,'Need improvement','Low','Low');

-- ---------------- SCORING FORMULAS ----------------
INSERT INTO appraisal_formula (formula_id, section_id, formula_name, formula_expression, notes) VALUES
(201,201,'API','API = SUM(KPI_i * WF_i) for i = 1 to 14','Academic Performance Index - Section A (Self-Appraisal), Level-5 form'),
(202,202,'HE','HE = SUM(HE_i * WF_i) for i = 1 to 4','HOD’s Evaluation total - Section B / category E1, Level-5 form'),
(203,202,'PE','PE = PE1 * WF','Principal’s Evaluation total - Section B / category E2, Level-5 form'),
(204,NULL,'FPI','FPI = (API * 0.80) + (HE * 0.10) + (PE * 0.10)','Total Marks / Faculty Performance Index for Level-5. API = Section A score, HE = HOD’s Evaluation total, PE = Principal’s Evaluation total. Weights transcribed as printed in the source document.');

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
