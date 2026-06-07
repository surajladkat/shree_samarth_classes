/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AdminUser, 
  TeacherUser, 
  StudentUser, 
  ParentUser, 
  StudyMaterial, 
  Assignment, 
  Submission, 
  CommunicationMessage, 
  Notification, 
  ActivityLog,
  AttendanceRecord
} from './types';
import { encryptData } from './cryptoUtils';

export const DEFAULT_ADMIN: AdminUser = {
  id: 'usr-admin-1',
  username: 'admin',
  name: 'Director Sarah Jenkins',
  role: 'ADMIN',
  createdAt: '2026-01-10T08:00:00Z',
};

export const DEFAULT_TEACHERS: TeacherUser[] = [
  {
    id: 'usr-teach-1',
    username: 'teach-sharma',
    name: 'Dr. Alok Sharma',
    role: 'TEACHER',
    subjects: ['Mathematics', 'Physics'],
    classes: ['9th', '10th', '11th', '12th'],
    createdAt: '2026-01-12T09:00:00Z'
  },
  {
    id: 'usr-teach-2',
    username: 'teach-baker',
    name: 'Mrs. Emily Baker',
    role: 'TEACHER',
    subjects: ['English Literature', 'History'],
    classes: ['9th', '10th', '11th'],
    createdAt: '2026-01-15T11:30:00Z'
  }
];

export const DEFAULT_STUDENTS: StudentUser[] = [
  {
    id: 'usr-stu-1',
    username: 'stu26-9-105',
    name: 'Arjun Mehta',
    role: 'STUDENT',
    classGrade: '9th',
    parentId: 'usr-par-1',
    studentIdCardNum: 'STU-9-2026-085',
    createdAt: '2026-02-01T08:30:00Z',
    totalFee: 15000,
    paidFee: 12000,
    pendingFee: 3000,
    paymentStatus: 'PARTIAL'
  },
  {
    id: 'usr-stu-2',
    username: 'stu26-10-244',
    name: 'Sophia Chen',
    role: 'STUDENT',
    classGrade: '10th',
    parentId: 'usr-par-2',
    studentIdCardNum: 'STU-10-2026-120',
    createdAt: '2026-02-01T08:45:00Z',
    totalFee: 18000,
    paidFee: 18000,
    pendingFee: 0,
    paymentStatus: 'PAID'
  },
  {
    id: 'usr-stu-3',
    username: 'stu26-11-731',
    name: 'Marcus Vance',
    role: 'STUDENT',
    classGrade: '11th',
    parentId: 'usr-par-3',
    studentIdCardNum: 'STU-11-2026-042',
    createdAt: '2026-02-02T10:15:00Z',
    totalFee: 22000,
    paidFee: 10000,
    pendingFee: 12000,
    paymentStatus: 'PARTIAL'
  },
  {
    id: 'usr-stu-4',
    username: 'stu26-12-902',
    name: 'Priyanka Nair',
    role: 'STUDENT',
    classGrade: '12th',
    parentId: 'usr-par-4',
    studentIdCardNum: 'STU-12-2026-003',
    createdAt: '2026-02-02T11:00:00Z',
    totalFee: 25000,
    paidFee: 0,
    pendingFee: 25000,
    paymentStatus: 'PENDING'
  },
  {
    id: 'usr-stu-5',
    username: 'stu26-Library-402',
    name: 'Kabir Das',
    role: 'STUDENT',
    classGrade: 'Library',
    studentIdCardNum: 'STU-Library-2026-402',
    seatNumber: 'Seat-12',
    benchNumber: 'Bench-A4',
    createdAt: '2026-02-03T09:00:00Z',
    totalFee: 5000,
    paidFee: 5000,
    pendingFee: 0,
    paymentStatus: 'PAID'
  }
];

