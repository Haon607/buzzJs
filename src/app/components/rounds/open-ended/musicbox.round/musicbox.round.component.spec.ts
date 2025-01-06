import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicboxRoundComponent } from './musicbox.round.component';

describe('MusicboxRoundComponent', () => {
  let component: MusicboxRoundComponent;
  let fixture: ComponentFixture<MusicboxRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicboxRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicboxRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
