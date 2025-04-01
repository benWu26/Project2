export interface User {
    user_id: number;
    name: string;
    email: string;
  }
  
export interface Task {
task_id: number;
title: string;
description?: string;
due_date: string;
due_time?: string;
importance?: number;
project_id?: number;
user_id: number;
finished: boolean;
}
  
export interface Subtask {
subtask_id: number;
title: string;
description?: string;
date_made: string;
date_finished?: string;
task_id: number;
}
  
export interface Project {
project_id: number;
title: string;
user_id: number;
color?: string;
}

export interface Note {
note_id: number;
title: string;
description?: string;
user_id: number;
}