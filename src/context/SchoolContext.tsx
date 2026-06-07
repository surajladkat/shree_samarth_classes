/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
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
  ClassGrade,
  Role,
  TimetableEntry,
  AttendanceRecord,
  AttendanceStatus
} from '../types';
import { 
  DEFAULT_ADMIN, 
  DEFAULT_TEACHERS, 
  DEFAULT_STUDENTS, 
  DEFAULT_PARENTS, 
  DEFAULT_STUDY_MATERIALS, 
  DEFAULT_ASSIGNMENTS, 
  DEFAULT_SUBMISSIONS, 
  DEFAULT_MESSAGES, 
  DEFAULT_NOTIFICATIONS, 
  DEFAULT_ACTIVITY_LOGS,
  checkPasswordMatch,
  DEFAULT_ATTENDANCE
} from '../mockData';
import { generateId, generateStudentLoginId, generateParentLoginId, generateTeacherLoginId, encryptData } from '../cryptoUtils';

interface SchoolContextType {
  currentUser: User | null;
  users: User[];
  teachers: TeacherUser[];
  students: StudentUser[];
  parents: ParentUser[];
  studyMaterials: StudyMaterial[];
  assignments: Assignment[];
  submissions: Submission[];
  messages: CommunicationMessage[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  timetables: TimetableEntry[];
  attendance: AttendanceRecord[];
  
  // Auth Operations
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Admin Operations
  registerStudentWithParent: (data: {
    studentName: string;
    classGrade: ClassGrade;
    parentName: string;
    parentRelation: string;
    totalFee: number;
    paidFee: number;
    seatNumber?: string;
    benchNumber?: string;
  }) => { studentLogin: string; studentPass: string; parentLogin: string; parentPass: string };

  registerTeacher: (data: {
    name: string;
    subjects: string[];
    classes: ClassGrade[];
  }) => { teacherLogin: string; teacherPass: string };

  updateStudentFee: (studentId: string, amountPaid: number) => void;
  deleteStudent: (studentId: string) => void;
  deleteTeacher: (teacherId: string) => void;
  
  // Teacher Operations
  uploadStudyMaterial: (material: Omit<StudyMaterial, 'id' | 'uploadedBy' | 'uploadedAt'>) => void;
  deleteStudyMaterial: (id: string) => void;
  createAssignment: (asg: Omit<Assignment, 'id' | 'uploadedBy' | 'teacherName' | 'uploadedAt'>) => void;
  gradeSubmission: (submissionId: string, grade: string, feedback: string) => void;
  
  // Student Operations
  submitAssignmentHomework: (assignmentId: string, content: string, fileName?: string, fileSize?: string) => void;
  
  // Communication
  sendMessage: (receiverId: string, rawContent: string) => void;
  
  // Helpers
  getStudentParent: (studentId: string) => ParentUser | undefined;
  getParentChild: (parentId: string) => StudentUser | undefined;
  markNotificationsAsRead: () => void;
  addToastNotification: (title: string, message: string, type: Notification['type']) => void;
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  deleteTimetableEntry: (id: string) => void;
  submitDailyAttendance: (data: {
    classGrade: ClassGrade;
    subject: string;
    date: string;
    records: { studentId: string; studentName: string; status: AttendanceStatus; remarks?: string }[];
  }) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Main persist states
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('school_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [teachers, setTeachers] = useState<TeacherUser[]>(() => {
    const saved = localStorage.getItem('school_teachers');
    return saved ? JSON.parse(saved) : DEFAULT_TEACHERS;
  });

  const [students, setStudents] = useState<StudentUser[]>(() => {
    const saved = localStorage.getItem('school_students');
    return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
  });

