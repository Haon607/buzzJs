import { Component, Input } from '@angular/core';
import { NgClass, NgStyle } from "@angular/common";

@Component({
  selector: 'app-progressbar',
  imports: [
    NgStyle,
    NgClass
  ],
  templateUrl: './progressbar.component.html',
  standalone: true,
  styleUrl: './progressbar.component.css'
})
export class ProgressbarComponent {
  @Input() text: string = "DasdAS>";
  @Input() percent: number = 0;
  @Input() baseColor: string = '#0f1a3c';
  @Input() progressColor: string = '#123a7a';
  @Input() fontsize: string = "40px";
  @Input() borderColor: string = '#000000';
  @Input() numberClass: boolean = false;

}
