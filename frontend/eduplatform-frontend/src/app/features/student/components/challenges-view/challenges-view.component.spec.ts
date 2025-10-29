import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengesViewComponent } from './challenges-view.component';

describe('ChallengesViewComponent', () => {
  let component: ChallengesViewComponent;
  let fixture: ComponentFixture<ChallengesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengesViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
