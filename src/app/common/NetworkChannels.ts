/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { ipcMain, ipcRenderer } from 'electron';
import { TypedIpcMain, TypedIpcRenderer } from 'electron-typed-ipc';
import SettingsElectronStore from './SettingsElectronStore';
import {
  GameSource,
  Guid,
  ICommunityPost,
  IGame,
  IGameMetadataEntry,
} from './Types';
import Game from './Types/Game';
import GameEntry from './Types/GameEntry';

export type Events = {
  GetGameListRequest: () => void;
  MarkFavoriteRequest: (gameId: Guid) => void;
  UnmarkFavoriteRequest: (gameId: Guid) => void;
  GetGameListResponse: (games: Array<GameEntry>) => void;
  DeleteGameRequest: (gameId: Guid) => void;
  // Sources Database
  CreateSourceRequest: (source: GameSource) => void;
  // Update Game Request
  StartEditingGameRequest: (gameId: Guid) => void;
  StartEditingGameResponse: (game: IGame) => void;
  StartAddingGameRequest: () => void;
  StartAddingGameResponse: () => void;
  CancelUpdateGameRequest: () => void;
  BlurWindow: (blur: boolean) => void;
  EditGameRequest: (game: IGame) => void;
  AddGameRequest: (game: IGame) => void;
  // Metadata
  GetSourcesListRequest: () => void;
  GetSourcesListResponse: (sources: Array<GameSource>) => void;
  PlayGame: (gameId: Guid) => void;
  OpenSettings: () => void;
  CloseSettings: () => void;
  SaveSettings: (settings: SettingsElectronStore) => void;
  SettingsChanged: () => void;
  LoginSteam: () => void;
  DropFiles: (files: Array<string>) => void;
};

export type Commands = {
  GetLatestPostsRequest: (
    subredditName: string
  ) => Array<ICommunityPost> | null;
  GetGameRequest: (gameId: Guid) => Game;
  // File System
  OpenFoldersDialogRequest: () => Array<string>;
  // Metadata
  GetMetadataSearchRequest: (search: string) => Array<IGameMetadataEntry>;
  GetMetadataGameRequest: (selectedEntryId: Guid) => any;
  GetGameIcon: (gameId: Guid) => string;
  GetUserName: () => string;
};

export const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<
  Events,
  Commands
>;
export const typedIpcMain = ipcMain as TypedIpcMain<Events, Commands>;
