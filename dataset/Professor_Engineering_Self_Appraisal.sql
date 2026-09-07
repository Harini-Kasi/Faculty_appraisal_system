-- Engineering / Professor appraisal dataset
-- Source: Professor as on 24.10.2024.docx
-- Source-derived KPI1-KPI20 self-appraisal criteria; wording preserved.
-- Department: Engineering | Designation: Professor
--
-- IMPORTANT: This script replaces only the Engineering/Professor
-- self-appraisal question set (A-D) and its options.
-- E1/E2 in the source document are HOD/Principal evaluation criteria,
-- not faculty self-appraisal questions, so they are intentionally NOT
-- inserted into the faculty question set by this script.

BEGIN TRANSACTION;

DELETE FROM options WHERE question_id IN (
  SELECT id FROM questions WHERE department = 'Engineering' AND designation = 'Professor'
);
DELETE FROM questions WHERE department = 'Engineering' AND designation = 'Professor';

-- KPI1
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'A', 'A. Self Appraisal', 'A-1', 'A-1 Knowledge / Skill Development', 'A1.1', 'A1.1 Knowledge / Skill Development', 'Active participation in FDP/ STTP / Workshop relevant to the courses taught / in their areas of specialization/teaching pedagogy through NPTEL', 1, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Participation in 6 days FDP/ STTP/ Seminar/Workshop at IITs/ NITs in offline mode and organizing value added course/ workshop relevant to the programme', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Participation in 6 days FDP/ STTP/ Seminar/ Workshop at Institutions other than IITs/NITs in offline mode and organizing value added course/ workshop relevant to the programme', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Participation in 6 days FDP/ STTP/ Seminar/ Workshop in online mode and organizing value added course/ workshop relevant to the programme', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Participation in 6 days FDP/ STTP/ Seminar/ Workshop at IITs / NITs (Online / Offline)', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Participation in 6 days FDP/ STTP/ Seminar/ Workshop at Institutions other than IITs/ NITs (Online/ Offline)', 1, 4);

-- KPI2
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'A', 'A. Self Appraisal', 'A-1', 'A-1 Knowledge / Skill Development', 'A1.1', 'A1.1 Knowledge / Skill Development', 'Industry know-how / Research fellowship undergone in their area of specialization', 1, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Attended 3/5 days industry know-how program and as a outcome introduced a one credit course/ value added course/MOU signed with company in which Industry Know-How Program undergone Or Attended research fellowship at IIT/NITs/IISC and collaborated SCI paper submission/preparation with IIT/ NIT/IISC mentor', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Attended 3/5 days industry know-how program and as a outcome offered workshop/seminar with the support of the industry Or Attended research fellowship at IIT/NITs/IISC', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Attended 5 days industry know-how program', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Attended 3 days industry know-how program', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Attended 2 days industry know-how program', 1, 4);

-- KPI3
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'A', 'A. Self Appraisal', 'A-2', 'A-2 Research and Development', 'A2.1', 'A2.1 Research and Development', 'No. of publications', 1.5, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Three SCI indexed Journals -Published', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Two SCI indexed journal - Published', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'One SCI indexed journal - Published', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'One SCI indexed journal - Accepted for publication', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Two SCI indexed journal- under review', 1, 4);

-- KPI4
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'A', 'A. Self Appraisal', 'A-2', 'A-2 Research and Development', 'A2.1', 'A2.1 Research and Development', 'Publications- Impact Factor', 1.5, 4);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Any one published journal with impact factor more than 3 or Q1 Journal', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Any one published journal with impact factor (IF) 2.51 ≤ IF ≤ 3.00 or Q2 journal', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Any one published journal with impact factor (IF) 2.10≤ IF ≤ 2.50', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Any one published journal with impact factor (IF) 1.00≤ IF ≤ 2.09', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Any one published journal with impact factor (IF) 0.10≤ IF ≤ 0.99', 1, 4);

-- KPI5
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'A', 'A. Self Appraisal', 'A-2', 'A-2 Research and Development', 'A2.1', 'A2.1 Research and Development', 'No of research scholars (FT/PT)', 1, 5);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Produced at least one Full-time PhD within 3 years from registration', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Produced at least one PhD within 5 years from registration', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Guiding at least 1 full time scholar and 1 part time research scholar', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Guiding at least 2 part time research scholars or 1 full time research scholar', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Guiding at least 1 part time research scholar', 1, 4);

