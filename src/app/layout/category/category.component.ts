import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoryService } from './category.service';
import { Category } from './category.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent implements OnInit {
  private categoryService: CategoryService = inject(CategoryService);
  public categories: Category[] | undefined;
  public currentActivatedCategory: Category = this.categoryService.getCategoryByDefault();

  ngOnInit(): void {
    this.loadCategories();
  }
  private loadCategories() {
    this.categories = this.categoryService.getCategories();
  }
}
