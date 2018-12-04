import * as inflection from 'inflection';
import { DEFAULT_FEATURE_ESTIMATE, StoryType } from './constants';
import Task from './task';

class Story {
  public static parse(rawStory: any): Story {
    const labels = Array();
    const tasks = Array<Task>();
    const rawLabels = rawStory.labels;

    if (rawStory.type !== StoryType.EPIC) {
      if (rawLabels && Array.isArray(rawLabels)) {
        rawLabels.forEach(rawLabel => {
          labels.push(String(rawLabel));
        });
      }
    } else {
      // If this is an epic, ensure there is only one label
      const firstLabel = rawLabels && rawLabels[0];
      const label = `${inflection
        .underscore(inflection.titleize(rawStory.title))
        .replace(/\s/g, '')
        .toLowerCase()}`;

      labels.push(firstLabel && firstLabel !== '' ? firstLabel : label);
    }

    const rawTasks = rawStory.tasks;

    if (rawTasks && Array.isArray(rawTasks)) {
      rawTasks.forEach(rawTask => {
        tasks.push(Task.parse(rawTask));
      });
    }

    return new Story(rawStory.title, rawStory.description, rawStory.type, rawStory.estimate, labels, tasks);
  }

  public title: string;
  public description: string;
  public type: StoryType;
  public estimate: number;
  public labels: string[];
  public tasks: Task[];

  constructor(
    title: string,
    description: string,
    type: StoryType = StoryType.FEATURE,
    estimate: number = DEFAULT_FEATURE_ESTIMATE,
    labels: string[] = [],
    tasks: Task[] = []
  ) {
    this.title = title;
    this.description = description;
    this.type = type;
    this.estimate = estimate;
    this.labels = labels;
    this.tasks = tasks;
  }

  public toCSVRow(): any[] {
    const row = Array();

    row.push(this.title);
    row.push(this.description);
    row.push(this.type);
    row.push(this.type !== StoryType.EPIC ? this.estimate : '');
    row.push(this.labels.join(','));

    this.tasks.forEach(task => {
      row.push(task.description);
      row.push(task.status);
    });

    return row;
  }
}

export default Story;
