import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoryService } from './category.service';
import { Category, CategoryName } from './category.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

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
  private router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  public isHome = signal(false);
  public categories: Category[] | undefined;
  public currentActivatedCategory: Category = this.categoryService.getCategoryByDefault();

  ngOnInit(): void {
    this.loadCategories();
    this.listenRouter();
  }
  private loadCategories() {
    this.categories = this.categoryService.getCategories();
    this.currentActivatedCategory.activated = false;
  }

  private listenRouter(): void {
    this.router.events.pipe(filter((evt): evt is NavigationEnd => evt instanceof NavigationEnd)).subscribe({
      next: (evt: NavigationEnd) => {
        this.isHome.set(evt.url.split('?')[0] === '/');
        if (this.isHome() && evt.url.indexOf('?') === -1) {
          const categoryByTechnicalName = this.categoryService.getCategoryByTechnicalName('ALL');
          this.categoryService.changeCategory(categoryByTechnicalName!);
        }
      },
    });

    this.activatedRoute.queryParams.pipe(map((params) => params['category'])).subscribe({
      next: (categoryName: CategoryName) => {
        const category = this.categoryService.getCategoryByTechnicalName(categoryName);
        if (category) {
          this.activateCategory(category);
          this.categoryService.changeCategory(category);
        }
      },
    });
  }
  private activateCategory(category: Category) {
    this.currentActivatedCategory.activated = false;
    this.currentActivatedCategory = category;
    this.currentActivatedCategory.activated = true;
  }

  onChangeCategory(category: Category): void {
    this.activateCategory(category);
    this.router.navigate([], {
      queryParams: {
        category: category.technicalName,
      },
      relativeTo: this.activatedRoute,
    });
  }
}
