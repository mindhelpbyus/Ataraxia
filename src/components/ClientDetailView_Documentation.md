# Client Detail View Implementation

## Overview
The `ClientDetailView` is a comprehensive, 360-degree view of a client's profile, designed for therapists. It is implemented as a slide-over `Sheet` within the `ProfessionalClientsView` component.

## Key Features
1.  **Ultra-Minimal Header**: Displays client identity, risk status, and primary actions (Edit, Schedule).
2.  **Safety Banner**: Prominently displays high/medium risk alerts.
3.  **Mini-Summary Grid**: 4 tiles showing:
    *   **Next Session**: Date, time, and join button.
    *   **Last Session**: Summary and link to full note.
    *   **Assessments**: Latest PHQ-9/GAD-7 scores and trends.
    *   **Treatment Plan**: Main goal and a visual progress bar.
4.  **Safety Plan Modal**: A dedicated, compliant view with 9 key sections:
    *   Risk Overview (Clinical Assessment based).
    *   Warning Signs & Coping Strategies.
    *   Social Distractions & Contacts (with privacy toggle).
    *   Professional Support & Safe Environment.
    *   Commitment Review & Private Clinical Notes.
5.  **Clinical Overview Panel**: A detailed grid showing:
    *   **Diagnoses**: Primary and secondary.
    *   **Medications**: Current prescriptions.
    *   **Risk & Safety**: Last assessment and emergency contact.
    *   **Attendance**: Session stats (total, cancelled, frequency).
5.  **Client Background**: Presenting problem, history, and personal context.
6.  **Tabbed Interface**:
    *   **Notes**: List of recent session notes.
    *   **Documents**: Clinical documents (Intake, Safety Plan, etc.).
    *   **Assessments**: Historical trend chart (PHQ-9/GAD-7).
    *   **Messages**: Secure messaging placeholder.

## Data Model
The view relies on the `ClientDetailData` interface, which aggregates data from various sources (Profile, Clinical, Sessions, Billing, etc.).

## Visual Style
*   **Clean & Modern**: Uses whitespace, subtle borders, and soft shadows.
*   **Data-Dense**: Presents a lot of information without clutter.
*   **Interactive**: Hover states, clear buttons, and intuitive navigation.
