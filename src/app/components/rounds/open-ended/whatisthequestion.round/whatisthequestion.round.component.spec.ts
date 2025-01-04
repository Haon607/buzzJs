import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatisthequestionRoundComponent } from './whatisthequestion.round.component';

describe('WhatisthequestionRoundComponent', () => {
  let component: WhatisthequestionRoundComponent;
  let fixture: ComponentFixture<WhatisthequestionRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatisthequestionRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatisthequestionRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
