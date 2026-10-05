// Question Builder only has Engineering and S&H
export const QUESTION_BUILDER_DEPARTMENTS = [
  { value: "Engineering", label: "Engineering" },
  { value: "S&H", label: "Science & Humanities (S&H)" },
];

// Performance Analytics & Submissions have specific departments
export const ANALYTICS_DEPARTMENTS = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "ECE", label: "Electronics & Communication (ECE)" },
  { value: "EEE", label: "Electrical & Electronics (EEE)" },
  { value: "Mechanical", label: "Mechanical Engineering" },
  { value: "Civil", label: "Civil Engineering" },
  { value: "S&H", label: "Science & Humanities (S&H)" },
];

export const DEPARTMENTS = ANALYTICS_DEPARTMENTS;

export const DESIGNATIONS = [
  { value: "AP1", label: "Assistant Professor I (AP1)" },
  { value: "AP2", label: "Assistant Professor II (AP2)" },
  { value: "AP3", label: "Assistant Professor III (AP3)" },
  { value: "APSG", label: "Assistant Professor Senior Grade (APSG)" },
  { value: "Associate Professor", label: "Associate Professor" },
  { value: "Professor", label: "Professor" },
];
