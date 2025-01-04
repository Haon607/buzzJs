import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotlightRoundComponent } from './spotlight.round.component';

describe('SpotlightRoundComponent', () => {
  let component: SpotlightRoundComponent;
  let fixture: ComponentFixture<SpotlightRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotlightRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotlightRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
