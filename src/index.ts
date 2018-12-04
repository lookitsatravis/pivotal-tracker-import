import { Command, flags } from '@oclif/command';
import cli from 'cli-ux';
import { StoryType } from './constants';
import Input from './input';

const fs = require('fs');
const stringify = require('csv-stringify/lib/sync');

/* tslint:disable */
const EXIT_CODES = {
  INPUT_NOT_FOUND: 1000,
  INPUT_FILE_REQUIRED: 1001,
  INPUT_PARSE_ERROR: 1002,
  OUTPUT_FILE_REQUIRED: 1003,
};
/* tslint:enable */

const ARGS = {
  INPUT_FILE: 'input-file',
  OUTPUT_FILE: 'output-file',
};

class PtImport extends Command {
  public static description = 'Generates a CSV file for importing into Pivotal Tracker using a JSON configuration.';

  public static flags = {
    force: flags.boolean({ char: 'f' }),
    help: flags.help({ char: 'h' }),
    version: flags.version({ char: 'v' }),
  };

  public static args = [{ name: ARGS.INPUT_FILE }, { name: ARGS.OUTPUT_FILE }];

  protected inputFilePath?: string = undefined;
  protected outputFilePath?: string = undefined;
  protected json?: Input = undefined;

  public async run() {
    const { args, flags } = this.parse(PtImport);

    await this.initialize(args, flags);

    this.generate();
  }

  protected async initialize(args: any, flags: any) {
    this.inputFilePath = args[ARGS.INPUT_FILE];
    this.outputFilePath = args[ARGS.OUTPUT_FILE];

    if (!this.inputFilePath || this.inputFilePath === '') {
      this.error(`Input file path is required.`, { exit: EXIT_CODES.INPUT_FILE_REQUIRED });
    }

    if (!fs.existsSync(this.inputFilePath)) {
      this.error(`No input file exists at path "${this.inputFilePath}"`, { exit: EXIT_CODES.INPUT_NOT_FOUND });
    }

    if (!this.outputFilePath || this.outputFilePath === '') {
      this.error(`Output file path is required.`, { exit: EXIT_CODES.OUTPUT_FILE_REQUIRED });
    }

    const rawJson = fs.readFileSync(this.inputFilePath, 'utf8');

    try {
      this.json = Input.parse(rawJson);
    } catch (err) {
      this.error(err.message, { exit: EXIT_CODES.INPUT_PARSE_ERROR });
    }

    if (this.json) {
      const resourcesCount = this.json.resources.length;
      const storiesCount = this.json.stories.length;

      if (resourcesCount === 0 && storiesCount === 0) {
        this.log('Nothing to do. See ya!');
        this.exit();

        return;
      }

      if (!flags.force) {
        const confirmationMessage = `${resourcesCount} resources and ${storiesCount} stories will be generated. Continue?`;
        const confirmed = await cli.confirm(confirmationMessage);

        if (!confirmed) {
          this.log('Goodbye!');
          this.exit();

          return;
        }
      }
    }
  }

  protected generate() {
    if (this.json) {
      let rows = this.json.buildRows();
      const headers = this.makeColumnHeaders(rows);
      rows.unshift(headers);
      rows = this.addImportLabel(rows);
      rows = this.padColumns(rows, headers.length);

      fs.writeFileSync(this.outputFilePath, stringify(rows));

      this.log('Done!');
    }
  }

  protected makeColumnHeaders(rows: any[]): string[] {
    const headers = ['Title', 'Description', 'Type', 'Estimate', 'Labels'];
    let maxNumTasks = 0;

    // Find out how many tasks are included
    rows.forEach(row => {
      const colDiff = row.length - headers.length;

      if (colDiff > 0) {
        const numTasks = colDiff / 2;

        if (numTasks > maxNumTasks) {
          maxNumTasks = numTasks;
        }
      }
    });

    for (let i = 0; i < maxNumTasks; i++) {
      headers.push('Task');
      headers.push('Task Status');
    }

    return headers;
  }

  protected addImportLabel(rows: any[]): any[] {
    const today = new Date();
    const importLabel = `import_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}_${today.getHours()}${today.getMinutes()}${today.getSeconds()}${today.getMilliseconds()}`;

    return rows.map((row, i) => {
      // Skip headers
      if (i === 0) {
        return row;
      }

      if (row[2] !== StoryType.EPIC) {
        const labels = row[4];
        row[4] = labels && labels !== '' ? `${importLabel},${labels}` : importLabel;
      }

      return row;
    });
  }

  protected padColumns(rows: any[], numberOfColumns: number): any[] {
    return rows.map(row => {
      const diff = numberOfColumns - row.length;

      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          row.push('');
        }
      }

      return row;
    });
  }
}

export = PtImport;