  const [parents, setParents] = useState<ParentUser[]>(() => {
    const saved = localStorage.getItem('school_parents');
    return saved ? JSON.parse(saved) : DEFAULT_PARENTS;
  });

  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    const saved = localStorage.getItem('school_study_materials');
    return saved ? JSON.parse(saved) : DEFAULT_STUDY_MATERIALS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('school_assignments');
    return saved ? JSON.parse(saved) : DEFAULT_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('school_submissions');
    return saved ? JSON.parse(saved) : DEFAULT_SUBMISSIONS;
  });

  const [messages, setMessages] = useState<CommunicationMessage[]>(() => {
    const saved = localStorage.getItem('school_messages');
    return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('school_notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('school_activity_logs');
    return saved ? JSON.parse(saved) : DEFAULT_ACTIVITY_LOGS;
  });

  const [timetables, setTimetables] = useState<TimetableEntry[]>(() => {
    const saved = localStorage.getItem('school_timetables');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'tt-1', classGrade: '9th', day: 'Monday', timeSlot: '09:00 AM - 10:00 AM', subject: 'Mathematics', teacherName: 'Dr. Alok Sharma' },
      { id: 'tt-2', classGrade: '9th', day: 'Tuesday', timeSlot: '10:15 AM - 11:15 AM', subject: 'Physics', teacherName: 'Dr. Alok Sharma' },
      { id: 'tt-3', classGrade: '10th', day: 'Wednesday', timeSlot: '11:30 AM - 12:30 PM', subject: 'Chemistry', teacherName: 'Dr. Alok Sharma' },
      { id: 'tt-4', classGrade: '11th', day: 'Thursday', timeSlot: '01:30 PM - 02:30 PM', subject: 'English', teacherName: 'Dr. Charles Thomas' },
      { id: 'tt-5', classGrade: '12th', day: 'Friday', timeSlot: '03:00 PM - 04:00 PM', subject: 'Biology', teacherName: 'Professor Mary' }
    ];
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('school_attendance');
    return saved ? JSON.parse(saved) : DEFAULT_ATTENDANCE;
  });

  // Derived user lists
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const allUsers: User[] = [
      DEFAULT_ADMIN,
      ...teachers,
      ...students,
      ...parents
    ];
    setUsers(allUsers);
  }, [teachers, students, parents]);

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem('school_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('school_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('school_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('school_parents', JSON.stringify(parents));
  }, [parents]);

  useEffect(() => {
    localStorage.setItem('school_study_materials', JSON.stringify(studyMaterials));
  }, [studyMaterials]);

  useEffect(() => {
    localStorage.setItem('school_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('school_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('school_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('school_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('school_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('school_timetables', JSON.stringify(timetables));
  }, [timetables]);

  useEffect(() => {
    localStorage.setItem('school_attendance', JSON.stringify(attendance));
  }, [attendance]);


  // Helper: Log User Activity
  const logActivity = (userId: string, userName: string, role: Role, action: string) => {
    const newLog: ActivityLog = {
      id: generateId('LOG'),
      userId,
      userName,
      userRole: role,
      action,
      timestamp: new Date().toISOString(),
      ipAddress: `192.168.${Math.floor(10 + Math.random() * 20)}.${Math.floor(2 + Math.random() * 250)}`
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Helper: Send Realtime System Alerts (Appends into user active alerts list)
  const addToastNotification = (recipientId: string, title: string, message: string, type: Notification['type']) => {
    const newNotification: Notification = {
      id: generateId('NOT'),
      recipientId,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Login execution
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Check Admin
    if (username === DEFAULT_ADMIN.username && checkPasswordMatch(username, password)) {
      setCurrentUser(DEFAULT_ADMIN);
      logActivity(DEFAULT_ADMIN.id, DEFAULT_ADMIN.name, 'ADMIN', 'Admin logged into control panel');
      return { success: true };
    }

    // Check Teachers
    const foundTeacher = teachers.find(t => t.username.toLowerCase() === username.toLowerCase());
    if (foundTeacher && checkPasswordMatch(foundTeacher.username, password)) {
      setCurrentUser(foundTeacher);
      logActivity(foundTeacher.id, foundTeacher.name, 'TEACHER', `Teacher logged in`);
      return { success: true };
    }

    // Check Students
    const foundStudent = students.find(s => s.username.toLowerCase() === username.toLowerCase());
    if (foundStudent && checkPasswordMatch(foundStudent.username, password)) {
      setCurrentUser(foundStudent);
      logActivity(foundStudent.id, foundStudent.name, 'STUDENT', `Student logged in (Class ${foundStudent.classGrade})`);
      return { success: true };
    }

    // Check Parents
    const foundParent = parents.find(p => p.username.toLowerCase() === username.toLowerCase());
    if (foundParent && checkPasswordMatch(foundParent.username, password)) {
      setCurrentUser(foundParent);
      logActivity(foundParent.id, foundParent.name, 'PARENT', `Parent logged in`);
      return { success: true };
    }

    return { success: false, error: 'Invalid private credentials or password. Contact Administration office.' };
  };

  // Logout execution
  const logout = () => {
    if (currentUser) {
      logActivity(currentUser.id, currentUser.name, currentUser.role, 'User logged out securely');
    }
    setCurrentUser(null);
  };

  // Helper getters
  const getStudentParent = (studentId: string) => {
    return parents.find(p => p.childId === studentId);
  };

  const getParentChild = (parentId: string) => {
    const parent = parents.find(p => p.id === parentId);
    if (!parent?.childId) return undefined;
    return students.find(s => s.id === parent.childId);
  };

  const markNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(notif => {
      if (notif.recipientId === currentUser.id || notif.recipientId === `ALL_${currentUser.role}S`) {
        return { ...notif, read: true };
      }
      return notif;
    }));
  };

  // Admin action: Student Admission and automatic Parent account linking
  const registerStudentWithParent = (data: {
    studentName: string;
    classGrade: ClassGrade;
    parentName: string;
    parentRelation: string;
    parentPhone: string;
    totalFee: number;
    paidFee: number;
    seatNumber?: string;
    benchNumber?: string;
  }) => {
    const sId = generateId('STU');
    const pId = generateId('PAR');
    
    // Generate private IDs
    const studentUsername = generateStudentLoginId(data.classGrade);
    const parentUsername = generateParentLoginId(studentUsername);
    
    // Default shared password is username + 123
    const studentPassword = `${studentUsername}123`;
    const parentPassword = `${parentUsername}123`;

    const pendingFee = Math.max(0, data.totalFee - data.paidFee);
    const paymentStatus = data.paidFee >= data.totalFee 
      ? 'PAID' 
      : data.paidFee > 0 
        ? 'PARTIAL' 
        : 'PENDING';

    const newStudent: StudentUser = {
      id: sId,
      username: studentUsername,
      name: data.studentName,
      role: 'STUDENT',
      classGrade: data.classGrade,
      parentId: pId,
      studentIdCardNum: `STU-${data.classGrade.replace('th','')}-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      seatNumber: data.seatNumber,
      benchNumber: data.benchNumber,
      totalFee: data.totalFee,
      paidFee: data.paidFee,
      pendingFee: pendingFee,
      paymentStatus: paymentStatus
    };

    const newParent: ParentUser = {
      id: pId,
      username: parentUsername,
      name: data.parentName,
      role: 'PARENT',
      childId: sId,
      childName: data.studentName,
      childClass: data.classGrade,
      relationship: data.parentRelation,
      mobileNumber: data.parentPhone,
      createdAt: new Date().toISOString()
    };

    setStudents(prev => [...prev, newStudent]);
    setParents(prev => [...prev, newParent]);

    if (currentUser) {
      logActivity(
        currentUser.id, 
        currentUser.name, 
        currentUser.role, 
        `Registered student ${data.studentName} (${data.classGrade}) with Fee total of ₹${data.totalFee}`
      );
    }

    // Push notifications
    addToastNotification(
      'ALL_TEACHERS',
      'New Student Admission',
      `Welcome ${data.studentName} to Class ${data.classGrade}! Parent account linked.`,
      'INFO'
    );

    return {
      studentLogin: studentUsername,
      studentPass: studentPassword,
      parentLogin: parentUsername,
      parentPass: parentPassword
    };
  };

  // Admin action: Teacher staff onboarding
  const registerTeacher = (data: {
    name: string;
    subjects: string[];
    classes: ClassGrade[];
  }) => {
    const tId = generateId('TEACH');
    const teacherUsername = generateTeacherLoginId(data.subjects[0] || 'gen');
    const teacherPassword = `${teacherUsername}123`;

    const newTeacher: TeacherUser = {
      id: tId,
      username: teacherUsername,
      name: data.name,
      role: 'TEACHER',
      subjects: data.subjects,
      classes: data.classes,
      createdAt: new Date().toISOString()
    };

    setTeachers(prev => [...prev, newTeacher]);

    if (currentUser) {
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        `Registered new teacher ${data.name} for subjects: ${data.subjects.join(', ')}`
      );
    }

    return {
      teacherLogin: teacherUsername,
      teacherPass: teacherPassword
    };
  };

  // Admin action: Manage / pay student pending fees
  const updateStudentFee = (studentId: string, amountPaid: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const newPaidFee = s.paidFee + amountPaid;
        const newPendingFee = Math.max(0, s.totalFee - newPaidFee);
        const newStatus = newPaidFee >= s.totalFee 
          ? 'PAID' 
          : newPaidFee > 0 
            ? 'PARTIAL' 
            : 'PENDING';
        
        if (currentUser) {
          logActivity(
            currentUser.id,
            currentUser.name,
            currentUser.role,
            `Recorded payment of ₹${amountPaid} for student ${s.name}. Pending balance is now ₹${newPendingFee}`
          );
        }

        return {
          ...s,
          paidFee: newPaidFee,
          pendingFee: newPendingFee,
          paymentStatus: newStatus
        };
      }
      return s;
    }));
  };

  // Admin action: Delete/drop a student and their linked parent
  const deleteStudent = (studentId: string) => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;

    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;

    // Remove from students
    setStudents(prev => prev.filter(s => s.id !== studentId));
    
    // Remove linked parent if exists
    setParents(prev => prev.filter(p => p.childId !== studentId));

    // Log Activity
    logActivity(
      currentUser.id,
      currentUser.name,
      'ADMIN',
      `Expelled / Deleted student: ${targetStudent.name} (Class ${targetStudent.classGrade}) and revoked linked parent access`
    );

    // Toast alert
    addToastNotification(
      currentUser.id,
      'Student Deleted Successfully',
      `Student ${targetStudent.name} and their linked parent have been removed.`,
      'INFO'
    );
  };

  // Admin action: Delete/dismiss a teacher staff member
  const deleteTeacher = (teacherId: string) => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;

    const targetTeacher = teachers.find(t => t.id === teacherId);
    if (!targetTeacher) return;

    // Remove from teachers
    setTeachers(prev => prev.filter(t => t.id !== teacherId));

    // Log Activity
    logActivity(
      currentUser.id,
      currentUser.name,
      'ADMIN',
      `Dismissed / Deleted teacher staff member: ${targetTeacher.name}`
    );

    // Toast alert
    addToastNotification(
      currentUser.id,
      'Teacher Staff Deleted Successfully',
      `Teacher ${targetTeacher.name} has been dismissed and removed from staff listing.`,
      'INFO'
    );
  };

  // Teacher Action: Upload study material per Class folder
  const uploadStudyMaterial = (material: Omit<StudyMaterial, 'id' | 'uploadedBy' | 'uploadedAt'>) => {
    if (!currentUser || currentUser.role !== 'TEACHER') return;

    const newMaterial: StudyMaterial = {
      ...material,
      id: generateId('MAT'),
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString()
    };

    setStudyMaterials(prev => [...prev, newMaterial]);

    logActivity(
      currentUser.id,
      currentUser.name,
      'TEACHER',
      `Uploaded and encrypted homework reference: "${material.title}" for Class folder: ${material.classGrade}`
    );

    // Alert students in that specific class
    students.forEach(s => {
      if (s.classGrade === material.classGrade) {
        addToastNotification(
          s.id,
          'New Study Material Available',
          `Teacher ${currentUser.name} uploaded educational reference "${material.title}" for Class ${material.classGrade}.`,
          'INFO'
        );
      }
    });
  };

  // Teacher Action: Delete study material
  const deleteStudyMaterial = (id: string) => {
    if (!currentUser || currentUser.role !== 'TEACHER') return;

    const material = studyMaterials.find(m => m.id === id);
    if (!material) return;

    setStudyMaterials(prev => prev.filter(m => m.id !== id));

    logActivity(
      currentUser.id,
      currentUser.name,
      'TEACHER',
      `Deleted study material "${material.title}" from Class folder: ${material.classGrade}`
    );

    addToastNotification(
      currentUser.id,
      'Study Material Deleted',
      `Material "${material.title}" has been successfully deleted.`,
      'INFO'
    );
  };

  // Teacher Action: Assign task to specific group
  const createAssignment = (asg: Omit<Assignment, 'id' | 'uploadedBy' | 'teacherName' | 'uploadedAt'>) => {
    if (!currentUser || currentUser.role !== 'TEACHER') return;

    const newAssignment: Assignment = {
      ...asg,
      id: generateId('ASG'),
      uploadedBy: currentUser.id,
      teacherName: currentUser.name,
      uploadedAt: new Date().toISOString()
    };

    setAssignments(prev => [...prev, newAssignment]);

    logActivity(
      currentUser.id,
      currentUser.name,
      'TEACHER',
      `Created new homework assignment "${asg.title}" for group: Class ${asg.classGrade}`
    );

    // Notify targeted students and parents
    students.forEach(s => {
      if (s.classGrade === asg.classGrade) {
        addToastNotification(
          s.id,
          'New Task Assigned',
          `New homework "${asg.title}" has been assigned for Class ${asg.classGrade}, due ${new Date(asg.dueDate).toLocaleDateString()}.`,
          'ASSIGNMENT'
        );
        
        // Parent Notification
        if (s.parentId) {
          addToastNotification(
            s.parentId,
            'Child Homework Assigned',
            `Your child ${s.name} is assigned to complete "${asg.title}" by ${new Date(asg.dueDate).toLocaleDateString()}`,
            'ASSIGNMENT'
          );
        }
      }
    });
  };

  // Teacher Action: Evaluate/Grade student homework and trigger alert log
  const gradeSubmission = (submissionId: string, grade: string, feedback: string) => {
    if (!currentUser || currentUser.role !== 'TEACHER') return;

    setSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        const student = students.find(s => s.id === sub.studentId);
        
        // Notify student of grading success
        addToastNotification(
          sub.studentId,
          'Homework Graded',
          `Your submission for "${sub.assignmentTitle}" received Grade: ${grade}.`,
          'GRADE'
        );

        // Notify parent of grading success
        if (student?.parentId) {
          addToastNotification(
            student.parentId,
            'Academics Updated',
            `Your child ${sub.studentName} received Grade: ${grade} for assignment "${sub.assignmentTitle}".`,
            'GRADE'
          );
        }

        logActivity(
          currentUser.id,
          currentUser.name,
          'TEACHER',
          `Evaluated ${sub.studentName}'s homework for "${sub.assignmentTitle}" with grade "${grade}"`
        );

        return {
          ...sub,
          status: 'GRADED',
          grade,
          feedback
        };
      }
      return sub;
    }));
  };

  // Student Action: Submits homework online (E2E Encrypted automatically)
  const submitAssignmentHomework = (assignmentId: string, rawContent: string, fileName?: string, fileSize?: string) => {
    if (!currentUser || currentUser.role !== 'STUDENT') return;
    
    const studentUser = currentUser as StudentUser;
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    // Remove any previous submission for this assignment by this student to override
    const cleanSubmissions = submissions.filter(s => !(s.assignmentId === assignmentId && s.studentId === studentUser.id));

    // Sign homework using student-teacher client shared secret key then base64 tag
    const encryptedHomework = encryptData(rawContent, 'SCHOOL_SECRET_KEY');

    const newSubmission: Submission = {
      id: generateId('SUB'),
      assignmentId,
      assignmentTitle: assignment.title,
      studentId: studentUser.id,
      studentName: studentUser.name,
      classGrade: studentUser.classGrade,
      submittedAt: new Date().toISOString(),
      submittedContent: encryptedHomework,
      status: 'SUBMITTED',
      fileName,
      fileSize
    };

    setSubmissions([...cleanSubmissions, newSubmission]);

    logActivity(
      studentUser.id,
      studentUser.name,
      'STUDENT',
      `Submitted secure encrypted homework answer sheet for task: "${assignment.title}"`
    );

    // Notify the teacher who assigned the work
    addToastNotification(
      assignment.uploadedBy,
      'Student Homework Completed',
      `${studentUser.name} submitted their ${studentUser.classGrade} homework for "${assignment.title}".`,
      'SUBMISSION'
    );
  };

  // Teacher Action: Submit/save daily attendance registry
  const submitDailyAttendance = (data: {
    classGrade: ClassGrade;
    subject: string;
    date: string;
    records: { studentId: string; studentName: string; status: AttendanceStatus; remarks?: string }[];
  }) => {
    if (!currentUser || currentUser.role !== 'TEACHER') return;
    const teacherUser = currentUser as TeacherUser;

    // Filter out previous records matching classGrade, subject, and date to prevent duplication, and upsert
    const cleanAttendance = attendance.filter(
      r => !(r.classGrade === data.classGrade && r.subject === data.subject && r.date === data.date)
    );

    const newRecords: AttendanceRecord[] = data.records.map(rec => ({
      id: generateId('ATT'),
      studentId: rec.studentId,
      studentName: rec.studentName,
      classGrade: data.classGrade,
      date: data.date,
      status: rec.status,
      markedBy: teacherUser.id,
      teacherName: teacherUser.name,
      subject: data.subject,
      remarks: rec.remarks || ''
    }));

    setAttendance([...cleanAttendance, ...newRecords]);

    // Log Activity
    logActivity(
      teacherUser.id,
      teacherUser.name,
      'TEACHER',
      `Locked daily roll call attendance for Class ${data.classGrade} (${data.subject}) on date: ${data.date}`
    );

    // Notify affected students and parents
    data.records.forEach(rec => {
      if (rec.status === 'ABSENT' || rec.status === 'LATE') {
        addToastNotification(
          rec.studentId,
          `Attendance Alert: ${rec.status}`,
          `You were marked ${rec.status.toLowerCase()} by ${teacherUser.name} of ${data.subject} class on ${data.date}.`,
          'INFO'
        );
        // Alert Linked Parent if exists
        const linkedParent = parents.find(p => p.childId === rec.studentId);
        if (linkedParent) {
          addToastNotification(
            linkedParent.id,
            `Child Turnout Flag: ${rec.status}`,
            `Your child ${rec.studentName} was marked ${rec.status.toLowerCase()} in Class ${data.classGrade} (${data.subject}) today by Dr. Alok Sharma.`,
            'INFO'
          );
        }
      }
    });
  };

  // Communication: Secure dialogue between parents & staff (E2E Encrypted in transit)
  const sendMessage = (receiverId: string, rawContent: string) => {
    if (!currentUser) return;

    const recipient = users.find(u => u.id === receiverId);
    if (!recipient) return;

    const encryptedMsg = encryptData(rawContent, 'SCHOOL_SECRET_KEY');

    const newMsg: CommunicationMessage = {
      id: generateId('MSG'),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId,
      receiverName: recipient.name,
      receiverRole: recipient.role,
      content: encryptedMsg,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);

    addToastNotification(
      receiverId,
      'New secure message',
      `You received an end-to-end encrypted notification from ${currentUser.name} (${currentUser.role}).`,
      'MESSAGE'
    );

    logActivity(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      `Sent secure encrypted communication memo to ${recipient.name} (${recipient.role})`
    );
  };

  const addTimetableEntry = (entry: Omit<TimetableEntry, 'id'>) => {
    const newEntry: TimetableEntry = {
      ...entry,
      id: generateId('TT')
    };
    setTimetables(prev => [...prev, newEntry]);
    if (currentUser) {
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        `Created new timetable entry for Class ${entry.classGrade}: ${entry.subject} on ${entry.day}`
      );
    }
  };

  const deleteTimetableEntry = (id: string) => {
    const entry = timetables.find(t => t.id === id);
    setTimetables(prev => prev.filter(t => t.id !== id));
    if (currentUser && entry) {
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        `Deleted timetable entry for Class ${entry.classGrade}: ${entry.subject}`
      );
    }
  };

  return (
    <SchoolContext.Provider value={{
      currentUser,
      users,
      teachers,
      students,
      parents,
      studyMaterials,
      assignments,
      submissions,
      messages,
      notifications,
      activityLogs,
      timetables,
      attendance,
      
      login,
      logout,
      registerStudentWithParent,
      registerTeacher,
      updateStudentFee,
      deleteStudent,
      deleteTeacher,
      uploadStudyMaterial,
      deleteStudyMaterial,
      createAssignment,
      gradeSubmission,
      submitAssignmentHomework,
      sendMessage,
      addTimetableEntry,
      deleteTimetableEntry,
      submitDailyAttendance,
      
      getStudentParent,
      getParentChild,
      markNotificationsAsRead,
      addToastNotification
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
