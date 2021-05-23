import { execFile } from 'child_process';
import { app } from 'electron';
import { ElectronSteam } from 'electron-steam';
import { net } from 'electron/main';
import { accessSync, constants } from 'fs';
import { typedIpcMain } from '../common/NetworkChannels';
import { ActionType } from '../common/Types';
import Game from '../common/Types/Game';

export default (gameDataStore: Datastore) => {
  typedIpcMain.on('PlayGame', async (event, gameId) => {
    const game = await gameDataStore.findOne<Game>({ id: gameId });
    if (
      game &&
      game.playAction &&
      game.playAction.type === ActionType.EXECUTABLE &&
      game.playAction.path
    ) {
      try {
        accessSync(game.playAction.path, constants.R_OK);
        const process = execFile(game.playAction.path);
        process.on('close', (code) => {
          console.log(`process exited with code ${code}`);
        });
      } catch (error) {
        console.error(error);
      }
    }
  });
};
