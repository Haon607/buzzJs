import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunktesammlerRoundComponent } from './punktesammler.round.component';

describe('PunktesammlerRoundComponent', () => {
  let component: PunktesammlerRoundComponent;
  let fixture: ComponentFixture<PunktesammlerRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PunktesammlerRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PunktesammlerRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