export const DEFAULT_PARENTS: ParentUser[] = [
  {
    id: 'usr-par-1',
    username: 'par26-9-105',
    name: 'Ramesh Mehta',
    role: 'PARENT',
    childId: 'usr-stu-1',
    childName: 'Arjun Mehta',
    childClass: '9th',
    relationship: 'Father',
    mobileNumber: '9876543210',
    createdAt: '2026-02-01T08:40:00Z'
  },
  {
    id: 'usr-par-2',
    username: 'par26-10-244',
    name: 'Min Chen',
    role: 'PARENT',
    childId: 'usr-stu-2',
    childName: 'Sophia Chen',
    childClass: '10th',
    relationship: 'Mother',
    mobileNumber: '9123456780',
    createdAt: '2026-02-01T08:50:00Z'
  },
  {
    id: 'usr-par-3',
    username: 'par26-11-731',
    name: 'David Vance',
    role: 'PARENT',
    childId: 'usr-stu-3',
    childName: 'Marcus Vance',
    childClass: '11th',
    relationship: 'Father',
    mobileNumber: '9234567891',
    createdAt: '2026-02-02T10:20:00Z'
  },
  {
    id: 'usr-par-4',
    username: 'par26-12-902',
    name: 'Latha Nair',
    role: 'PARENT',
    childId: 'usr-stu-4',
    childName: 'Priyanka Nair',
    childClass: '12th',
    relationship: 'Mother',
    mobileNumber: '9345678912',
    createdAt: '2026-02-02T11:15:00Z'
  }
];

// Encrypted files content
export const DEFAULT_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Algebra and Quadratic Equations',
    description: 'Detailed study handbook containing standard formulas, derivations, and practice problems.',
    classGrade: '9th',
    subject: 'Mathematics',
    fileName: 'algebra_quadratics_formulas.pdf',
    fileSize: '4.2 MB',
    fileContent: encryptData('Symmetric Polynomial Definitions: \nFor ax^2 + bx + c = 0, roots are α and β.\nSum of roots: α + β = -b/a\nProduct of roots: αβ = c/a.\nDiscriminant Δ = b^2 - 4ac.\nIf Δ > 0: Real and distinct roots.\nIf Δ = 0: Real and equal roots.\nIf Δ < 0: Complex conjugate roots.\nStandard Equations, quadratic forms, and 50 practice problems for the exam.'),
    uploadedBy: 'Dr. Alok Sharma',
    uploadedAt: '2026-05-15T09:15:00Z'
  },
  {
    id: 'mat-2',
    title: 'Mechanics and Laws of Motion',
    description: 'Lecture notes covering Newton\'s three laws with practical real-world scenarios.',
    classGrade: '11th',
    subject: 'Physics',
    fileName: 'newtonian_mechanics_101.pdf',
    fileSize: '3.8 MB',
    fileContent: encryptData('First Law: Inertia of state. A body continues in state of rest/uniform motion unless acted upon by external unbalanced force.\nSecond Law: F = dp/dt = m*a.\nThird Law: To every action there is an equal and opposite reaction.\nIncludes visual free body diagram formulas and calculations for inclined surfaces.'),
    uploadedBy: 'Dr. Alok Sharma',
    uploadedAt: '2026-05-18T14:30:00Z'
  },
  {
    id: 'mat-3',
    title: 'Thermodynamics and Kinetic Theory',
    description: 'Advanced reference sheets for thermodynamic engines, entropy, and ideal gas behavior.',
    classGrade: '12th',
    subject: 'Physics',
    fileName: 'thermodynamics_advanced.pdf',
    fileSize: '5.1 MB',
    fileContent: encryptData('Zeroth Law: Thermal Equilibrium.\nFirst Law: dQ = dU + dW (Conservation of energy).\nSecond Law: Entropy of isolated system never decreases. Carnot efficiency η = 1 - Tc/Th.\nKinetic Theory of Gases: P = (1/3) * ρ * v_rms^2.\nIdeal Gas Law: PV = nRT.'),
    uploadedBy: 'Dr. Alok Sharma',
    uploadedAt: '2026-05-22T10:00:00Z'
  },
  {
    id: 'mat-4',
    title: 'The Age of Industrialization Study Pack',
    description: 'Compendium of key events, timeline of factories, and economic structural shifts in Europe.',
    classGrade: '10th',
    subject: 'History',
    fileName: 'industrial_rev_guide.pdf',
    fileSize: '2.5 MB',
    fileContent: encryptData('Timeline: \n1730s: Earliest factories established in England.\n1760s: Arkwright patents water frame.\n1780s: Steam engine adapted in textile mills by James Watt.\nKey Concepts: Proto-industrialization, guilds, hand labor vs. steam, and urbanization effects.'),
    uploadedBy: 'Mrs. Emily Baker',
    uploadedAt: '2026-05-24T11:10:00Z'
  }
];

