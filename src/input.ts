import Resource from './resource';
import Story from './story';
import Utils from './utils';

class Input {
  public static parse(rawJson: any) {
    const { resources, stories }: { resources: any[]; stories: any[] } = JSON.parse(rawJson);

    if (!resources) {
      throw new Error('"resources" is required in the JSON input.');
    }

    if (!stories) {
      throw new Error('"stories" is required in the JSON input.');
    }

    if (!Array.isArray(resources)) {
      throw new Error('Resources input must be an array.');
    }

    if (!Array.isArray(stories)) {
      throw new Error('Stories input must be an array.');
    }

    return new Input(Input.parseResources(resources), Input.parseStories(stories));
  }

  public static parseResources(rawResources: any[]): Resource[] {
    const resources = Array<Resource>();

    rawResources.forEach(rawResource => {
      resources.push(Resource.parse(rawResource));
    });

    return resources;
  }

  public static parseStories(rawStories: any[]): Story[] {
    const stories = Array<Story>();

    rawStories.forEach(rawStory => {
      stories.push(Story.parse(rawStory));
    });

    return stories;
  }

  public resources: Resource[];
  public stories: Story[];

  constructor(resources: Resource[], stories: Story[]) {
    this.resources = resources;
    this.stories = stories;
  }

  public buildRows(): any[] {
    const rows = Array();

    this.stories.forEach(story => {
      rows.push(story.toCSVRow());
    });

    this.resources.forEach(resource => {
      this.makeResourceRows(resource).forEach(resourceRow => {
        rows.push(resourceRow);
      });
    });

    return rows;
  }

  protected makeResourceRows(resource: Resource): any[] {
    const rows = Array();
    const resourceStories: Story[] = [
      Utils.makeModelStory(resource),
      Utils.makeBREADStory(resource),
      Utils.makeServiceStory(resource),
      Utils.makeValidationStory(resource),
    ];

    resourceStories.forEach(resourceStory => {
      rows.push(resourceStory.toCSVRow());
    });

    return rows;
  }
}

export default Input;
