import { Component } from '@angular/core';
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { MemoryService, RoundInterface } from "../../../services/memory.service";
import { NgStyle } from "@angular/common";
import { ScoreboardService } from "../../../services/scoreboard.service";
import gsap from 'gsap';

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

  constructor(private memory: MemoryService, private scoreboard: ScoreboardService) {
    this.round = memory.rounds[memory.roundNumber];
    this.bgc = this.round.background
    this.setupWithDelay();
  }

  private async setupWithDelay() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.scoreboard.playerSubject.next([this.memory.players.map(player => {return {
      name: player.name,
      score: player.gameScore,
      pointAward: undefined,
      active: false,
      square: undefined
    }}), false])
    gsap.set('#scoreboard', {x: 600})
    await new Promise(resolve => setTimeout(resolve, 750));
    gsap.to('#scoreboard', {x: 0, ease: 'bounce'})
  }
}
