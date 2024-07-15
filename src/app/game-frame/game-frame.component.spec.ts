import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameFrameComponent } from './game-frame.component';

describe('GameFrameComponent', () => {
  let component: GameFrameComponent;
  let fixture: ComponentFixture<GameFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameFrameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