export const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    title: 'Polynomial Division and Remainder Theorem',
    description: 'Solve problems on synthetic division, remainder theorem, and factorizing higher-degree polynomials.',
    classGrade: '9th',
    subject: 'Mathematics',
    dueDate: '2026-06-03T18:00:00Z',
    uploadedBy: 'usr-teach-1',
    teacherName: 'Dr. Alok Sharma',
    uploadedAt: '2026-05-25T10:00:00Z'
  },
  {
    id: 'asg-2',
    title: 'Coulomb\'s Law and Core Electrostatics',
    description: 'Find electrostatic net force on a system of charged vertices. Show clean derivation diagrams.',
    classGrade: '12th',
    subject: 'Physics',
    dueDate: '2026-06-05T18:00:00Z',
    uploadedBy: 'usr-teach-1',
    teacherName: 'Dr. Alok Sharma',
    uploadedAt: '2026-05-26T08:30:00Z'
  },
  {
    id: 'asg-3',
    title: 'Analysis of Shakespeare\'s Macbeth Soliloquies',
    description: 'Write a 1000-word essay evaluating the internal psychological journey and symbolism of dagger speech.',
    classGrade: '11th',
    subject: 'English Literature',
    dueDate: '2026-06-02T23:59:00Z',
    uploadedBy: 'usr-teach-2',
    teacherName: 'Mrs. Emily Baker',
    uploadedAt: '2026-05-23T14:00:00Z'
  }
];

export const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    assignmentId: 'asg-3',
    assignmentTitle: 'Analysis of Shakespeare\'s Macbeth Soliloquies',
    studentId: 'usr-stu-3', // Marcus Vance
    studentName: 'Marcus Vance',
    classGrade: '11th',
    submittedAt: '2026-05-27T15:20:00Z',
    submittedContent: encryptData('Macbeth\'s "Is this a dagger which I see before me" soliloquy illustrates his extreme cognitive dissonance, mental fracturing and moral decomposition. The "dagger of the mind" signifies both the deep temptation to commit regicide and the acute guilt already plaguing his heart. Shakespeare uses dark visceral imagery like "gouts of blood" to forecast the irreversible carnage he is about to unleash on Scotland.', 'SCHOOL_SECRET_KEY'),
    status: 'GRADED',
    grade: 'A-',
    feedback: 'Excellent critical perspective. Your analysis of Macbeth\'s cognitive dissonance is incredibly articulate and mature.'
  },
  {
    id: 'sub-2',
    assignmentId: 'asg-1',
    assignmentTitle: 'Polynomial Division and Remainder Theorem',
    studentId: 'usr-stu-1', // Arjun Mehta
    studentName: 'Arjun Mehta',
    classGrade: '9th',
    submittedAt: '2026-05-27T16:45:00Z',
    submittedContent: encryptData('Question 1: Find remainder of P(x) = 2x^3 - 3x^2 + 4x - 5 divided by (x - 2).\nBy Remainder Theorem, Remainder = P(2).\nP(2) = 2(8) - 3(4) + 4(2) - 5 = 16 - 12 + 8 - 5 = 7.\nQuestion 2: Factorize x^3 - 6x^2 + 11x - 6.\nP(1) = 1 - 6 + 11 - 6 = 0, so (x-1) is a factor.\nBy synthetic division, quadratic is x^2 - 5x + 6 = (x-2)(x-3).\nTherefore, factored form is (x-1)(x-2)(x-3).', 'SCHOOL_SECRET_KEY'),
    status: 'SUBMITTED'
  }
];

