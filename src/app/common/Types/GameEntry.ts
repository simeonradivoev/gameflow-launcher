import { Guid, IGameEntry } from '../Types';

export default class GameEntry implements IGameEntry {
  id = '' as Guid;

  name = '';

  favorite = false;

  constructor(id: Guid, name: string, favorite: boolean) {
    this.id = id;
    this.name = name;
    this.favorite = favorite;
  }
}
