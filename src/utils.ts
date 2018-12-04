import * as inflection from 'inflection';
import { DEFAULT_FEATURE_ESTIMATE, DEFAULT_RESOURCE_LABELS, StoryType } from './constants';
import Resource from './resource';
import Story from './story';
import Task from './task';

interface IRoute {
  name: string;
  verb: string;
  format: string;
}

class Utils {
  public static formatResourceName(resource: string, titleize: boolean = true): string {
    let formatted = inflection.pluralize(resource);

    if (titleize) {
      formatted = inflection.titleize(formatted);
    }

    return formatted;
  }

  public static makeModelStory(resource: Resource): Story {
    const name = this.formatResourceName(resource.name);

    let description = `As a developer, I need a model to represent ${name}.`;

    if (resource.description && resource.description !== '') {
      description += `\r\n\r\nAdditional information:\r\n\r\n${resource.description}`;
    }

    return new Story(
      `Create ${name} model`,
      description,
      StoryType.FEATURE,
      DEFAULT_FEATURE_ESTIMATE,
      this.makeResourceLabels(name)
    );
  }

  public static makeBREADStory(resource: Resource): Story {
    const name = this.formatResourceName(resource.name);

    return new Story(
      `Create BREAD endpoints for ${name}`,
      `As an API user, I need to be able to Browse, Read, Edit, Add, and Delete ${name} using a JSON API.`,
      StoryType.FEATURE,
      DEFAULT_FEATURE_ESTIMATE,
      this.makeResourceLabels(name),
      this.makeBREADTasks(resource)
    );
  }

  public static makeBREADTasks(resource: Resource): Task[] {
    const tasks = Array<Task>();

    const name = this.formatResourceName(resource.name, false);
    const endpoint = `/${inflection
      .underscore(name)
      .replace(/\s/g, '')
      .toLowerCase()}`;

    const routes: IRoute[] = [
      { name: 'Browse', verb: 'get', format: '{{endpoint}}' },
      { name: 'Read', verb: 'get', format: '{{endpoint}}/{id}' },
      { name: 'Edit', verb: '{ patch, put }', format: '{{endpoint}}/{id}' },
      { name: 'Add', verb: 'post', format: '{{endpoint}}' },
      { name: 'Delete', verb: 'delete', format: '{{endpoint}}/{id}' },
    ];

    routes.forEach(route => {
      tasks.push(
        new Task(`${route.name} endpoint at ${route.verb.toUpperCase()} ${route.format.replace('{{endpoint}}', endpoint)}`)
      );
    });

    return tasks;
  }

  public static makeServiceStory(resource: Resource): Story {
    const name = this.formatResourceName(resource.name);

    return new Story(
      `Create ${name} Service`,
      `As a developer, in order to keep business logic consolidated, I need a service for interacting with ${name}.`,
      StoryType.FEATURE,
      DEFAULT_FEATURE_ESTIMATE,
      this.makeResourceLabels(name)
    );
  }

  public static makeValidationStory(resource: Resource): Story {
    const name = this.formatResourceName(resource.name);

    return new Story(
      `Create validation rules for ${name}`,
      `As a developer, I need to ensure that input data for ${name} conforms to the expectations of the business rules.`,
      StoryType.FEATURE,
      DEFAULT_FEATURE_ESTIMATE,
      this.makeResourceLabels(name),
      this.makeValidationTasks()
    );
  }

  public static makeValidationTasks(): Task[] {
    const tasks = Array<Task>();
    const events = ['create', 'update', 'delete'];

    events.forEach(event => {
      tasks.push(new Task(`Add "${event}" validation rules`));
    });

    return tasks;
  }

  public static makeResourceLabels(name: string): string[] {
    return DEFAULT_RESOURCE_LABELS.concat([
      inflection
        .underscore(name)
        .replace(/\s/g, '')
        .toLowerCase(),
    ]);
  }
}

export default Utils;
