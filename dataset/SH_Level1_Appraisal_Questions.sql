-- SH - Level-1 Faculty Performance Appraisal
-- Converted from: SH - Appraisal Form - Level 1.docx
-- Compatible with the existing FPA SQLite schema: questions + options.
-- Department: S&H (interpreted from the document filename 'SH').
-- Designations: AP1 and AP2 (Level-1 is stated as APs with one/two years of experience).
-- Verify the designation mapping before running in production.
-- Rating scale: 5 Professional/Excellent, 4 Proficient/Very Good,
-- 3 Specialist/Good, 2 Practitioner/Satisfactory, 1 Need Improvement/Low.

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- Remove only these imported Level-1 criteria for AP1/AP2.
-- This does NOT delete submissions.
DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE department='S&H' AND designation IN ('AP1','AP2') AND group_code IN ('KPI1','KPI2','KPI3','KPI4','KPI5','KPI6','KPI7','KPI8','KPI9','RPI1','RPI2','RPI3','RPI4','RPI5','RPI6','RPI7','RPI8','RPI9','H1','H2','H3','H4','H5','H6','H7','H8','H9','H10','H11','E1'));
DELETE FROM questions WHERE department='S&H' AND designation IN ('AP1','AP2') AND group_code IN ('KPI1','KPI2','KPI3','KPI4','KPI5','KPI6','KPI7','KPI8','KPI9','RPI1','RPI2','RPI3','RPI4','RPI5','RPI6','RPI7','RPI8','RPI9','H1','H2','H3','H4','H5','H6','H7','H8','H9','H10','H11','E1');

