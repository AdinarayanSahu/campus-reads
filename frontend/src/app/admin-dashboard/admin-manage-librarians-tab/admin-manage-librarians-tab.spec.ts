import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManageLibrariansTabComponent } from './admin-manage-librarians-tab';

describe('AdminManageLibrariansTabComponent', () => {
  let component: AdminManageLibrariansTabComponent;
  let fixture: ComponentFixture<AdminManageLibrariansTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManageLibrariansTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManageLibrariansTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
