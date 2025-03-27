export class Player {
  name: string;
  controllerId: number;
  gameScore: number;
  finalPercentage: number

  constructor(name: string, controller: number, gameScore: number) {
    this.name = name;
    this.controllerId = controller;
    this.gameScore = gameScore;
    this.finalPercentage = 0;
  }
}

export enum Colors {
  red = '#FF0000',
  blue = '#2CADFA',
  orange = '#F86613',
  green = '#11BC20',
  yellow = '#FFFF00'
}

export function inputToColor(button: number) {
  switch (button) {
    case 0: return Colors.red;
    case 1: return Colors.blue;
    case 2: return Colors.orange;
    case 3: return Colors.green;
    case 4: return Colors.yellow;
  }
  return;
}
