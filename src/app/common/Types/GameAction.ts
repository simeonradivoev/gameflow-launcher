import { ActionType, IGameAction } from '../Types';

export default class GameAction implements IGameAction {
  name = '';

  type: ActionType;

  executable?: string | undefined;

  address = '';

  path = '';

  constructor(type: ActionType, init?: Partial<GameAction>) {
    Object.assign(this, init);
    this.type = type;
  }
}
