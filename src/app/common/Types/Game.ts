import { Guid, IGame, IGameAction } from '../Types';
import GameLink from './GameLink';

export default class Game implements IGame {
  id: Guid;

  name: string;

  favorite = false;

  source: Guid | null = null;

  sourceId: string | null = null;

  description = '';

  links = new Array<GameLink>();

  installationPath: string | null = null;

  installed = false;

  playAction: IGameAction | null = null;

  otherActions = new Array<IGameAction>();

  releaseDate = new Date();

  lastPlayed = new Date();

  timePlayed = 0;

  platform?: string | undefined;

  constructor(id: string, name: string, init?: Partial<Game>) {
    Object.assign(this, init);
    this.id = id;
    this.name = name;
  }
}
