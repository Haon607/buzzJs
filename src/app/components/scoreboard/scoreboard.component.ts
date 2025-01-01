import { Component } from '@angular/core';
import { MemoryService } from "../../services/memory.service";

@Component({
  selector: 'app-scoreboard',
  imports: [],
  templateUrl: './scoreboard.component.html',
  standalone: true,
  styleUrl: './scoreboard.component.css'
})
export class ScoreboardComponent {
  memory: MemoryService;

  constructor(memory: MemoryService) {
    this.memory = memory;
  }
}
