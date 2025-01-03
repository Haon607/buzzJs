import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopTheClockRoundComponent } from './stop-the-clock.round.component';

describe('StopTheClockRoundComponent', () => {
  let component: StopTheClockRoundComponent;
  let fixture: ComponentFixture<StopTheClockRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopTheClockRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopTheClockRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
