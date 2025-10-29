import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewChallengeSubmissionModalComponent } from './review-challenge-submission-modal.component';

describe('ReviewChallengeSubmissionModalComponent', () => {
  let component: ReviewChallengeSubmissionModalComponent;
  let fixture: ComponentFixture<ReviewChallengeSubmissionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewChallengeSubmissionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewChallengeSubmissionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
