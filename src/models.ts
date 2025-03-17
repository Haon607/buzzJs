export class Player {
  name: string;
  controllerId: number;
  gameScore: number;
  perks: boolean | null;

  constructor(name: string, controller: number, gameScore: number, hasPerks: boolean | null = null) {
    this.name = name;
    this.controllerId = controller;
    this.gameScore = gameScore;
    this.perks = hasPerks;
  }
}
export enum Colors {
  red = '#FF0000',
  blue = '#2CADFA',
  orange = '#F86613',
  green = '#11BC20',
  yellow = '#e8e80b'
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
