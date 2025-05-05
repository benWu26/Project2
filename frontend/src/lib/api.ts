import axios, { AxiosError } from "axios";
import {
  User,
  UserCreate,
  Task,
  TaskCreate,
  TaskUpdate,
  Note,
  NoteCreate,
  NoteUpdate,
  MessageResponse,
  TaskCompletionReport,
  NoteActivityReport,
} from "@/lib/types"; // Adjust if needed

const API_BASE = "http://localhost:8000"; // Update this for production

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (msg: string, data?: any) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[API LOG] ${msg}`, data ?? "");
  }
};

const handleError = <T>(error: unknown): Promise<T> => {
  if (axios.isAxiosError(error)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    console.error("[API ERROR]", err.response?.data || err.message);
    return Promise.reject(new Error(err.response?.data?.detail || err.message));
  } else {
    console.error("[UNEXPECTED ERROR]", error);
    return Promise.reject(new Error("An unexpected error occurred."));
  }
};

// ---------- USERS ----------

export const createUser = async (user: UserCreate): Promise<User> => {
  try {
    log("Creating user", user);
    const res = await axios.post<User>(`${API_BASE}/users/`, user);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<User>(error);
  }
};

export const getUser = async (user_id: number): Promise<User> => {
  try {
    log(`Getting user ID ${user_id}`);
    const res = await axios.get<User>(`${API_BASE}/users/${user_id}`);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<User>(error);
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    log("Getting all users");
    const res = await axios.get<User[]>(`${API_BASE}/users/`);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<User[]>(error);
  }
};

export const updateUser = async (user_id: number, user: UserCreate): Promise<User> => {
  try {
    log(`Updating user ID ${user_id}`, user);
    const res = await axios.put<User>(`${API_BASE}/users/${user_id}`, user);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<User>(error);
  }
};

export const deleteUser = async (user_id: number): Promise<MessageResponse> => {
  try {
    log(`Deleting user ID ${user_id}`);
    const res = await axios.delete<MessageResponse>(`${API_BASE}/users/${user_id}`);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<MessageResponse>(error);
  }
};

// ---------- TASKS ----------

export const createTask = async (task: TaskCreate): Promise<Task> => {
  try {
    log("Creating task", task);
    const res = await axios.post<Task>(`${API_BASE}/tasks/`, task);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<Task>(error);
  }
};

export const getTask = async (task_id: number): Promise<Task> => {
  try {
    log(`Getting task ID ${task_id}`);
    const res = await axios.get<Task>(`${API_BASE}/tasks/${task_id}`);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<Task>(error);
  }
};

export const getTasksByUser = async (user_id: number): Promise<Task[]> => {
  try {
    log(`Getting tasks for user ID ${user_id}`);
    const res = await axios.get<Task[]>(`${API_BASE}/tasks/user/${user_id}`);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<Task[]>(error);
  }
};

export const updateTask = async (task_id: number, task: TaskUpdate): Promise<Task> => {
  try {
    log(`Updating task ID ${task_id}`, task);
    const res = await axios.put<Task>(`${API_BASE}/tasks/${task_id}`, task);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<Task>(error);
  }
};

export const deleteTask = async (task_id: number): Promise<MessageResponse> => {
  try {
    log(`Deleting task ID ${task_id}`);
    const res = await axios.delete<MessageResponse>(`${API_BASE}/tasks/${task_id}`);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<MessageResponse>(error);
  }
};

export const cleanupOldTasks = async (
  user_id: number,
  days: number
): Promise<MessageResponse> => {
  try {
    log(`Cleaning tasks older than ${days} days for user ID ${user_id}`);
    const res = await axios.delete<MessageResponse>(
      `${API_BASE}/tasks/cleanup/${user_id}/${days}`
    );
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<MessageResponse>(error);
  }
};

export const getFilteredTasks = async (
  user_id: number,
  target_date: string,
  finished: boolean
): Promise<Task[]> => {
  try {
    log(`Filtering tasks on ${target_date}, finished: ${finished}`);
    const res = await axios.get<Task[]>(
      `${API_BASE}/tasks/filter/${user_id}/${target_date}/${finished}`
    );
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<Task[]>(error);
  }
};

export const markTaskComplete = async (task_id: number): Promise<MessageResponse> => {
  try {
    log(`Marking task complete: ID ${task_id}`);
    const res = await axios.post<MessageResponse>(
      `${API_BASE}/tasks/${task_id}/complete`
    );
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<MessageResponse>(error);
  }
};

export const getTasksInRange = async (
  user_id: number,
  start_date: string,
  end_date: string
): Promise<Task[]> => {
  try {
    log(`Getting tasks from ${start_date} to ${end_date} for user ID ${user_id}`);
    const res = await axios.get<Task[]>(
      `${API_BASE}/tasks/range/${user_id}/${start_date}/${end_date}`
    );
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<Task[]>(error);
  }
};

// ---------- NOTES ----------

export const createNote = async (note: NoteCreate): Promise<Note> => {
  try {
    log("Creating note", note);
    const res = await axios.post<Note>(`${API_BASE}/notes/`, note);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<Note>(error);
  }
};

export const getNote = async (note_id: number): Promise<Note> => {
  try {
    log(`Getting note ID ${note_id}`);
    const res = await axios.get<Note>(`${API_BASE}/notes/${note_id}`);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<Note>(error);
  }
};

export const getNotesByUser = async (user_id: number): Promise<Note[]> => {
  try {
    log(`Getting notes for user ID ${user_id}`);
    const res = await axios.get<Note[]>(`${API_BASE}/notes/user/${user_id}`);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<Note[]>(error);
  }
};

export const updateNote = async (
  note_id: number,
  note: NoteUpdate
): Promise<Note> => {
  try {
    log(`Updating note ID ${note_id}`, note);
    const res = await axios.put<Note>(`${API_BASE}/notes/${note_id}`, note);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<Note>(error);
  }
};

export const deleteNote = async (note_id: number): Promise<MessageResponse> => {
  try {
    log(`Deleting note ID ${note_id}`);
    const res = await axios.delete<MessageResponse>(`${API_BASE}/notes/${note_id}`);
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<MessageResponse>(error);
  }
};

export const cleanupOldNotes = async (
  user_id: number,
  days: number
): Promise<MessageResponse> => {
  try {
    log(`Cleaning notes older than ${days} days for user ID ${user_id}`);
    const res = await axios.delete<MessageResponse>(
      `${API_BASE}/notes/cleanup/${user_id}/${days}`
    );
    log("Response data", res.data);
    return res.data;
  } catch (error) {
    return handleError<MessageResponse>(error);
  }
};

export const getTaskCompletionReport = async (
    user_id: number,
    start_date: string,
    end_date: string,
    finished?: boolean,
    importance?: number
  ): Promise<TaskCompletionReport> => {
    // Build params
    const params = new URLSearchParams({
      user_id: String(user_id),
      start_date,
      end_date,
    });
  
    if (finished !== undefined) {
      params.append("finished", String(finished));
    }
  
    if (importance !== undefined) {
      params.append("importance", String(importance));
    }
  
    const url = `${API_BASE}/reports/tasks/completion?${params.toString()}`;
  
    // DEBUG: log the full URL before the request
    console.debug("[API DEBUG] GET", url);
  
    try {
      const res = await axios.get<TaskCompletionReport>(url);
  
      // DEBUG: log status and full response
      console.debug(
        "[API DEBUG] Response",
        { status: res.status, data: res.data, headers: res.headers }
      );
  
      // Ensure we have default values for any nulls
      const report: TaskCompletionReport = {
        total_tasks: res.data.total_tasks || 0,
        completed_tasks: res.data.completed_tasks || 0,
        avg_completion_days: res.data.avg_completion_days || 0,
        avg_importance: res.data.avg_importance || 0,
        completion_rate: res.data.completion_rate || 0
      };
  
      return report;
    } catch (error) {
      // DEBUG: log error details
      if (axios.isAxiosError(error)) {
        console.error(
          "[API DEBUG] Axios error requesting TaskCompletionReport",
          {
            url,
            message: error.message,
            responseData: error.response?.data,
            status: error.response?.status,
          }
        );
      } else {
        console.error(
          "[API DEBUG] Unexpected error requesting TaskCompletionReport",
          { url, error }
        );
      }
  
      return handleError<TaskCompletionReport>(error);
    }
  };
  
  export const getNoteActivityReport = async (
    user_id: number,
    start_date: string,
    end_date: string
  ): Promise<NoteActivityReport> => {
    try {
      const params = new URLSearchParams({
        user_id: String(user_id),
        start_date,
        end_date,
      });
  
      const res = await axios.get<NoteActivityReport>(
        `${API_BASE}/reports/notes/activity?${params.toString()}`
      );
      log("Note Activity Report", res.data);
      return res.data;
    } catch (error) {
      return handleError<NoteActivityReport>(error);
    }
  };