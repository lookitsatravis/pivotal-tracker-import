class Resource {
  public static parse(rawResource: any): Resource {
    if (typeof rawResource === 'object') {
      return new Resource(rawResource.name, rawResource.description);
    }

    return new Resource(rawResource);
  }

  public name: string;
  public description?: string;

  constructor(name: string, description?: string) {
    this.name = name;
    this.description = description;
  }
}

export default Resource;
