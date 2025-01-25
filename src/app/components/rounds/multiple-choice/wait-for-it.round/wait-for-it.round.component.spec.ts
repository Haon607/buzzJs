import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitForItRoundComponent } from './wait-for-it.round.component';

describe('WaitForItRoundComponent', () => {
  let component: WaitForItRoundComponent;
  let fixture: ComponentFixture<WaitForItRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitForItRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaitForItRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
