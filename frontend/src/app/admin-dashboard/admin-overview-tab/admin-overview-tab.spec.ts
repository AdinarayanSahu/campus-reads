import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOverviewTabComponent } from './admin-overview-tab';

describe('AdminOverviewTabComponent', () => {
  let component: AdminOverviewTabComponent;
  let fixture: ComponentFixture<AdminOverviewTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOverviewTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOverviewTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