-- KPI6
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'A', 'A. Self Appraisal', 'A-2', 'A-2 Research and Development', 'A2.1', 'A2.1 Research and Development', 'Patents filed', 1, 6);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Patent granted', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Examination Over', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Patent published', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Patent filed', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Draft prepared and ready for filing', 1, 4);

-- KPI7
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'A', 'A. Self Appraisal', 'A-2', 'A-2 Research and Development', 'A2.1', 'A2.1 Research and Development', 'H-index (Scopus)', 1, 7);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '6 and More than 6', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '5', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '4', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '3', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '2', 1, 4);

-- KPI8
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'A', 'A. Self Appraisal', 'A-2', 'A-2 Research and Development', 'A2.1', 'A2.1 Research and Development', 'Worth of on-going research projects including seed money', 1.5, 8);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received funding worth more than 10 Lakhs', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received funding worth 7.01 Lakhs ≤ amount ≤ 10.00 Lakhs', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received funding worth 5.01 Lakhs≤ amount ≤ 7.00 Lakhs', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received funding worth 0.10 Lakhs≤ amount ≤ 5.00 Lakhs', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'one project proposal submission', 1, 4);

-- KPI9
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'A', 'A. Self Appraisal', 'A-2', 'A-2 Research and Development', 'A2.1', 'A2.1 Research and Development', 'Worth of consultancy services', 1, 9);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received funding worth more than 1 Lakh', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received funding worth 0.51 Lakh≤ amount ≤ 1.00 Lakh', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received funding worth 0.26 Lakh≤ amount ≤ 0.50Lakh', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received funding worth 0.05 Lakh≤ amount ≤ 0.25 Lakh', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Interacted with companies and Process initiated', 1, 4);

-- KPI10
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'B', 'B. Academic Contribution', 'B-1', 'B-1 Academic Contribution', 'B1.1', 'B1.1 Academic Contribution', 'E-Content Development and Learning repository', 0.5, 10);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '100% of text form of content and 100% of Video content for any two COs is available in LMS as well as in social media.', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '100% of text form of content and 100% of Video content for any one CO is available in LMS as well as in social media', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '100% of text form of content and 50% of Video content for any one CO is available in LMS as well as in social media', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '100% of text form of content was developed and available in LMS', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Created only one or two text / video content / unit', 1, 4);

-- KPI11
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'B', 'B. Academic Contribution', 'B-1', 'B-1 Academic Contribution', 'B1.1', 'B1.1 Academic Contribution', 'Student Projects/ Product development activities', 1, 11);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received Funds worth more than 0.5 Lakh', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received Funds worth 0.26 Lakh≤ amount ≤ 0.50 Lakh', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received Funds worth 0.11 Lakh≤ amount ≤ 0.25 Lakh', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Received Funds worth 0.01 Lakh≤ amount ≤ 0.10 Lakh', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Submission of proposal for project/ Product for funding', 1, 4);

-- KPI12
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'B', 'B. Academic Contribution', 'B-1', 'B-1 Academic Contribution', 'B1.1', 'B1.1 Academic Contribution', 'Students’ Publications', 1, 12);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '2 papers published in Scopus indexed journal', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '1 paper published in Scopus indexed Journals', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '2 papers presented in Scopus indexed Inter-National Conference', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '1 paper presented in Scopus indexed Inter-National Conference', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), '1 paper presented in Inter National Conference', 1, 4);

-- KPI13
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'C', 'C. Outreach Programs', 'C-1', 'C-1 Outreach Programs', 'C1.1', 'C1.1 Outreach Programs', 'Disseminating knowledge and skills', 1, 13);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'IIT/ NIT/IISC (online/offline) Or Reputed Institutions outside Tamil Nadu (offline)', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Reputed Institutions in Tamil Nadu (offline)', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Reputed Institutions in south Tamil Nadu (offline)', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Institutions in Tamil Nadu (offline) Or Attending Seminar/ Conference in Premier Institutions as delegates', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'School/college in Tamil Nadu (offline)', 1, 4);

