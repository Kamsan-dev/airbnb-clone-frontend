import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, InputSignal, OnInit, Output } from '@angular/core';
import { Category, CategoryName } from '../../../../layout/category/category.model';
import { CategoryService } from '../../../../layout/category/category.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-step',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './category-step.component.html',
  styleUrl: './category-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryStepComponent implements OnInit {
  public categoryName: InputSignal<CategoryName> = input.required<CategoryName>();
  public categories: Category[] | undefined;

  @Output()
  public categoryChange = new EventEmitter<CategoryName>();

  @Output()
  public stepValidityChange = new EventEmitter<boolean>();

  public categoryService = inject(CategoryService);

  ngOnInit(): void {
    this.loadCategories();
  }
  private loadCategories() {
    this.categories = this.categoryService.getCategories();
  }

  public onSelectCategory(event: CategoryName): void {
    this.categoryChange.emit(event);
    this.stepValidityChange.emit(true);
  }
}
