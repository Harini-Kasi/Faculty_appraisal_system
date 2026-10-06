-- SH - Appraisal Form - Level 2
-- Converted from the supplied DOCX into a normalized SQL script.
-- Source: Level-2 Faculty Performance Appraisal (For APs more than two years of experience).

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS performance_levels;
DROP TABLE IF EXISTS appraisal_criteria;
DROP TABLE IF EXISTS appraisal_sections;
DROP TABLE IF EXISTS appraisal_formulas;

CREATE TABLE appraisal_sections (
    section_id VARCHAR(20) PRIMARY KEY,
    section_name TEXT NOT NULL,
    appraisal_component VARCHAR(20) NOT NULL
);

CREATE TABLE appraisal_criteria (
    criterion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id VARCHAR(20) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    skill_set TEXT NOT NULL,
    description TEXT,
    weight_factor DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (section_id) REFERENCES appraisal_sections(section_id)
);

CREATE TABLE performance_levels (
    level_id INTEGER PRIMARY KEY AUTOINCREMENT,
    criterion_id INTEGER NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    rating VARCHAR(50) NOT NULL,
    performance_description TEXT NOT NULL,
    FOREIGN KEY (criterion_id) REFERENCES appraisal_criteria(criterion_id),
    UNIQUE (criterion_id, score)
);

CREATE TABLE appraisal_formulas (
    formula_id INTEGER PRIMARY KEY AUTOINCREMENT,
    formula_name VARCHAR(100) NOT NULL,
    formula_expression TEXT NOT NULL,
    notes TEXT
);

-- Appraisal sections
INSERT INTO appraisal_sections (section_id, section_name, appraisal_component) VALUES ('A1', 'SELF DEVELOPMENT', 'SA');
INSERT INTO appraisal_sections (section_id, section_name, appraisal_component) VALUES ('A2', 'ACADEMIC CONTRIBUTION', 'SA');
INSERT INTO appraisal_sections (section_id, section_name, appraisal_component) VALUES ('A3', 'INVOLVEMENT IN INSTITUTION AND DEPARTMENT LEVEL ACTIVITY', 'SA');
INSERT INTO appraisal_sections (section_id, section_name, appraisal_component) VALUES ('A4', 'CONTRIBUTION TOWARDS SELF AND INSTITUTIONAL DISSEMINATION', 'SA');
INSERT INTO appraisal_sections (section_id, section_name, appraisal_component) VALUES ('B1', 'COMPETENCY IN THE COURSES TAUGHT', 'RBA');
INSERT INTO appraisal_sections (section_id, section_name, appraisal_component) VALUES ('B2', 'COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS', 'RBA');
INSERT INTO appraisal_sections (section_id, section_name, appraisal_component) VALUES ('B3', 'COMPETENCY IN DOMAIN AREA/RESEARCH AREA', 'RBA');
INSERT INTO appraisal_sections (section_id, section_name, appraisal_component) VALUES ('B4', 'COMMUNICATION SKILL', 'RBA');
INSERT INTO appraisal_sections (section_id, section_name, appraisal_component) VALUES ('C1', 'TRANSFORMING STUDENTS'' POTENTIAL AS A TUTOR', 'HPE');
INSERT INTO appraisal_sections (section_id, section_name, appraisal_component) VALUES ('E1', 'Other Criteria - Student feedback', 'SF');

