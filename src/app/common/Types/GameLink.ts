export default class GameLink {
  name: string;

  link: string;

  constructor(name: string, link: string) {
    this.name = name;
    this.link = link;
  }

  public static equals(
    lhs: GameLink | null | undefined,
    rhs: GameLink | null | undefined
  ): boolean {
    return lhs?.name === rhs?.name && lhs?.link === rhs?.link;
  }
}
