import { TaskStatus } from './constants';

class Task {
  public static parse(rawTask: any): Task {
    if (typeof rawTask === 'object') {
      return new Task(rawTask.description, rawTask.status);
    }

    return new Task(rawTask);
  }

  public description: string;
  public status: TaskStatus;

  constructor(description: string, status: TaskStatus = TaskStatus.NOT_COMPLETED) {
    this.description = description;
    this.status = status;
  }
}

export default Task;
