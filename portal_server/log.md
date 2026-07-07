# Backend Product Specification – Job Outreach Assistant (MVP)

You are building the backend for an application called **Job Outreach Assistant**.

The backend should expose APIs and background services that support the frontend. The architecture should be modular, scalable, and easy to extend.

The MVP focuses on one complete workflow:

Create Project → Search Company → Store Public Employee Profiles → Generate Personalized Email → Send Email → Update Employee Status.

---

# Core Responsibilities

The backend is responsible for:

- User authentication
- Project management
- Employee management
- Background search jobs
- AI email generation
- Email sending
- Real-time progress updates
- Persistent storage
- Logging and error handling

Searching companies and generating emails are long-running operations and must never block normal API requests.

---

# Authentication

Every request except login should require authentication.

Each user should only be able to access their own:

- Projects
- Employees
- Generated emails
- Search jobs

The backend should never expose another user's data.

---

# Project Module

A Project represents one target company.

A project should contain:

- Company name
- Notes
- Current status
- Employee count
- Search progress
- Creation date
- Last updated date
- Last search date

Supported operations:

- Create Project
- Get All Projects
- Get Single Project
- Update Project
- Delete Project

Deleting a project should also remove every related employee, generated email, search job history, and associated metadata.

---

# Search Module

The Search Module is responsible for discovering publicly available professional profile information for employees of a target company.

The search process must run asynchronously.

Starting a search should immediately return control to the frontend while the backend continues processing in the background.

The backend should continuously report progress.

Example lifecycle:

Pending

↓

Starting

↓

Searching Sources

↓

Collecting Profiles

↓

Removing Duplicates

↓

Saving Employees

↓

Completed

or

Failed

The search module should be designed around providers.

Each provider is responsible for one information source.

The architecture should make it easy to add new providers without modifying existing code.

Search providers should return a standardized employee object regardless of source.

Duplicate employees should be merged intelligently.

Employees should be updated rather than duplicated when new information is discovered.

---

# Employee Module

Employees belong to a single Project.

Each employee record may contain:

- Full Name
- Job Title
- Department
- Company
- Location
- Public Profile URLs
- Public Email (if available)
- Source Information
- Discovery Date
- Contact Status
- Notes

Supported operations:

- List Employees
- Search Employees
- Filter Employees
- Sort Employees
- Get Employee Details
- Update Notes
- Update Contact Status

Statuses:

New

Email Generated

Contacted

Archived

---

# Email Generation Module

The backend should generate personalized outreach emails using an AI model.

Inputs include:

- Employee information
- User profile
- User resume
- Optional custom instructions

Generated emails should contain:

Subject

Body

Generation timestamp

The backend should store generated emails for future editing.

Multiple generated versions may exist.

Users should be able to regenerate emails without losing previous versions.

---

# Email Sending Module

The backend sends emails only after explicit user approval.

Sending an email should:

Validate recipient

Validate sender connection

Send through the configured email provider

Store delivery metadata

Update employee status

Record send timestamp

Failures should not lose generated content.

The user should always be able to retry sending.

---

# Background Jobs

Long-running operations should execute as jobs.

Examples:

Company Search

Email Generation

Bulk Email Generation

Export

Future Resume Analysis

Jobs should support:

Queued

Running

Completed

Failed

Cancelled

Each job should expose:

Progress Percentage

Current Step

Current Message

Start Time

Finish Time

Duration

Errors

---

# Real-Time Events

The backend should publish events whenever important state changes occur.

Examples:

Project Created

Search Started

Search Progress Updated

Employee Added

Employee Updated

Search Finished

Email Generated

Email Sent

Job Failed

The frontend should receive updates without polling.

---

# Logging

Every important operation should be logged.

Examples:

User Login

Project Created

Search Started

Provider Finished

Employee Saved

Email Generated

Email Sent

Errors

Logs should help diagnose production issues.

---

# Error Handling

Every API should return consistent error responses.

Errors should include:

Error Code

Human-readable Message

Optional Details

Unexpected failures should never expose internal implementation details.

---

# Search Result Processing

When providers return employee data:

Normalize fields

Remove duplicates

Merge partial records

Validate required fields

Store clean records

Skip invalid entries

Track the source of every discovered employee.

---

# API Groups

Authentication

Project Management

Employee Management

Search Management

Email Generation

Email Sending

User Profile

Settings

Health Check

Job Status

The APIs should be versioned to support future evolution.

---

# Data Relationships

One User

↓

Many Projects

↓

Many Employees

↓

Many Generated Emails

Every entity should maintain proper ownership relationships.

Deleting a parent entity should clean up dependent records safely.

---

# Security

All endpoints require authentication except login.

Validate every input.

Prevent unauthorized project access.

Rate limit expensive operations such as searches and AI generation.

Sanitize all stored user content.

Never trust client-provided identifiers without ownership verification.

---

# Future Extensibility

Design the backend so the following can be added later without major refactoring:

- Multiple search providers
- Resume analysis
- Job description matching
- Follow-up reminders
- Campaign management
- Interview tracking
- Multiple email providers
- Browser extension support
- Analytics
- Team workspaces
- Subscription plans

Avoid tightly coupling modules. Every major feature should be independently maintainable and replaceable.

The overall goal is to build a reliable backend that manages asynchronous workflows, maintains clean project data, streams progress updates to the frontend, and provides a strong foundation for future expansion.
