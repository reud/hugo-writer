export type CustomSchemaAvailableType =
  | 'bool'
  | 'string'
  | 'number'
  | 'array-string';

export interface CustomSchema {
  name: string;
  default: any;
  type: CustomSchemaAvailableType;
}

export interface ProjectConfigInterface {
  diary: GenreInterface | null;
  article: GenreInterface | null;
  tags: string[];
  authors: string[];
  categories: string[];
  recentlyOpenFiles: string[];
  customFrontMatterValues: string[];
  customSchema: CustomSchema[];
}

export interface GenreInterface {
  folderPath: string;
  title: string;
  datetime: string;
  author: string;
  category: string[];
  folderName: string;
}

export interface SaveInterface {
  save: (s: string) => void;
}
