import { Request, Response } from 'express';
import * as packageJson from '../../package.json';

export class VersionController {
  getVersion = async (req: Request, res: Response): Promise<void> => {
    res.json({
      version: packageJson.version,
      name: packageJson.name,
    });
  };
}
