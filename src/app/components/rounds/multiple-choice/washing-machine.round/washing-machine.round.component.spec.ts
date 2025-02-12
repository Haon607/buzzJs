import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WashingMachineRoundComponent } from './washing-machine.round.component';

describe('WashingMachineRoundComponent', () => {
  let component: WashingMachineRoundComponent;
  let fixture: ComponentFixture<WashingMachineRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WashingMachineRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WashingMachineRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
