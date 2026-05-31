// User types
export type Role = 'COACH' | 'STUDENT';

export interface User {
  id: number;
  email: string;
  fullName: string;
  lichessUsername?: string;
  role: Role;
  coachId?: number;
  createdAt: string;
}

// Puzzle types
export interface Puzzle {
  id: number;
  title?: string;
  fen: string;
  solution: string;
  hint?: string;
  tags: PuzzleTag[];
  rating: number;
  createdAt: string;
  tagIds?: number[];
}

export interface PuzzleTag {
  id: number;
  name: string;
  label: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

// Group types
export interface Group {
  id: number;
  name: string;
  coachId: number;
  createdAt: string;
  members?: GroupMember[];
  _count?: {
    members: number;
  };
}

export interface GroupMember {
  id: number;
  groupId: number;
  studentId: number;
  student?: User;
}

// Homework types
export type CheckType = 'AUTO' | 'MANUAL';
export type ProgressStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'REVIEW_PENDING'
  | 'SOLVED'
  | 'FAILED';

export interface Homework {
  id: number;
  title: string;
  description?: string;
  coachId: number;
  groupId?: number;
  studentId?: number;
  createdAt: string;
  puzzles?: HomeworkPuzzle[];
  group?: Group;
  student?: User;
  coach?: User;
}

export interface HomeworkPuzzle {
  id: number;
  homeworkId: number;
  puzzleId: number;
  checkType: CheckType;
  puzzle?: Puzzle;
}

export interface HomeworkAnswer {
  id: number;
  studentId: number;
  homeworkId: number;
  status: ProgressStatus;
  trainerComment?: string;
  score?: number;
  completedAt?: string;
  student?: User;
  homework?: Homework;
  puzzleAttempts?: PuzzleAttempt[];
}

export interface PuzzleAttempt {
  id: number;
  homeworkAnswerId: number;
  homeworkPuzzleId: number;
  currentStep: number;
  attemptCount: number;
  solvedOnFirst: boolean;
  status: ProgressStatus;
  studentAnswer?: string;
  homeworkPuzzle?: HomeworkPuzzle;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  lichessUsername?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface CreateCoachReviewInput {
  coachId: number;
  rating: number;
  comment: string;
}

export interface CoachReview {
  id: number;
  studentId: number;
  studentName?: string;
  coachId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TrainingCoach {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  specialization?: string;
  hasReviewed: boolean;
  avgRating?: number;
  reviewsCount?: number;
}
