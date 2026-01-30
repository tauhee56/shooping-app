declare module 'multer' {
  import type { RequestHandler } from 'express';

  type File = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer?: Buffer;
  };

  type StorageEngine = unknown;

  type Options = {
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
  };

  type MulterInstance = {
    single: (fieldName: string) => RequestHandler;
    array: (fieldName: string, maxCount?: number) => RequestHandler;
  };

  function multer(options?: Options): MulterInstance;

  namespace multer {
    function memoryStorage(): StorageEngine;
  }

  export = multer;
}
