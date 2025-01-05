import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FastestRoundComponent } from './fastest.round.component';

describe('FastestRoundComponent', () => {
  let component: FastestRoundComponent;
  let fixture: ComponentFixture<FastestRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FastestRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FastestRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
