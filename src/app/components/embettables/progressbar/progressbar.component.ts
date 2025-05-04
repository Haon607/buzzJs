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
  @Input() text = "DasdAS>";
  @Input() percent = 0;
  @Input() baseColor = '#0f1a3c';
  @Input() progressColor = '#123a7a';
  @Input() fontsize = "40px";
  @Input() borderColor = '#000000';
  @Input() numberClass = false;

}
