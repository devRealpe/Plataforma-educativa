import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HintsViewerModalComponent } from './hints-viewer-modal.component';

describe('HintsViewerModalComponent', () => {
  let component: HintsViewerModalComponent;
  let fixture: ComponentFixture<HintsViewerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HintsViewerModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HintsViewerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
