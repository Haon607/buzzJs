import { Injectable } from '@angular/core';
import { Subject } from "rxjs";
import { MemoryService } from "./memory.service";

@Injectable({
    providedIn: 'root'
})
export class ScoreboardService {
    playerSubject = new Subject<[ScoreboardPlayer[], boolean]>();
    sortSubject = new Subject<void>();


    constructor(private memory: MemoryService) {
        this.playerSubject.next([memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: undefined,
                active: false,
            }
        }), false]);
        this.sortSubject.next()

    }
}

export interface ScoreboardPlayer {
    name: string;
    score: number;
    pointAward: number | undefined;
    square: ScoreboardSquare | undefined;
    active: boolean;
    playerPercent?: number;
    playerColor?: string;
}

export class ScoreboardSquare {
    squareBackground?: string;
    squareBorder?: string;
    squareText?: string;
}