export const DEFAULT_MESSAGES: CommunicationMessage[] = [
  {
    id: 'msg-1',
    senderId: 'usr-teach-1',
    senderName: 'Dr. Alok Sharma',
    senderRole: 'TEACHER',
    receiverId: 'usr-par-1', // Ramesh Mehta (Arjun's Father)
    receiverName: 'Ramesh Mehta',
    receiverRole: 'PARENT',
    content: encryptData('Hello Mr. Mehta, Arjun has shown fantastic progress in our recent algebra lessons. His participation is excellent. He just needs to make sure he completes his practice homework on time.', 'SCHOOL_SECRET_KEY'),
    timestamp: '2026-05-26T16:00:00Z'
  },
  {
    id: 'msg-2',
    senderId: 'usr-par-1',
    senderName: 'Ramesh Mehta',
    senderRole: 'PARENT',
    receiverId: 'usr-teach-1',
    receiverName: 'Dr. Alok Sharma',
    receiverRole: 'TEACHER',
    content: encryptData('Thank you Dr. Sharma. I will sit with him tonight to make sure he does the math homework. Appreciate your guidance.', 'SCHOOL_SECRET_KEY'),
    timestamp: '2026-05-26T17:15:00Z'
  },
  {
    id: 'msg-3',
    senderId: 'usr-teach-2',
    senderName: 'Mrs. Emily Baker',
    senderRole: 'TEACHER',
    receiverId: 'usr-par-3', // David Vance (Marcus's Father)
    receiverName: 'David Vance',
    receiverRole: 'PARENT',
    content: encryptData('Dear Mr. Vance, Marcus submitted a truly outstanding literature essay analyzing Macbeth today. Both his structure and vocabulary were superlative. Tell him to keep up this level of effort.', 'SCHOOL_SECRET_KEY'),
    timestamp: '2026-05-27T18:00:00Z'
  }
];

export const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-1',
    recipientId: 'usr-stu-1',
    title: 'New Assignment Assigned',
    message: 'Polynomial Division and Remainder Theorem due on June 03.',
    type: 'ASSIGNMENT',
    timestamp: '2026-05-25T10:01:00Z',
    read: false
  },
  {
    id: 'not-2',
    recipientId: 'usr-stu-3',
    title: 'Assignment Graded',
    message: 'Your Literature assignment "Shakespeare Macbeth Soliloquies" has been graded. Grade: A-',
    type: 'GRADE',
    timestamp: '2026-05-27T16:30:00Z',
    read: false
  },
  {
    id: 'not-3',
    recipientId: 'usr-par-3',
    title: 'New Communication from Teacher',
    message: 'Mrs. Emily Baker sent you a message regarding Marcus\'s academic performance.',
    type: 'MESSAGE',
    timestamp: '2026-05-27T18:00:15Z',
    read: false
  }
];

export const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    userId: 'usr-teach-1',
    userName: 'Dr. Alok Sharma',
    userRole: 'TEACHER',
    action: 'Uploaded Study material: "Algebra and Quadratic Equations" (Class 9th Maths)',
    timestamp: '2026-05-28T01:10:00Z',
    ipAddress: '192.168.10.45'
  },
  {
    id: 'log-2',
    userId: 'usr-stu-1',
    userName: 'Arjun Mehta',
    userRole: 'STUDENT',
    action: 'Logged into account (Student portal - 9th Grade)',
    timestamp: '2026-05-28T02:05:00Z',
    ipAddress: '192.168.12.110'
  }
];

// Simple map of usernames to helper passwords
// we generate passwords simple as: username + "123"
export function checkPasswordMatch(username: string, enteredPass: string): boolean {
  return enteredPass === 'password' || enteredPass === `${username}123` || enteredPass === 'admin123';
}

