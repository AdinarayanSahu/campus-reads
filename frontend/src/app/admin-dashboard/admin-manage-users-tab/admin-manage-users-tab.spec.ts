import { TestBed } from '@angular/core/testing';
import { AdminManageUsersTabComponent } from './admin-manage-users-tab';

describe('AdminManageUsersTabComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManageUsersTabComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AdminManageUsersTabComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
