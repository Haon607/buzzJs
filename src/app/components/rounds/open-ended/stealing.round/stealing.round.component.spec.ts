import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StealingRoundComponent } from './stealing.round.component';

describe('StealingRoundComponent', () => {
  let component: StealingRoundComponent;
  let fixture: ComponentFixture<StealingRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StealingRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StealingRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