export const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  // Arjun Mehta (Class 9th)
  { id: 'att-1', studentId: 'usr-stu-1', studentName: 'Arjun Mehta', classGrade: '9th', date: '2026-05-25', status: 'PRESENT', markedBy: 'usr-teach-1', teacherName: 'Dr. Alok Sharma', subject: 'Mathematics', remarks: 'On time and active' },
  { id: 'att-2', studentId: 'usr-stu-1', studentName: 'Arjun Mehta', classGrade: '9th', date: '2026-05-26', status: 'PRESENT', markedBy: 'usr-teach-1', teacherName: 'Dr. Alok Sharma', subject: 'Physics', remarks: '' },
  { id: 'att-3', studentId: 'usr-stu-1', studentName: 'Arjun Mehta', classGrade: '9th', date: '2026-05-27', status: 'ABSENT', markedBy: 'usr-teach-2', teacherName: 'Mrs. Emily Baker', subject: 'History', remarks: 'Unwell, informed by parent' },
  { id: 'att-4', studentId: 'usr-stu-1', studentName: 'Arjun Mehta', classGrade: '9th', date: '2026-05-28', status: 'LATE', markedBy: 'usr-teach-2', teacherName: 'Mrs. Emily Baker', subject: 'English Literature', remarks: 'Late by 10 minutes' },
  
  // Sophia Chen (Class 10th)
  { id: 'att-5', studentId: 'usr-stu-2', studentName: 'Sophia Chen', classGrade: '10th', date: '2026-05-25', status: 'PRESENT', markedBy: 'usr-teach-1', teacherName: 'Dr. Alok Sharma', subject: 'Mathematics', remarks: '' },
  { id: 'att-6', studentId: 'usr-stu-2', studentName: 'Sophia Chen', classGrade: '10th', date: '2026-05-26', status: 'PRESENT', markedBy: 'usr-teach-2', teacherName: 'Mrs. Emily Baker', subject: 'English Literature', remarks: '' },
  { id: 'att-7', studentId: 'usr-stu-2', studentName: 'Sophia Chen', classGrade: '10th', date: '2026-05-27', status: 'PRESENT', markedBy: 'usr-teach-1', teacherName: 'Dr. Alok Sharma', subject: 'Mathematics', remarks: 'Participated in coding challenge' },
  { id: 'att-8', studentId: 'usr-stu-2', studentName: 'Sophia Chen', classGrade: '10th', date: '2026-05-28', status: 'PRESENT', markedBy: 'usr-teach-2', teacherName: 'Mrs. Emily Baker', subject: 'History', remarks: '' },

  // Marcus Vance (Class 11th)
  { id: 'att-9', studentId: 'usr-stu-3', studentName: 'Marcus Vance', classGrade: '11th', date: '2026-05-25', status: 'PRESENT', markedBy: 'usr-teach-2', teacherName: 'Mrs. Emily Baker', subject: 'English Literature', remarks: '' },
  { id: 'att-10', studentId: 'usr-stu-3', studentName: 'Marcus Vance', classGrade: '11th', date: '2026-05-26', status: 'ABSENT', markedBy: 'usr-teach-1', teacherName: 'Dr. Alok Sharma', subject: 'Physics', remarks: 'Skipped morning roll' },
  { id: 'att-11', studentId: 'usr-stu-3', studentName: 'Marcus Vance', classGrade: '11th', date: '2026-05-27', status: 'LATE', markedBy: 'usr-teach-2', teacherName: 'Mrs. Emily Baker', subject: 'History', remarks: 'Late transport' },
  { id: 'att-12', studentId: 'usr-stu-3', studentName: 'Marcus Vance', classGrade: '11th', date: '2026-05-28', status: 'PRESENT', markedBy: 'usr-teach-1', teacherName: 'Dr. Alok Sharma', subject: 'Mathematics', remarks: '' },

  // Priyanka Nair (Class 12th)
  { id: 'att-13', studentId: 'usr-stu-4', studentName: 'Priyanka Nair', classGrade: '12th', date: '2026-05-25', status: 'PRESENT', markedBy: 'usr-teach-1', teacherName: 'Dr. Alok Sharma', subject: 'Mathematics', remarks: 'Excellent project discussion' },
  { id: 'att-14', studentId: 'usr-stu-4', studentName: 'Priyanka Nair', classGrade: '12th', date: '2026-05-26', status: 'PRESENT', markedBy: 'usr-teach-1', teacherName: 'Dr. Alok Sharma', subject: 'Physics', remarks: '' },
  { id: 'att-15', studentId: 'usr-stu-4', studentName: 'Priyanka Nair', classGrade: '12th', date: '2026-05-27', status: 'PRESENT', markedBy: 'usr-teach-1', teacherName: 'Dr. Alok Sharma', subject: 'Mathematics', remarks: '' },
  { id: 'att-16', studentId: 'usr-stu-4', studentName: 'Priyanka Nair', classGrade: '12th', date: '2026-05-28', status: 'PRESENT', markedBy: 'usr-teach-1', teacherName: 'Dr. Alok Sharma', subject: 'Physics', remarks: '' }
];
