import GameLink from './Types/GameLink';

export enum ActionType {
  EXECUTABLE,
  URL,
}

export declare interface IGameEntry {
  id: Guid;
  name: string;
  favorite?: boolean;
}
export declare type Guid = string;

export declare interface IGameAction {
  name: string | null;
  type: ActionType;
  address: string | null;
  path: string | null;
}

export declare interface IGame {
  id: Guid;
  name: string;
  favorite: boolean;
  source: Guid | null;
  sourceId: string | null;
  description: string;
  links: Array<GameLink>;
  installationPath: string | null;
  installed: boolean;
  playAction: IGameAction | null;
  otherActions: Array<IGameAction>;
  releaseDate: Date;
  lastPlayed: Date;
  timePlayed: number;
  platform?: string;
}

export declare interface Platform {
  id: Guid;
  name: string;
  icon?: string;
}

export declare interface GameSource {
  id: Guid;
  name: string;
  icon?: string;
}

export declare interface GamesProps {
  games: IGameEntry[];
  selectedGame: Guid | null;
  setSelectedGame: (id: Guid) => void;
  searchFilter: string;
}

export declare interface AppSettings {
  selectedGame: Guid;
  searchFilter: string;
}

export declare interface GameEntryContextMenuProperties {
  gameEntry: IGameEntry;
}

export declare interface TreeInfoSection {
  name: string;
  id: string;
  icon: any;
  content?: JSX.Element;
  children?: Array<TreeInfoSection>;
}

export declare interface TreeNode {
  id: string;
  children?: Array<TreeNode>;
}

export declare interface IGameMetadataEntry {
  id: string;
  name: string;
}

export declare interface ICommunityPostMediaResolution {
  height: number;
  width: number;
  url: string;
}

export declare interface ICommunityPostImagePreview {
  source: ICommunityPostMediaResolution;
  resolutions: Array<ICommunityPostMediaResolution>;
  variants: any; // ?
  id: string;
}

export declare interface ICommunityPostPreview {
  enabled: boolean;
  images: Array<ICommunityPostImagePreview>;
}

export declare interface ICommunityPostRedditVideo {
  duration: number;
  dash_url: string;
  fallback_url: string;
  is_gif: boolean;
  height: number;
}

export declare interface ICommunityPostMedia {
  type?: string;
  reddit_video?: ICommunityPostRedditVideo;
}

export declare interface ICommunityPostGalleryItem {
  id: string;
  media_id: number;
  status: string;
  content_type: string;
  resolutions: Array<ICommunityPostMediaResolution>;
}

export declare interface ICommunityPost {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  name: string;
  media: ICommunityPostMedia | null;
  preview?: ICommunityPostPreview;
  gallery?: Array<ICommunityPostGalleryItem>;
}
