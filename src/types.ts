/**
 * Types for the renderer: folder tree and Electron API (from preload).
 */

export type MediaKind = 'folder' | 'image' | 'video';

export interface BaseNode {
  name: string;
  path: string;
  type: MediaKind;
}

export interface FolderNode extends BaseNode {
  type: 'folder';
  children: MediaNode[];
}

export type ReviewStatus =
  | 'tbd'
  | 'reject'
  | 'bad'
  | 'dup'
  | 'ok'
  | 'good'
  | 'best';

export type ReviewLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface FileNode extends BaseNode {
  type: 'image' | 'video';
  size: number;
  latitude?: number;
  longitude?: number;
  dateTaken?: string;
  status?: ReviewStatus;
  reviewLevel?: ReviewLevel;
  notes?: string;
  fileId?: number;
  imgWidth?: number;
  imgLength?: number;
  imgDateTime?: string;
  imgMake?: string;
  imgModel?: string;
  imgRotate?: number;
  imgTags?: string;
}

export type MediaNode = FolderNode | FileNode;

export type ShowFilter =
  | 'all'
  | 'tbd'
  | 'possible_dup'
  | 'possible_good_plus'
  | 'possible_best';

export interface ElectronAPI {
  openFolder: () => Promise<FolderNode | null>;
  saveFile: (data: string) => Promise<boolean>;
  openFile: () => Promise<FolderNode | null>;
  openCsv: () => Promise<FolderNode | null>;
  openMediaViewer: (filePath: string, type: 'image' | 'video') => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
