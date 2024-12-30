import { Injectable } from '@angular/core';
import { Style, styledLogger } from '../../utils';
import { QuestionType } from "../../Loader";
import { Player } from "../../models";

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  rounds: RoundInterface[] = [];
  roundNumber: number = 0;
  players: Player[] = [];

  constructor() {
    this.rounds = [
        Round.Punktesammler
    ];
    this.roundNumber = 0;
    this.players = [
      {
        name: "0",
        controllerId: 0,
        gameScore: 0,
      }
    ]
  }

  print() {
    styledLogger("Printing Memory", Style.information)
    styledLogger("Rounds: " + this.rounds.map(round => round.name), Style.information)
    styledLogger("Round number: " + this.roundNumber, Style.information)
  }
}

export class Round {
  static Punktesammler: RoundInterface = {
    name: "Punktesammler",
    category: true,
    questionType: QuestionType.multipleChoice,
    path: "/punktesammler",
    background: "#015c53",
    primary: "#20fff8",
    secondary: "#015c53",
  };
  // Liederbeginn Buzzing
  // Lieder autism highlight multiselect
  // Stop the clock
  // I literally just told you
}

export interface RoundInterface {
  name: string;
  questionType: QuestionType;
  category: boolean;
  path: string;
  background: string;
  primary: string;
  secondary: string;
}