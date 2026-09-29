# D3adline — Test & User Account Directory

> **Environment**: Development & Staging  
> **Supabase Project ID**: `apwenbbhotowergwvjjl`  
> **Local App URL**: [http://localhost:3000](http://localhost:3000)  
> **Default Test Password**: `TestPass123!` *(Applies to all `@deadline.app` seeded accounts)*

---

## 1. Quick Reference Matrix

| Role | Display Name | Email | Password | Primary Institution / Department | Key Assigned Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | `admin@deadline.app` | `TestPass123!` | D3adline Academy | Global administrative oversight |
| **Teacher** | Prof. Robert Hoffman | `teacher@deadline.app` | `TestPass123!` | Faculty of Computer Science | `CS-301` & `MATH-202` |
| **Teacher** | Dr. Sarah Chen | `sarah.chen@deadline.app` | `TestPass123!` | Faculty of Software Engineering | `SE-201` |
| **Teacher** | Dr Joe | `test@deadline.app` | *(Custom / sign-up)* | — | Additional teacher account |
| **Student** | Alex Rivera | `student@deadline.app` | `TestPass123!` | School of Computing | `CS-301` & `MATH-202` |
| **Student** | Maya Lin | `maya.lin@deadline.app` | `TestPass123!` | School of Computing | `CS-301` |
| **Student** | Katherine Johnson | `katherine@deadline.app` | `TestPass123!` | School of Engineering | `SE-201` |
| **Student** | Kidung *(Dev Account)* | `kmabumi@gmail.com` | *(OAuth / Custom)* | D3adline Academy | `CS-301` & `MATH-202` |

---

## 2. Detailed Account Profiles

### Administrator (`role = 'admin'`)

#### System Administrator
- **Email**: `admin@deadline.app`
- **Password**: `TestPass123!`
- **User ID**: `a0000000-0000-0000-0000-000000000001`
- **Institution**: D3adline Academy
- **Permissions**:
  - Full system visibility across all courses, students, and instructors.
  - Can view and manage global system settings and administrative panels.

---

### Instructors / Teachers (`role = 'teacher'`)

#### Prof. Robert Hoffman (Teacher A)
- **Email**: `teacher@deadline.app`
- **Password**: `TestPass123!`
- **User ID**: `11111111-1111-4111-8111-111111111111`
- **Institution**: Faculty of Computer Science
- **Managed Courses**:
  - **CS-301**: Data Structures & Algorithms (Join Code: `DSA301`)
  - **MATH-202**: Linear Algebra & Calculus III (Join Code: `MTH202`)
- **Use Case**: Testing course creation, assignment authoring, setting deliverable requirements, grading submissions, and isolated teacher dashboard metrics.

#### Dr. Sarah Chen (Teacher B)
- **Email**: `sarah.chen@deadline.app`
- **Password**: `TestPass123!`
- **User ID**: `22222222-2222-4222-8222-222222222222`
- **Institution**: Faculty of Software Engineering
- **Managed Courses**:
  - **SE-201**: Software Architecture & Scalable Systems (Join Code: `ARC201`)
- **Use Case**: Testing multi-tenant teacher isolation (verifying Dr. Chen cannot view or edit Hoffman's assignments or student submissions).

#### Dr Joe (Teacher C)
- **Email**: `test@deadline.app`
- **User ID**: `e5739262-4851-41c0-8e9c-4eb29b8ee82b`
- **Role**: `teacher`
- **Use Case**: Ad-hoc teacher onboarding and empty-state testing.

---

### Students (`role = 'student'`)

#### Alex Rivera
- **Email**: `student@deadline.app`
- **Password**: `TestPass123!`
- **User ID**: `33333333-3333-4333-8333-333333333333`
- **Institution**: School of Computing
- **Enrollments**:
  - `CS-301` — Data Structures & Algorithms
  - `MATH-202` — Linear Algebra & Calculus III
- **Use Case**: Multi-course student workflow, checklist/subtasks toggling, submitting assignment deliverables (attachments/links/notes), view grades and feedback.

#### Maya Lin
- **Email**: `maya.lin@deadline.app`
- **Password**: `TestPass123!`
- **User ID**: `44444444-4444-4444-8444-444444444444`
- **Institution**: School of Computing
- **Enrollments**:
  - `CS-301` — Data Structures & Algorithms
- **Use Case**: Single-course student view, parallel peer submission testing for CS-301.

#### Katherine Johnson
- **Email**: `katherine@deadline.app`
- **Password**: `TestPass123!`
- **User ID**: `55555555-5555-4555-8555-555555555555`
- **Institution**: School of Engineering
- **Enrollments**:
  - `SE-201` — Software Architecture & Scalable Systems
- **Use Case**: Teacher B (`sarah.chen@deadline.app`) class testing; verifies strict separation between Teacher A and Teacher B students.

#### Kidung (Developer Account)
- **Email**: `kmabumi@gmail.com`
- **User ID**: `4a3d624d-dcfe-497a-8ac8-5b52853b9eea`
- **Institution**: D3adline Academy
- **Enrollments**:
  - `CS-301` — Data Structures & Algorithms
  - `MATH-202` — Linear Algebra & Calculus III
- **Use Case**: Primary developer account with live session history and interactive testing.

---

## 3. Course Roster & Join Codes

| Course Code | Course Name | Instructor | Join Code | Enrolled Students |
| :--- | :--- | :--- | :--- | :--- |
| **CS-301** | Data Structures & Algorithms | Prof. Robert Hoffman (`teacher@deadline.app`) | `DSA301` | Alex Rivera, Maya Lin, Kidung |
| **MATH-202** | Linear Algebra & Calculus III | Prof. Robert Hoffman (`teacher@deadline.app`) | `MTH202` | Alex Rivera, Kidung |
| **SE-201** | Software Architecture & Scalable Systems | Dr. Sarah Chen (`sarah.chen@deadline.app`) | `ARC201` | Katherine Johnson |

---

## 4. Testing & Verification Scenarios

### Scenario A: Strict Teacher Isolation (RBAC)
1. Sign in as `teacher@deadline.app`.
2. Verify courses visible: **CS-301** and **MATH-202**.
3. Confirm that **SE-201** (Dr. Sarah Chen's course) is **not** displayed.
4. Sign out and sign in as `sarah.chen@deadline.app`.
5. Confirm only **SE-201** is displayed.

### Scenario B: Student Assignment Submission & Checklists
1. Sign in as `student@deadline.app` (Alex Rivera).
2. Go to **Assignments** (`/assignments`).
3. Click on individual subtask checkmarks (`SpringCheck` component):
   - Notice that personal subtask completion state is tracked per student in `assignment_subtask_completions`.
4. Click on the main assignment status checkmark:
   - If deliverables (files/notes/links) are required by the teacher and haven't been submitted, the submission requirement modal will prompt the student to submit work first.
5. Upload a deliverable attachment (drag & drop up to 25 MB) and click **Submit Assignment**.
6. The assignment will automatically transition to **Submitted**.

### Scenario C: Teacher Grading & Feedback
1. Sign in as `teacher@deadline.app`.
2. Open the assignment submissions review panel.
3. Review Alex Rivera's submitted work and download/inspect the uploaded file.
4. Enter grade and feedback, then save.
5. Invariants ensure grade is between `0` and `max_points`, and transition status to **Graded**.