-- Appraisal criteria
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('A1', 'KPI1', 'Knowledge Up Gradation', 'Strengthening the knowledge through online courses (like NPTEL and other MOOC offered by premier institutions - Courses with Min of 8Wks)', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('A1', 'KPI2', 'Skill Development', 'Attending FDP/Workshop/minimum 5 days/Seminar/Conference for minimum 2 days in Physical Mode - one per year relevant to the courses taught.', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('A1', 'KPI3', 'Initiatives towards Research and Development - Ph.D. Registration', 'Ph.D. Registration', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('A2', 'KPI4', 'Course file Maintenance', 'Based on academic auditing', 2.5);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('A2', 'KPI5', 'Innovative Teaching methods introduced in the course taught', 'Innovative teaching methods', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('A2', 'KPI6', 'Academic Results', 'Average pass % of the course handled - Theory Only Course / Integrated Course', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('A2', 'KPI7', 'Developing e-content and learning repository for the course taught', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('A3', 'KPI8', 'Organizing School training programs', '', 1.5);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('A3', 'KPI9', 'Contribution towards Department and Institution', 'Excluding Mentorship - Mentorship Credits are under HOD Evaluation', 1.5);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('A4', 'KPI10', 'Continuous updation of self growth / achievements and Institutional events and highlights in social media', '', 2.5);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B1', 'RPI1', 'Basic and fundamental knowledge in the course taught', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B1', 'RPI2', 'Preparedness and involvement in practical/Integrated/Experiential learning courses', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B1', 'RPI3', 'Capability of informing latest developments during content delivery', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B1', 'RPI4', 'Capability of solving GATE/Company level Questions', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B2', 'RPI5', 'Usage of appropriate content delivery methods', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B2', 'RPI6', 'Selection of assessment tools', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B2', 'RPI7', 'Integrating library in course taught', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B2', 'RPI8', 'Practiced Project/Problem based learning skills', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B3', 'RPI9', 'Reading articles to the level of listing the title, author and research outcomes', '', 1.5);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B3', 'RPI10', 'Progress in the domain area/research area', '', 1.5);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('B4', 'RPI11', 'Clarity in delivering the core content as requirement', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H1', 'Academic Achievements', 'Making students achieve the allotted CGPAs', 3);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H2', 'No. of slow learners improved', '', 3);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H3', 'Encouraging students for publish Journals, magazines, newsletters, etc., by the department', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H4', 'Online Courses - NPTEL', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H5', 'Students progress in Skill rack (75% of the students)', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H6', 'Encouraging the students to participate in Technical contests like Hackathons/Ideathons', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H7', 'Students participation in Inter / Intra Colleges events', '', 2);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H8', 'Maintaining discipline', '', 1);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H9', 'Interpersonal relationship', '', 1);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H10', 'Volunteering', '', 1);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('C1', 'H11', 'LMS Monitoring', '', 1);
INSERT INTO appraisal_criteria (section_id, code, skill_set, description, weight_factor) VALUES ('E1', 'E1', 'Student feedback (SF)', '', 20);

-- Performance levels
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI1'), 5, 'Professional / Excellent', '5% Topper');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI1'), 4, 'Proficient / Very Good', 'Elite Gold');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI1'), 3, 'Specialist / Good', 'Elite Silver');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI1'), 2, 'Practitioner / Satisfactory', 'Elite / >80% score in Non-proctored MOOC courses');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI1'), 1, 'Need Improvement / Low', 'NPTEL course Completed / 60% to 80% score in Non-proctored MOOC courses');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI2'), 5, 'Professional / Excellent', 'At least one at other states Institution under NIRF Ranking / IITs / NITs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI2'), 4, 'Proficient / Very Good', 'At least one at Anna University and other premier institutions');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI2'), 3, 'Specialist / Good', 'At least one at Govt / Govt aided institutions');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI2'), 2, 'Practitioner / Satisfactory', 'Undergone one Workshop/Seminar/Conference at autonomous and self financing institutions');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI2'), 1, 'Need Improvement / Low', 'Undergone one Online FDP / at autonomous and self financing institutions');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI3'), 5, 'Professional / Excellent', 'Successfully progressing, two paper published in journal.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI3'), 4, 'Proficient / Very Good', 'Progressing, a paper accepted for publication and a Paper submitted for publication');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI3'), 3, 'Specialist / Good', 'Moderately progressing, a survey paper accepted for publication and a Paper submitted for publication');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI3'), 2, 'Practitioner / Satisfactory', 'Not progressing up to the level, a survey paper submitted for publication');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI3'), 1, 'Need Improvement / Low', 'Ph.D. Registered');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI4'), 5, 'Professional / Excellent', 'Outstanding maintenance with timely submission, complete documentation, and incorporation of continuous improvement suggestions from previous audits');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI4'), 4, 'Proficient / Very Good', 'Positive comments');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI4'), 3, 'Specialist / Good', 'No negative remarks');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI4'), 2, 'Practitioner / Satisfactory', 'Some negative remarks');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI4'), 1, 'Need Improvement / Low', 'Deficiency in documentation');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI5'), 5, 'Professional / Excellent', 'Teaching methodology was recognized / appreciated and published in Journal');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI5'), 4, 'Proficient / Very Good', 'Teaching methodology was recognized / appreciated and presented in a International/National Conference');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI5'), 3, 'Specialist / Good', 'Teaching methodology was recognized / appreciated and published in the institutional website');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI5'), 2, 'Practitioner / Satisfactory', 'Introduced minimum of one methodology, and proper documentation was not made.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI5'), 1, 'Need Improvement / Low', 'Introduced minimum of one methodology, but proper documentation was not made.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI6'), 5, 'Professional / Excellent', '95-100%');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI6'), 4, 'Proficient / Very Good', '90-95%');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI6'), 3, 'Specialist / Good', '85-90%');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI6'), 2, 'Practitioner / Satisfactory', '80-85%');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI6'), 1, 'Need Improvement / Low', '75-80%');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI7'), 5, 'Professional / Excellent', '100% of text form of content and 100% of Video content for any two CO is available in LMS as well as in social media.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI7'), 4, 'Proficient / Very Good', '100% of text form of content and 100% of Video content for any one CO is available in LMS as well as in social media');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI7'), 3, 'Specialist / Good', '100% of text form of content and 50% of Video content for any one CO is available in LMS as well as in social media');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI7'), 2, 'Practitioner / Satisfactory', '100% of text form of content was developed and available in LMS');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI7'), 1, 'Need Improvement / Low', 'Created only one or two text/video content/unit');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI8'), 5, 'Professional / Excellent', 'Coordinator for 1 program');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI8'), 4, 'Proficient / Very Good', 'Co-coordinator for 1 program');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI8'), 3, 'Specialist / Good', 'Member in 2 programs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI8'), 2, 'Practitioner / Satisfactory', 'Member in 1 program');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI8'), 1, 'Need Improvement / Low', 'Supporting Program committee member');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI9'), 5, 'Professional / Excellent', 'In charge in both department and institution level');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI9'), 4, 'Proficient / Very Good', 'Incharge College level committee');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI9'), 3, 'Specialist / Good', 'Member in College level committee');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI9'), 2, 'Practitioner / Satisfactory', 'Incharge in Department level');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI9'), 1, 'Need Improvement / Low', 'Member in Department level');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI10'), 5, 'Professional / Excellent', 'Number of Connections: More than 1200; Number of Post per year: more than 99; Average Post Responses (Comments + Likes): More than 2499');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI10'), 4, 'Proficient / Very Good', 'Number of Connections: 900 to 1199; Number of Post per year: 80 to 99; Average Post Responses (Comments + Likes): 2000 to 2499');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI10'), 3, 'Specialist / Good', 'Number of Connections: 600 to 899; Number of Post per year: 60 to 79; Average Post Responses (Comments + Likes): 1500 to 1999');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI10'), 2, 'Practitioner / Satisfactory', 'Number of Connections: 300 to 599; Number of Post per year: 40 to 59; Average Post Responses (Comments + Likes): 1000 to 1499');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'KPI10'), 1, 'Need Improvement / Low', 'Number of Connections: 100 to 299; Number of Post per year: 20 to 39; Average Post Responses (Comments + Likes): 500 to 999');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI1'), 5, 'Professional / Excellent', 'Capable of clarifying the doubts in the courses effectively');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI1'), 4, 'Proficient / Very Good', 'Capable of delivering the courses effectively');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI1'), 3, 'Specialist / Good', 'Profound knowledge by gathering support materials');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI1'), 2, 'Practitioner / Satisfactory', 'Adequate knowledge by referring the text books');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI1'), 1, 'Need Improvement / Low', 'Inadequate knowledge - referring only local author books and notes');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI2'), 5, 'Professional / Excellent', 'Offering new experiments every year in the level of design of the experiments');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI2'), 4, 'Proficient / Very Good', 'Offering the experiments every year in the level of design of the experiments');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI2'), 3, 'Specialist / Good', 'Offering conventional experiments with modern tools like virtual lab, simulation etc.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI2'), 2, 'Practitioner / Satisfactory', 'Conducting the conventional experiments with clarity');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI2'), 1, 'Need Improvement / Low', 'Assisting in conducting experiments');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI3'), 5, 'Professional / Excellent', 'Make the students to read and discuss research articles relevant to COs/POs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI3'), 4, 'Proficient / Very Good', 'Make the students to read and present research articles relevant to COs/POs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI3'), 3, 'Specialist / Good', 'Informing research status relevant to COs/POs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI3'), 2, 'Practitioner / Satisfactory', 'Delivering contents beyond curriculum relevant to COs/POs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI3'), 1, 'Need Improvement / Low', 'Delivering only curriculum contents');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI4'), 5, 'Professional / Excellent', 'Faculty posts 50+ CO-mapped GATE/company questions in LMS, solves complex problems in every class, assigns weekly challenging assessments, and maintains comprehensive question banks covering all COs with varied difficulty levels.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI4'), 4, 'Proficient / Very Good', 'Faculty posts 35-49 CO-mapped GATE/company questions in LMS, solves 2-3 problems per class, assigns regular moderate-level homework, and covers 80%+ COs with proper categorization and solutions.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI4'), 3, 'Specialist / Good', 'Faculty posts 25-34 CO-mapped GATE/company questions in LMS, demonstrates problem-solving in 50%+ classes, assigns periodic basic-to-moderate problems, and covers major COs with standard solution approaches.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI4'), 2, 'Practitioner / Satisfactory', 'Faculty posts 15-24 CO-mapped GATE/company questions in LMS, occasionally solves problems in class, assigns simple problems as assignments, and covers essential COs with basic explanations.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI4'), 1, 'Need Improvement / Low', 'Faculty posts 5-14 CO-mapped GATE/company questions in LMS, demonstrates fundamental problem-solving in selected classes, assigns elementary problems occasionally, and covers core COs with simple solutions.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI5'), 5, 'Professional / Excellent', 'Innovative content delivery methods declared/presented');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI5'), 4, 'Proficient / Very Good', 'Effective use of active and hybrid learning methods');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI5'), 3, 'Specialist / Good', 'Conventional methods & appropriate other tools');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI5'), 2, 'Practitioner / Satisfactory', 'Conventional methods & quality demonstration');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI5'), 1, 'Need Improvement / Low', 'Lectures and tutorials (Conventional)');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI6'), 5, 'Professional / Excellent', 'Innovative assessment methods declared / presented');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI6'), 4, 'Proficient / Very Good', 'Conventional methods & uncontrolled tests / open book test');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI6'), 3, 'Specialist / Good', 'Conventional methods & appropriate other tools');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI6'), 2, 'Practitioner / Satisfactory', 'Conventional methods & quality assignments');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI6'), 1, 'Need Improvement / Low', 'IAT and tutorials (Conventional)');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI7'), 5, 'Professional / Excellent', 'Conducted more than one Time bounded quality assessment (Assignments, Open book test, etc.) utilizing library resources were given evaluated and feedback on library integration was obtained.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI7'), 4, 'Proficient / Very Good', 'Conducted one Time bounded quality assessment (Assignments, Open book test, etc.) utilizing library resources were given evaluated and feedback on library integration was obtained.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI7'), 3, 'Specialist / Good', 'Conducted one Time bounded quality assessment (Assignments, Open book test, etc.) utilizing library resources were given and evaluated.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI7'), 2, 'Practitioner / Satisfactory', 'Conducted instruction sessions in library using the library resources.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI7'), 1, 'Need Improvement / Low', 'Embedded NEC and Anna University e-library books/references in the NEC LMS course page');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI8'), 5, 'Professional / Excellent', 'Conducted and evaluated more than one Project/Problem based learning activities planned for the course taught. Also identified the strengths and weaknesses of the students');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI8'), 4, 'Proficient / Very Good', 'Conducted and evaluated at least one Project/Problem based learning activities planned for the course taught. Also identified the strengths and weaknesses of the students');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI8'), 3, 'Specialist / Good', 'Conducted and evaluated at least one Project/Problem based learning activities planned for the course taught');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI8'), 2, 'Practitioner / Satisfactory', 'Conducted at least one Project/Problem based learning activities planned for the course taught');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI8'), 1, 'Need Improvement / Low', 'Project/Problem based learning activities were planned for the course taught and respective activity was mentioned in the course plan');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI9'), 5, 'Professional / Excellent', 'Scopus indexed journals');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI9'), 4, 'Proficient / Very Good', 'Indian citation indexed journals');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI9'), 3, 'Specialist / Good', 'Newsletters and Magazines');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI9'), 2, 'Practitioner / Satisfactory', 'S&T sections of newspapers');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI9'), 1, 'Need Improvement / Low', 'Any other online materials');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI10'), 5, 'Professional / Excellent', 'Conducted research to the level of publishing paper in SCI indexed journals');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI10'), 4, 'Proficient / Very Good', 'Applied the knowledge, and obtained the expected results');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI10'), 3, 'Specialist / Good', 'Capable of applying the knowledge for problem identified in the area of research');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI10'), 2, 'Practitioner / Satisfactory', 'Acquiring knowledge relevant to area of research.');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI10'), 1, 'Need Improvement / Low', 'Initiating the research work');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI11'), 5, 'Professional / Excellent', 'Clear articulation with enthusiasm and confidence');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI11'), 4, 'Proficient / Very Good', 'Poised and clear articulation; Proper volume; steady rate');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI11'), 3, 'Specialist / Good', 'Clear articulation but not as polished');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI11'), 2, 'Practitioner / Satisfactory', 'Some mumbling; Uneven rate; Little or no expression');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'RPI11'), 1, 'Need Improvement / Low', 'Inaudible or too loud; Slow/too fast delivery; Uninterested and monotonic');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H1'), 5, 'Professional / Excellent', 'Making more than 90% the students to achieve the allotted CGPAs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H1'), 4, 'Proficient / Very Good', 'Making more than 80% the students to achieve the allotted CGPAs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H1'), 3, 'Specialist / Good', 'Making more than 70% the students to achieve the allotted CGPAs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H1'), 2, 'Practitioner / Satisfactory', 'Making more than 60% the students to achieve the allotted CGPAs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H1'), 1, 'Need Improvement / Low', 'Making more than 50% the students to achieve the allotted CGPAs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H2'), 5, 'Professional / Excellent', 'Identified and improved the performances of all slow learners');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H2'), 4, 'Proficient / Very Good', 'Identified and improved the performances of 50% slow learners');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H2'), 3, 'Specialist / Good', 'Identified and improved the performances of 25% slow learners');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H2'), 2, 'Practitioner / Satisfactory', 'Identified all slow learners and efforts taken');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H2'), 1, 'Need Improvement / Low', 'Only identified the slow learners');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H3'), 5, 'Professional / Excellent', 'Making 50% of the targeted students to publish the articles');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H3'), 4, 'Proficient / Very Good', 'Making 40% of the targeted students to publish the articles');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H3'), 3, 'Specialist / Good', 'Making 30% of the targeted students to publish the articles');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H3'), 2, 'Practitioner / Satisfactory', 'Making 20% of the targeted students to publish the articles');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H3'), 1, 'Need Improvement / Low', 'Making 10% of the targeted students to publish the articles');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H4'), 5, 'Professional / Excellent', '100% participation and 10% Elite Silver');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H4'), 4, 'Proficient / Very Good', '100% participation and 50% Elite');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H4'), 3, 'Specialist / Good', '100% participation and 30% Elite');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H4'), 2, 'Practitioner / Satisfactory', '100% participation and 75% successfully Completed');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H4'), 1, 'Need Improvement / Low', '100% participation');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H5'), 5, 'Professional / Excellent', 'Solved 600 programs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H5'), 4, 'Proficient / Very Good', 'Solved 500 programs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H5'), 3, 'Specialist / Good', 'Solved 400 programs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H5'), 2, 'Practitioner / Satisfactory', 'Solved 300 programs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H5'), 1, 'Need Improvement / Low', 'Solved 200 programs');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H6'), 5, 'Professional / Excellent', 'Making all the targeted students to achieve');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H6'), 4, 'Proficient / Very Good', 'Making 80% of the targeted students to achieve');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H6'), 3, 'Specialist / Good', 'Making 60% of the targeted students to achieve');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H6'), 2, 'Practitioner / Satisfactory', 'Making 40% of the targeted students to achieve');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H6'), 1, 'Need Improvement / Low', 'Making 20% of the targeted students to achieve');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H7'), 5, 'Professional / Excellent', '25% Won Prize in Inter');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H7'), 4, 'Proficient / Very Good', '15% won Prize in inter and 90% (intra and Inter) Participation');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H7'), 3, 'Specialist / Good', '100% (intra and Inter) Participation only');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H7'), 2, 'Practitioner / Satisfactory', '75% (intra and Inter) Participation only');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H7'), 1, 'Need Improvement / Low', '50% (intra and Inter) Participation only');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H8'), 5, 'Professional / Excellent', 'Excellent');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H8'), 4, 'Proficient / Very Good', 'Very good');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H8'), 3, 'Specialist / Good', 'Good');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H8'), 2, 'Practitioner / Satisfactory', 'Satisfactory');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H8'), 1, 'Need Improvement / Low', 'Low');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H9'), 5, 'Professional / Excellent', 'Excellent');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H9'), 4, 'Proficient / Very Good', 'Very good');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H9'), 3, 'Specialist / Good', 'Good');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H9'), 2, 'Practitioner / Satisfactory', 'Satisfactory');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H9'), 1, 'Need Improvement / Low', 'Low');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H10'), 5, 'Professional / Excellent', 'Excellent');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H10'), 4, 'Proficient / Very Good', 'Very good');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H10'), 3, 'Specialist / Good', 'Good');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H10'), 2, 'Practitioner / Satisfactory', 'Satisfactory');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H10'), 1, 'Need Improvement / Low', 'Low');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H11'), 5, 'Professional / Excellent', 'Excellent');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H11'), 4, 'Proficient / Very Good', 'Very good');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H11'), 3, 'Specialist / Good', 'Good');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H11'), 2, 'Practitioner / Satisfactory', 'Satisfactory');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'H11'), 1, 'Need Improvement / Low', 'Low');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'E1'), 5, 'Professional / Excellent', '90-100%');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'E1'), 4, 'Proficient / Very Good', '80-90%');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'E1'), 3, 'Specialist / Good', '70-80%');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'E1'), 2, 'Practitioner / Satisfactory', '60-70%');
INSERT INTO performance_levels (criterion_id, score, rating, performance_description) VALUES ((SELECT criterion_id FROM appraisal_criteria WHERE code = 'E1'), 1, 'Need Improvement / Low', '50-60%');

-- Formula recorded in the supplied document.
-- API and RBA formula text is incomplete in the extracted DOCX.
-- Final FPI formula is preserved exactly as visible in the document.
INSERT INTO appraisal_formulas (formula_name, formula_expression, notes) VALUES ('Faculty Performance Index (FPI)', '0.40 x SA + 0.45 x RBA + 0.10 x HPE + 0.5 x SF', 'Formula preserved from the supplied DOCX; source text shows 0.5 for SF.');

-- End of file.