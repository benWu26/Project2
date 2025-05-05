# Indexes Report (SQLite Optimization)

## `idx_tasks_user_id`
- **Index:** `tasks(user_id)`
- **Used by:**
  - `get_tasks_by_date_and_status`
  - `get_tasks_in_date_range`
  - `task_completion_report (user version)`
  - `mark_task_complete`
- **Justification:**  
  Improves performance on all user-specific task operations. These are foundational queries that form the bulk of day-to-day usage.

---

## `idx_tasks_due_date`
- **Index:** `tasks(due_date)`
- **Used by:**
  - `get_tasks_by_date_and_status`
  - `get_tasks_in_date_range`
  - `task_completion_report`
- **Justification:**  
  Speeds up filtering tasks by due date or date ranges, which is critical for time-based reporting and task views.

---

## `idx_tasks_user_due`
- **Index:** `tasks(user_id, due_date)`
- **Used by:**
  - `get_tasks_by_date_and_status`
  - `get_tasks_in_date_range`
  - `task_completion_report (user version)`
- **Justification:**  
  Optimizes combined filters on user and due date, which appear in core queries. Composite index avoids redundant lookups.

---

## `idx_tasks_finished`
- **Index:** `tasks(finished)`
- **Used by:**
  - `get_tasks_by_date_and_status`
  - `task_completion_report`
- **Justification:**  
  Speeds up filtering tasks by completion status. Important for reporting finished vs. pending tasks.

---

## `idx_tasks_importance`
- **Index:** `tasks(importance)`
- **Used by:**
  - `task_completion_report`
- **Justification:**  
  Enables efficient filtering and aggregation based on task priority, especially for high-value reports and dashboards.

---

## `idx_tasks_dates`
- **Index:** `tasks(date_made, date_finished)`
- **Used by:**
  - `task_completion_report`
- **Justification:**  
  Improves computation of average completion time by indexing columns used in date difference calculations.

---

## `idx_notes_user_date`
- **Index:** `notes(user_id, date_created)`
- **Used by:**
  - `delete_old_notes`
  - `note_activity_report`
- **Justification:**  
  Supports fast cleanup of old notes and quick access to activity summaries over time, filtered by user.
