import { Injectable } from '@angular/core';
import { Style, styledLogger } from '../../utils';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  rounds: Round[] = [];

  print() {
    styledLogger("Printing Memory", Style.information)
    styledLogger("Rounds: " + this.rounds, Style.information)
  }
}

export enum Round {
  Punktesammler= "Punktesammler",
  // Liederbeginn Buzzing
  // Lieder autism highlight multiselect
  // Stop the clock
}