INSERT INTO questions
(department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index)
VALUES
('S&H','AP1','A','A. Self Appraisal','A1','A1. SELF DEVELOPMENT',NULL,NULL,'KPI1','Strengthening the knowledge through online courses (like NPTEL and other MOOC offered by premier institutions- Courses with Min of 8Wks)',2.5,1),
('S&H','AP2','A','A. Self Appraisal','A1','A1. SELF DEVELOPMENT',NULL,NULL,'KPI1','Strengthening the knowledge through online courses (like NPTEL and other MOOC offered by premier institutions- Courses with Min of 8Wks)',2.5,2),
('S&H','AP1','A','A. Self Appraisal','A1','A1. SELF DEVELOPMENT',NULL,NULL,'KPI2','Attending FDP/Workshop/ minimum 5 days / Seminar/ Conference for minimum 2 days in Physical Mode - one per year relevant to the courses taught.',2.5,3),
('S&H','AP2','A','A. Self Appraisal','A1','A1. SELF DEVELOPMENT',NULL,NULL,'KPI2','Attending FDP/Workshop/ minimum 5 days / Seminar/ Conference for minimum 2 days in Physical Mode - one per year relevant to the courses taught.',2.5,4),
('S&H','AP1','A','A. Self Appraisal','A1','A1. SELF DEVELOPMENT',NULL,NULL,'KPI3','Ph.D. Registration',2,5),
('S&H','AP2','A','A. Self Appraisal','A1','A1. SELF DEVELOPMENT',NULL,NULL,'KPI3','Ph.D. Registration',2,6),
('S&H','AP1','A','A. Self Appraisal','A2','A2. ACADEMIC CONTRIBUTION',NULL,NULL,'KPI4','Course file Maintenance (Based on academic auditing)',2.5,7),
('S&H','AP2','A','A. Self Appraisal','A2','A2. ACADEMIC CONTRIBUTION',NULL,NULL,'KPI4','Course file Maintenance (Based on academic auditing)',2.5,8),
('S&H','AP1','A','A. Self Appraisal','A2','A2. ACADEMIC CONTRIBUTION',NULL,NULL,'KPI5','Innovative Teaching methods introduced in the course taught',2,9),
('S&H','AP2','A','A. Self Appraisal','A2','A2. ACADEMIC CONTRIBUTION',NULL,NULL,'KPI5','Innovative Teaching methods introduced in the course taught',2,10),
('S&H','AP1','A','A. Self Appraisal','A2','A2. ACADEMIC CONTRIBUTION',NULL,NULL,'KPI6','Academic Results (Average pass % of the course handled) Theory Only Course / Integrated Course',2.5,11),
('S&H','AP2','A','A. Self Appraisal','A2','A2. ACADEMIC CONTRIBUTION',NULL,NULL,'KPI6','Academic Results (Average pass % of the course handled) Theory Only Course / Integrated Course',2.5,12),
('S&H','AP1','A','A. Self Appraisal','A2','A2. ACADEMIC CONTRIBUTION',NULL,NULL,'KPI7','Developing e-content and learning repository for the course taught',2,13),
('S&H','AP2','A','A. Self Appraisal','A2','A2. ACADEMIC CONTRIBUTION',NULL,NULL,'KPI7','Developing e-content and learning repository for the course taught',2,14),
('S&H','AP1','A','A. Self Appraisal','A3','A3. INVOLVEMENT IN INSTITUTION AND DEPARTMENT LEVEL ACTIVITY',NULL,NULL,'KPI8','Contribution towards Department and Institution (Excluding Mentorship - Mentorship Credits are under HOD Evaluation)',1.5,15),
('S&H','AP2','A','A. Self Appraisal','A3','A3. INVOLVEMENT IN INSTITUTION AND DEPARTMENT LEVEL ACTIVITY',NULL,NULL,'KPI8','Contribution towards Department and Institution (Excluding Mentorship - Mentorship Credits are under HOD Evaluation)',1.5,16),
('S&H','AP1','A','A. Self Appraisal','A4','A4. CONTRIBUTION TOWARDS - SELF AND INSTITUTIONAL DESSEMINATION',NULL,NULL,'KPI9','Continuous updation of self growth / achievements and Institutional events and highlights in social media',2.5,17),
('S&H','AP2','A','A. Self Appraisal','A4','A4. CONTRIBUTION TOWARDS - SELF AND INSTITUTIONAL DESSEMINATION',NULL,NULL,'KPI9','Continuous updation of self growth / achievements and Institutional events and highlights in social media',2.5,18),
('S&H','AP1','B','B. Review based Appraisal','B1','B1. COMPETENCY IN THE COURSES TAUGHT',NULL,NULL,'RPI1','Basic and fundamental knowledge in the course taught',3,19),
('S&H','AP2','B','B. Review based Appraisal','B1','B1. COMPETENCY IN THE COURSES TAUGHT',NULL,NULL,'RPI1','Basic and fundamental knowledge in the course taught',3,20),
('S&H','AP1','B','B. Review based Appraisal','B1','B1. COMPETENCY IN THE COURSES TAUGHT',NULL,NULL,'RPI2','Preparedness and involvement in practical / Integrated / Experiential learning courses',3,21),
('S&H','AP2','B','B. Review based Appraisal','B1','B1. COMPETENCY IN THE COURSES TAUGHT',NULL,NULL,'RPI2','Preparedness and involvement in practical / Integrated / Experiential learning courses',3,22),
('S&H','AP1','B','B. Review based Appraisal','B1','B1. COMPETENCY IN THE COURSES TAUGHT',NULL,NULL,'RPI3','Capability of informing latest developments during content delivery',3,23),
('S&H','AP2','B','B. Review based Appraisal','B1','B1. COMPETENCY IN THE COURSES TAUGHT',NULL,NULL,'RPI3','Capability of informing latest developments during content delivery',3,24),
('S&H','AP1','B','B. Review based Appraisal','B1','B1. COMPETENCY IN THE COURSES TAUGHT',NULL,NULL,'RPI4','Capability of solving GATE/Company level Questions',2,25),
('S&H','AP2','B','B. Review based Appraisal','B1','B1. COMPETENCY IN THE COURSES TAUGHT',NULL,NULL,'RPI4','Capability of solving GATE/Company level Questions',2,26),
('S&H','AP1','B','B. Review based Appraisal','B2','B2. COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS',NULL,NULL,'RPI5','Usage of appropriate content delivery methods',2,27),
('S&H','AP2','B','B. Review based Appraisal','B2','B2. COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS',NULL,NULL,'RPI5','Usage of appropriate content delivery methods',2,28),
('S&H','AP1','B','B. Review based Appraisal','B2','B2. COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS',NULL,NULL,'RPI6','Selection of assessment tools',2,29),
('S&H','AP2','B','B. Review based Appraisal','B2','B2. COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS',NULL,NULL,'RPI6','Selection of assessment tools',2,30),
('S&H','AP1','B','B. Review based Appraisal','B2','B2. COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS',NULL,NULL,'RPI7','Integrating library in course taught',2,31),
('S&H','AP2','B','B. Review based Appraisal','B2','B2. COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS',NULL,NULL,'RPI7','Integrating library in course taught',2,32),
('S&H','AP1','B','B. Review based Appraisal','B2','B2. COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS',NULL,NULL,'RPI8','Practiced Project/Problem based learning skills',2,33),
('S&H','AP2','B','B. Review based Appraisal','B2','B2. COMPETENCY IN SELECTING CONTENT DELIVERY AND ASSESSMENT TOOLS',NULL,NULL,'RPI8','Practiced Project/Problem based learning skills',2,34),
('S&H','AP1','B','B. Review based Appraisal','B3','B3. COMMUNICATION SKILL',NULL,NULL,'RPI9','Clarity in delivering the core content as requirement',1,35),
('S&H','AP2','B','B. Review based Appraisal','B3','B3. COMMUNICATION SKILL',NULL,NULL,'RPI9','Clarity in delivering the core content as requirement',1,36),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H1','Academic Achievements',3,37),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H1','Academic Achievements',3,38),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H2','Slow learners improved',3,39),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H2','Slow learners improved',3,40),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H3','Encouraging students for publish Journals, magazines, newsletters, etc., by the department',2,41),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H3','Encouraging students for publish Journals, magazines, newsletters, etc., by the department',2,42),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H4','Online Courses - NPTEL',2,43),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H4','Online Courses - NPTEL',2,44),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H5','Students progress in Skill rack (75% of the students)',2,45),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H5','Students progress in Skill rack (75% of the students)',2,46),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H6','Encouraging the students to participate in Technical contests like Hackathons/Ideathons',2,47),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H6','Encouraging the students to participate in Technical contests like Hackathons/Ideathons',2,48),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H7','Students participation in Inter / Intra Colleges events',2,49),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H7','Students participation in Inter / Intra Colleges events',2,50),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H8','Maintaining discipline',1,51),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H8','Maintaining discipline',1,52),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H9','Interpersonal relationship',1,53),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H9','Interpersonal relationship',1,54),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H10','Volunteering',1,55),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H10','Volunteering',1,56),
('S&H','AP1','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H11','LMS Monitoring',1,57),
('S&H','AP2','C','C. HOD/Principal Evaluation (HPE)','C1','C.1 Transforming students’ potential as a Tutor',NULL,NULL,'H11','LMS Monitoring',1,58),
('S&H','AP1','D','D. Other Criteria',NULL,NULL,NULL,NULL,'E1','Student feedback (SF)',20,59),
('S&H','AP2','D','D. Other Criteria',NULL,NULL,NULL,NULL,'E1','Student feedback (SF)',20,60);