-- KPI14
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'C', 'C. Outreach Programs', 'C-1', 'C-1 Outreach Programs', 'C1.1', 'C1.1 Outreach Programs', 'Disseminating self, department and institutional activities / achievement through social media (LinkedIn)', 1, 14);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Disseminating self, department and institutional activities / achievement through social media (LinkedIn and Instagram / Facebook)', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Maintain an active LinkedIn and Instagram/Facebook account by regularly sharing and liking all NEC-related social media posts and Number of LinkedIn posts by faculty about NEC activities in the past 365 days (LNP) ≥40 and LinkedIn Followers (LF) ≥ 75 (Asso. Prof & Prof)', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Maintain an active LinkedIn and Instagram/Facebook account by regularly sharing and liking all NEC-related social media posts and Number of LinkedIn posts by faculty about NEC activities in the past 365 days 25≤ LNP≤39 and LinkedIn Followers: 50≤ LF ≤74 (Asso. Prof & Prof)', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Maintain an active LinkedIn and Instagram/Facebook account by regularly sharing and liking all NEC-related social media posts and Number of LinkedIn posts by faculty about NEC activities in the past 365 days 12≤ LNP≤24 and LinkedIn Followers: 25 ≤ LF ≤49 (Asso. Prof & Prof)', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Maintain an active LinkedIn and Instagram/Facebook account by regularly sharing and liking all NEC-related social media posts', 1, 4);

-- KPI15
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'C', 'C. Outreach Programs', 'C-1', 'C-1 Outreach Programs', 'C1.1', 'C1.1 Outreach Programs', 'No. of Inter-Institutional Collaborations', 1, 15);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'One SCI indexed journal Publication', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Research project proposal submission', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Book Publication', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Book chapter publication', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Initiated', 1, 4);

-- KPI16
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'C', 'C. Outreach Programs', 'C-1', 'C-1 Outreach Programs', 'C1.1', 'C1.1 Outreach Programs', 'Foreign country visited for collaborative work', 0.5, 16);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Visited', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Process on going', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Took initiatives for visit', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Got approved to visit', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Understand the needs and preparing', 1, 4);

-- KPI17
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'D', 'D. Team building and Leadership Skills', 'D-1', 'D-1 Team building and Leadership Skills', 'D1.1', 'D1.1 Team building and Leadership Skills', 'Contribution to department and institution', 1, 17);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Incharge and member , vice versa in both department level and institution level (Association , technical, and non-technical club member , BOS, COE, Placement coordinator, ERP', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Member in both department level and institution level (Association , technical, and non-technical club member , BOS, COE,Placement coordinator, ERP', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Coordinator, convener in institutional level committee (College day, graduation day, any other programme)', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Member in institutional level committee (College day, graduation day, any other programme)', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Member in department level committee (FDP, conference, workshop)', 1, 4);

-- KPI18
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'D', 'D. Team building and Leadership Skills', 'D-1', 'D-1 Team building and Leadership Skills', 'D1.1', 'D1.1 Team building and Leadership Skills', 'Training programs organized', 1, 18);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'ATAL/ GIAN/Anna University sponsored one week FDP', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'One-week Workshops/Seminars/FDP/STTP with funding', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Two days Workshops/Seminars/FDP/STTP –with funding', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Two days Workshops/Seminars/FDP/STTP –self supporting', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'One day Workshops/Seminars/FDP/STTP –self supporting', 1, 4);

-- KPI19
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'D', 'D. Team building and Leadership Skills', 'D-1', 'D-1 Team building and Leadership Skills', 'D1.1', 'D1.1 Team building and Leadership Skills', 'No. of. Special Lab/ Centre of Excellence/research facility as individual or as member of team through seed money or research grant.', 1, 19);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Established in the current Academic year', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Established in the previous academic years and Two activities (Publication / Faculty workshop/ training to industry)', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Established in the previous academic years and one activity (Publication /Faculty workshop / training to industry)', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Got approved', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Initiatives Taken', 1, 4);

-- KPI20
INSERT INTO questions (department, designation, section_code, section_label, subsection_code, subsection_label, group_code, group_label, text, weightage, order_index) VALUES ('Engineering', 'Professor', 'D', 'D. Team building and Leadership Skills', 'D-1', 'D-1 Team building and Leadership Skills', 'D1.1', 'D1.1 Team building and Leadership Skills', 'Facilities Created like collaborative lab, Technobation etc.', 0.5, 20);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'International Institutions/Universities', 5, 0);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Private Sectors', 4, 1);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Medium scale Industries', 3, 2);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Small scale Industries', 2, 3);
INSERT INTO options (question_id, text, score, order_index) VALUES (last_insert_rowid(), 'Initiated', 1, 4);

COMMIT;

-- Dataset summary: 20 faculty self-appraisal KPIs, 100 rating options.
-- Each question has its own options linked by question_id.
-- Weightage (WF) is stored in questions.weightage.
-- The current application must use that field in its scoring logic if WF-weighted scoring is required.