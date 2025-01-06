import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkippingRoundComponent } from './skipping.round.component';

describe('SkippingRoundComponent', () => {
  let component: SkippingRoundComponent;
  let fixture: ComponentFixture<SkippingRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkippingRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkippingRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
