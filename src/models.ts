export class Player {
  name: string;
  controllerId: number | undefined;
  gameScore: number;
  totalScore: number;

  constructor(name: string, controller: number | undefined, gameScore: number, totalScore: number) {
    this.name = name;
    this.controllerId = controller;
    this.gameScore = gameScore;
    this.totalScore = totalScore;
  }
}