-- Insert the five rating options for every question.
DROP TABLE IF EXISTS temp_level1_question_map;
CREATE TEMP TABLE temp_level1_question_map AS
SELECT id, designation, group_code FROM questions WHERE department='S&H' AND designation IN ('AP1','AP2') AND group_code IN ('KPI1','KPI2','KPI3','KPI4','KPI5','KPI6','KPI7','KPI8','KPI9','RPI1','RPI2','RPI3','RPI4','RPI5','RPI6','RPI7','RPI8','RPI9','H1','H2','H3','H4','H5','H6','H7','H8','H9','H10','H11','E1');
INSERT INTO options (question_id,text,score,order_index) SELECT id,'5% Topper',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Elite Gold',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Elite Silver',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Elite / >80% score in Non-proctored MOOC courses',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'NPTEL course Completed / 60% to 80% score in Non-proctored MOOC courses',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'At least one at other states Institution under NIRF Ranking / IITs / NITs',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'At least one at Anna University and other premier institutions',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'At least one at Govt / Govt aided institutions',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Undergone one Workshop/Seminar/Conference at autonomous and self financing institutions',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Undergone one Online FDP / at autonomous and self financing institutions',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Successfully progressing, one paper published in journal.',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Progressing, a paper accepted for publication and a paper submitted for publication',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Moderately progressing, a survey paper accepted for publication and a paper submitted for publication',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Not progressing up to the level, a survey paper submitted for publication',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Ph.D. Registered',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Outstanding maintenance with timely submission, complete documentation, and incorporation of continuous improvement suggestions from previous audits',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Positive comments',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'No negative remarks',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Some negative remarks',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Deficiency in documentation',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Teaching methodology was recognized / appreciated and published in Journal',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Teaching methodology was recognized / appreciated and presented in an International/National Conference',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Teaching methodology was recognized / appreciated and published in the institutional website',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Introduced minimum of one methodology, and proper documentation was not made.',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Introduced minimum of one methodology, but proper documentation was not made.',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'95-100%',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'90-95%',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'85-90%',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'80-85%',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'75-80%',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% of text form of content and 100% of Video content for any two CO is available in LMS as well as in social media.',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% of text form of content and 100% of Video content for any one CO is available in LMS as well as in social media',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% of text form of content and 50% of Video content for any one CO is available in LMS as well as in social media',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% of text form of content was developed and available in LMS',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Created only one or two text/video content/ unit',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'In charge in both department and institution level',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Incharge College level committee',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Member in College level committee',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Incharge in Department level',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Member in Department level',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Number of Connections: More than 1200; Number of Posts per year: more than 99; Average Post Responses (Comments + Likes): More than 2499',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Number of Connections: 900 to 1199; Number of Posts per year: 80 to 99; Average Post Responses (Comments + Likes): 2000 to 2499',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Number of Connections: 600 to 899; Number of Posts per year: 60 to 79; Average Post Responses (Comments + Likes): 1500 to 1999',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Number of Connections: 300 to 599; Number of Posts per year: 40 to 59; Average Post Responses (Comments + Likes): 1000 to 1499',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Number of Connections: 100 to 299; Number of Posts per year: 20 to 39; Average Post Responses (Comments + Likes): 500 to 999',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='KPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Capable of clarifying the doubts in the courses effectively',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Capable of delivering the courses effectively',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Profound knowledge by gathering support materials',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Adequate knowledge by referring the text books',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Inadequate knowledge – referring only local author books and notes',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Offering new experiments every year in the level of design of the experiments',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Offering the experiments every year in the level of design of the experiments',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Offering conventional experiments with modern tools like virtual lab, simulation etc.',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducting the conventional experiments with clarity',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Assisting in conducting experiments',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Make the students to read and present research articles relevant to COs/POs',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Make the students to read and discuss research articles relevant to COs/POs',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Informing research status relevant to COs/POs',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Delivering contents beyond curriculum relevant to COs/POs',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Delivering only curriculum contents',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Faculty posts 50+ CO-mapped GATE/company questions in LMS, solves complex problems in every class, assigns weekly challenging assessments, and maintains comprehensive question banks covering all COs with varied difficulty levels.',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Faculty posts 35-49 CO-mapped GATE/company questions in LMS, solves 2-3 problems per class, assigns regular moderate-level homework, and covers 80%+ COs with proper categorization and solutions.',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Faculty posts 25-34 CO-mapped GATE/company questions in LMS, demonstrates problem-solving in 50%+ classes, assigns periodic basic-to-moderate problems, and covers major COs with standard solution approaches.',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Faculty posts 15-24 CO-mapped GATE/company questions in LMS, occasionally solves problems in class, assigns simple problems as assignments, and covers essential COs with basic explanations.',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Faculty posts 5-14 CO-mapped GATE/company questions in LMS, demonstrates fundamental problem-solving in selected classes, assigns elementary problems occasionally, and covers core COs with simple solutions.',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Innovative content delivery methods declared/presented',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Effective use of active and hybrid learning methods',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conventional methods & appropriate other tools',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conventional methods & quality demonstration',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Lectures and tutorials (Conventional)',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Innovative assessment methods declared / presented',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conventional methods & uncontrolled tests / open book test',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conventional methods & appropriate other tools',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conventional methods & quality assignments',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'IAT and tutorials (Conventional)',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted more than one time-bounded quality assessment (Assignments, Open book test, etc.) utilizing library resources; resources were given, evaluated and feedback on library integration was obtained.',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted one time-bounded quality assessment (Assignments, Open book test, etc.) utilizing library resources; resources were given, evaluated and feedback on library integration was obtained.',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted one time-bounded quality assessment (Assignments, Open book test, etc.) utilizing library resources; resources were given and evaluated.',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted instruction sessions in library using the library resources.',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Embedded NEC and Anna University e-library books/references in the NEC LMS course page',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted and evaluated more than one Project/Problem based learning activities planned for the course taught. Also identified the strengths and weaknesses of the students.',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted and evaluated at least one Project/Problem based learning activity planned for the course taught. Also identified the strengths and weaknesses of the students.',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted and evaluated at least one Project/Problem based learning activity planned for the course taught.',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted at least one Project/Problem based learning activity planned for the course taught.',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Project/Problem based learning activities were planned for the course taught and respective activity was mentioned in the course plan',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Clear articulation with enthusiasm and confidence',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Poised and clear articulation; proper volume and steady rate',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Clear articulation but not as polished',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Some mumbling; uneven rate; little or no expression',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Inaudible or too loud; slow/too fast delivery; uninterested and monotonic',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='RPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making more than 90% the students to achieve the allotted CGPAs',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making more than 80% the students to achieve the allotted CGPAs',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making more than 70% the students to achieve the allotted CGPAs',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making more than 60% the students to achieve the allotted CGPAs',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making more than 50% the students to achieve the allotted CGPAs',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Identified and improved the performances of all slow learners',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Identified and improved the performances of 50% slow learners',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Identified and improved the performances of 25% slow learners',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Identified all slow learners and efforts taken',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Only identified the slow learners',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 50% of the targeted students to publish the articles',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 40% of the targeted students to publish the articles',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 30% of the targeted students to publish the articles',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 20% of the targeted students to publish the articles',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 10% of the targeted students to publish the articles',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% participation and 10% Elite Silver',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% participation and 50% Elite',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% participation and 30% Elite',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% participation and 75% successfully Completed',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% participation',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Solved 600 programs',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Solved 500 programs',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Solved 400 programs',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Solved 300 programs',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Solved 200 programs',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making all the targeted students to achieve',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 80% of the targeted students to achieve',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 60% of the targeted students to achieve',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 40% of the targeted students to achieve',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 20% of the targeted students to achieve',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'25% Won Prize in Inter',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'15% won Prize in inter and 90% (intra and Inter) Participation',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100 % (intra and Inter) Participation only',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'75 % (intra and Inter) Participation only',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'50% (intra and Inter) Participation only',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Excellent',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Very good',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Good',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Satisfactory',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Low',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Excellent',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Very good',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Good',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Satisfactory',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Low',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Excellent',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H10';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Very good',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H10';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Good',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H10';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Satisfactory',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H10';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Low',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H10';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Excellent',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H11';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Very good',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H11';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Good',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H11';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Satisfactory',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H11';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Low',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='H11';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'90-100%',5,0 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='E1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'80-90%',4,1 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='E1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'70-80%',3,2 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='E1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'60-70%',2,3 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='E1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'50-60%',1,4 FROM temp_level1_question_map WHERE designation='AP1' AND group_code='E1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'5% Topper',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Elite Gold',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Elite Silver',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Elite / >80% score in Non-proctored MOOC courses',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'NPTEL course Completed / 60% to 80% score in Non-proctored MOOC courses',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'At least one at other states Institution under NIRF Ranking / IITs / NITs',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'At least one at Anna University and other premier institutions',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'At least one at Govt / Govt aided institutions',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Undergone one Workshop/Seminar/Conference at autonomous and self financing institutions',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Undergone one Online FDP / at autonomous and self financing institutions',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Successfully progressing, one paper published in journal.',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Progressing, a paper accepted for publication and a paper submitted for publication',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Moderately progressing, a survey paper accepted for publication and a paper submitted for publication',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Not progressing up to the level, a survey paper submitted for publication',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Ph.D. Registered',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Outstanding maintenance with timely submission, complete documentation, and incorporation of continuous improvement suggestions from previous audits',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Positive comments',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'No negative remarks',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Some negative remarks',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Deficiency in documentation',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Teaching methodology was recognized / appreciated and published in Journal',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Teaching methodology was recognized / appreciated and presented in an International/National Conference',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Teaching methodology was recognized / appreciated and published in the institutional website',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Introduced minimum of one methodology, and proper documentation was not made.',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Introduced minimum of one methodology, but proper documentation was not made.',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'95-100%',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'90-95%',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'85-90%',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'80-85%',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'75-80%',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% of text form of content and 100% of Video content for any two CO is available in LMS as well as in social media.',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% of text form of content and 100% of Video content for any one CO is available in LMS as well as in social media',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% of text form of content and 50% of Video content for any one CO is available in LMS as well as in social media',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% of text form of content was developed and available in LMS',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Created only one or two text/video content/ unit',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'In charge in both department and institution level',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Incharge College level committee',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Member in College level committee',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Incharge in Department level',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Member in Department level',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Number of Connections: More than 1200; Number of Posts per year: more than 99; Average Post Responses (Comments + Likes): More than 2499',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Number of Connections: 900 to 1199; Number of Posts per year: 80 to 99; Average Post Responses (Comments + Likes): 2000 to 2499',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Number of Connections: 600 to 899; Number of Posts per year: 60 to 79; Average Post Responses (Comments + Likes): 1500 to 1999',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Number of Connections: 300 to 599; Number of Posts per year: 40 to 59; Average Post Responses (Comments + Likes): 1000 to 1499',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Number of Connections: 100 to 299; Number of Posts per year: 20 to 39; Average Post Responses (Comments + Likes): 500 to 999',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='KPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Capable of clarifying the doubts in the courses effectively',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Capable of delivering the courses effectively',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Profound knowledge by gathering support materials',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Adequate knowledge by referring the text books',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Inadequate knowledge – referring only local author books and notes',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Offering new experiments every year in the level of design of the experiments',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Offering the experiments every year in the level of design of the experiments',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Offering conventional experiments with modern tools like virtual lab, simulation etc.',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducting the conventional experiments with clarity',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Assisting in conducting experiments',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Make the students to read and present research articles relevant to COs/POs',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Make the students to read and discuss research articles relevant to COs/POs',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Informing research status relevant to COs/POs',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Delivering contents beyond curriculum relevant to COs/POs',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Delivering only curriculum contents',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Faculty posts 50+ CO-mapped GATE/company questions in LMS, solves complex problems in every class, assigns weekly challenging assessments, and maintains comprehensive question banks covering all COs with varied difficulty levels.',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Faculty posts 35-49 CO-mapped GATE/company questions in LMS, solves 2-3 problems per class, assigns regular moderate-level homework, and covers 80%+ COs with proper categorization and solutions.',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Faculty posts 25-34 CO-mapped GATE/company questions in LMS, demonstrates problem-solving in 50%+ classes, assigns periodic basic-to-moderate problems, and covers major COs with standard solution approaches.',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Faculty posts 15-24 CO-mapped GATE/company questions in LMS, occasionally solves problems in class, assigns simple problems as assignments, and covers essential COs with basic explanations.',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Faculty posts 5-14 CO-mapped GATE/company questions in LMS, demonstrates fundamental problem-solving in selected classes, assigns elementary problems occasionally, and covers core COs with simple solutions.',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Innovative content delivery methods declared/presented',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Effective use of active and hybrid learning methods',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conventional methods & appropriate other tools',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conventional methods & quality demonstration',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Lectures and tutorials (Conventional)',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Innovative assessment methods declared / presented',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conventional methods & uncontrolled tests / open book test',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conventional methods & appropriate other tools',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conventional methods & quality assignments',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'IAT and tutorials (Conventional)',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted more than one time-bounded quality assessment (Assignments, Open book test, etc.) utilizing library resources; resources were given, evaluated and feedback on library integration was obtained.',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted one time-bounded quality assessment (Assignments, Open book test, etc.) utilizing library resources; resources were given, evaluated and feedback on library integration was obtained.',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted one time-bounded quality assessment (Assignments, Open book test, etc.) utilizing library resources; resources were given and evaluated.',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted instruction sessions in library using the library resources.',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Embedded NEC and Anna University e-library books/references in the NEC LMS course page',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted and evaluated more than one Project/Problem based learning activities planned for the course taught. Also identified the strengths and weaknesses of the students.',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted and evaluated at least one Project/Problem based learning activity planned for the course taught. Also identified the strengths and weaknesses of the students.',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted and evaluated at least one Project/Problem based learning activity planned for the course taught.',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Conducted at least one Project/Problem based learning activity planned for the course taught.',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Project/Problem based learning activities were planned for the course taught and respective activity was mentioned in the course plan',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Clear articulation with enthusiasm and confidence',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Poised and clear articulation; proper volume and steady rate',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Clear articulation but not as polished',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Some mumbling; uneven rate; little or no expression',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Inaudible or too loud; slow/too fast delivery; uninterested and monotonic',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='RPI9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making more than 90% the students to achieve the allotted CGPAs',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making more than 80% the students to achieve the allotted CGPAs',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making more than 70% the students to achieve the allotted CGPAs',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making more than 60% the students to achieve the allotted CGPAs',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making more than 50% the students to achieve the allotted CGPAs',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Identified and improved the performances of all slow learners',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Identified and improved the performances of 50% slow learners',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Identified and improved the performances of 25% slow learners',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Identified all slow learners and efforts taken',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Only identified the slow learners',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H2';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 50% of the targeted students to publish the articles',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 40% of the targeted students to publish the articles',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 30% of the targeted students to publish the articles',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 20% of the targeted students to publish the articles',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 10% of the targeted students to publish the articles',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H3';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% participation and 10% Elite Silver',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% participation and 50% Elite',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% participation and 30% Elite',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% participation and 75% successfully Completed',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100% participation',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H4';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Solved 600 programs',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Solved 500 programs',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Solved 400 programs',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Solved 300 programs',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Solved 200 programs',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H5';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making all the targeted students to achieve',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 80% of the targeted students to achieve',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 60% of the targeted students to achieve',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 40% of the targeted students to achieve',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Making 20% of the targeted students to achieve',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H6';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'25% Won Prize in Inter',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'15% won Prize in inter and 90% (intra and Inter) Participation',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'100 % (intra and Inter) Participation only',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'75 % (intra and Inter) Participation only',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'50% (intra and Inter) Participation only',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H7';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Excellent',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Very good',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Good',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Satisfactory',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Low',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H8';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Excellent',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Very good',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Good',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Satisfactory',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Low',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H9';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Excellent',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H10';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Very good',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H10';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Good',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H10';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Satisfactory',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H10';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Low',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H10';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Excellent',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H11';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Very good',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H11';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Good',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H11';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Satisfactory',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H11';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'Low',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='H11';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'90-100%',5,0 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='E1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'80-90%',4,1 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='E1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'70-80%',3,2 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='E1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'60-70%',2,3 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='E1';
INSERT INTO options (question_id,text,score,order_index) SELECT id,'50-60%',1,4 FROM temp_level1_question_map WHERE designation='AP2' AND group_code='E1';

DROP TABLE IF EXISTS temp_level1_question_map;
COMMIT;

-- IMPORT SUMMARY
-- Criteria: 30
-- Questions: 60 (30 criteria x AP1/AP2)
-- Rating options: 300 (60 x 5)
-- Document weightage total: 80
-- Existing backend scoring/authentication/routes are not changed by this file.
-- The uploaded document's FPI formula is not altered or 'corrected' here.