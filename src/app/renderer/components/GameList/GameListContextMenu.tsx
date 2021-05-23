import React from 'react';
import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { ipcRenderer } from 'electron';
import { TypedIpcRenderer } from 'electron-typed-ipc';
import { Commands, Events } from '../../../common/NetworkChannels';
import { IGameEntry } from '../../../common/Types';

const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, Commands>;

const GameListContextMenu = (
  gameEntry: IGameEntry,
  deleteGame: (gameId: string) => void,
  editGame: (gameId: string) => void
) => {
  return (
    <Menu id="game-entry-context-menu">
      {gameEntry.favorite ? (
        <MenuItem
          onClick={() =>
            typedIpcRenderer.send('UnmarkFavoriteRequest', gameEntry.id)
          }
          text="Remove Favorite"
          icon="star-empty"
        />
      ) : (
        <MenuItem
          onClick={() =>
            typedIpcRenderer.send('MarkFavoriteRequest', gameEntry.id)
          }
          text="Favorite"
          icon="star"
        />
      )}
      <MenuDivider />
      <MenuItem
        onClick={() => {
          editGame(gameEntry.id);
        }}
        text="Edit"
        icon="edit"
      />
      <MenuItem
        onClick={() => {
          deleteGame(gameEntry.id);
        }}
        text="Delete"
        icon="trash"
        intent="danger"
      />
    </Menu>
  );
};

export default GameListContextMenu;
