import axios from 'axios';
import { User, Task, Subtask } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const api = {
    // User API
    createUser: (user: Omit<User, 'user_id'>) => {
        console.log("Creating user:", user);
        return axios.post<User>(`${API_BASE_URL}/users/`, user).then(response => {
            console.log("Create user response:", response);
            return response;
        });
    },
    getUser: (user_id: number) => {
        console.log("Fetching user with ID:", user_id);
        return axios.get<User>(`${API_BASE_URL}/users/${user_id}`).then(response => {
            console.log("Get user response:", response);
            return response;
        });
    },
    updateUser: (user_id: number, user: Omit<User, 'user_id'>) => {
        console.log("Updating user:", user_id, user);
        return axios.put<User>(`${API_BASE_URL}/users/${user_id}`, user).then(response => {
            console.log("Update user response:", response);
            return response;
        });
    },
    deleteUser: (user_id: number) => {
        console.log("Deleting user with ID:", user_id);
        return axios.delete(`${API_BASE_URL}/users/${user_id}`).then(response => {
            console.log("Delete user response:", response);
            return response;
        });
    },
    getAllUsers: () => {
        console.log("Fetching all users");
        return axios.get<User[]>(`${API_BASE_URL}/users/`).then(response => {
            console.log("Get all users response:", response);
            return response;
        });
    },

    // Task API
    createTask: (task: Omit<Task, 'task_id'>) => {
        console.log("Creating task:", task);
        return axios.post<Task>(`${API_BASE_URL}/tasks/`, task).then(response => {
            console.log("Create task response:", response);
            return response;
        });
    },
    getTask: (task_id: number) => {
        console.log("Fetching task with ID:", task_id);
        return axios.get<Task>(`${API_BASE_URL}/tasks/${task_id}`).then(response => {
            console.log("Get task response:", response);
            return response;
        });
    },
    updateTask: (task_id: number, task: Partial<Task>) => {
        console.log("Updating task:", task_id, task);
        return axios.put<Task>(`${API_BASE_URL}/tasks/${task_id}`, task).then(response => {
            console.log("Update task response:", response);
            return response;
        });
    },
    deleteTask: (task_id: number) => {
        console.log("Deleting task with ID:", task_id);
        return axios.delete(`${API_BASE_URL}/tasks/${task_id}`).then(response => {
            console.log("Delete task response:", response);
            return response;
        });
    },
    getTasksByUser: (user_id: number) => {
        console.log("Fetching tasks for user ID:", user_id);
        return axios.get<Task[]>(`${API_BASE_URL}/users/${user_id}/tasks`).then(response => {
            console.log("Get tasks by user response:", response);
            return response;
        });
    },

    // Subtask API
    createSubtask: (subtask: Omit<Subtask, 'subtask_id'>) => {
        console.log("Creating subtask:", subtask);
        return axios.post<Subtask>(`${API_BASE_URL}/subtasks/`, subtask).then(response => {
            console.log("Create subtask response:", response);
            return response;
        });
    },
    getSubtask: (subtask_id: number) => {
        console.log("Fetching subtask with ID:", subtask_id);
        return axios.get<Subtask>(`${API_BASE_URL}/subtasks/${subtask_id}`).then(response => {
            console.log("Get subtask response:", response);
            return response;
        });
    },
    updateSubtask: (subtask_id: number, subtask: Partial<Subtask>) => {
        console.log("Updating subtask:", subtask_id, subtask);
        return axios.put<Subtask>(`${API_BASE_URL}/subtasks/${subtask_id}`, subtask).then(response => {
            console.log("Update subtask response:", response);
            return response;
        });
    },
    deleteSubtask: (subtask_id: number) => {
        console.log("Deleting subtask with ID:", subtask_id);
        return axios.delete(`${API_BASE_URL}/subtasks/${subtask_id}`).then(response => {
            console.log("Delete subtask response:", response);
            return response;
        });
    },
    getSubtasksByTask: (task_id: number) => {
        console.log("Fetching subtasks for task ID:", task_id);
        return axios.get<Subtask[]>(`${API_BASE_URL}/tasks/${task_id}/subtasks`).then(response => {
            console.log("Get subtasks by task response:", response);
            return response;
        });
    },
};
