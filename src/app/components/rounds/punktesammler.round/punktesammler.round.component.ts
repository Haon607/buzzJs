import { Component } from '@angular/core';
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { MemoryService, RoundInterface } from "../../../services/memory.service";
import { NgStyle } from "@angular/common";

@Component({
  selector: 'app-punktesammler.round',
  imports: [
    ScoreboardComponent,
    NgStyle
  ],
  templateUrl: '../multiple-choice.html',
  standalone: true,
  styleUrl: '../multiple-choice.css'
})
export class PunktesammlerRoundComponent {
  bgc: string;
  round: RoundInterface;

  constructor(private memory: MemoryService) {
    this.round = memory.rounds[memory.roundNumber];
    this.bgc = this.round.background
  }
}
