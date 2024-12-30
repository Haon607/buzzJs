export class Player {
  name: string;
  controllerId: number;
  gameScore: number;

  constructor(name: string, controller: number, gameScore: number) {
    this.name = name;
    this.controllerId = controller;
    this.gameScore = gameScore;
  }
}
