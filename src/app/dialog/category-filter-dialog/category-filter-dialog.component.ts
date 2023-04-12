import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-category-filter-dialog',
  templateUrl: './category-filter-dialog.component.html',
  styleUrls: ['./category-filter-dialog.component.scss']
})
export class CategoryFilterDialogComponent implements OnInit {

  category!: any;

  formGrp!: FormGroup;
  categoryControl!: FormControl;

  allSearchedCategory: any[] = ["General", "Express", "Luxury"];
  filteredCategoryOptions!: Observable<any[]>;

  constructor(public dialogRef: MatDialogRef<CategoryFilterDialogComponent>, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 

    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredCategoryOptions = this.categoryControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCategory(value)),
    );
  }

  initFormGrp() {
    this.categoryControl = new FormControl('', [Validators.required]);

    this.formGrp = this.formBuilder.group(
      {
        category : this.categoryControl
      }
    );
  }

  _filterCategory(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedCategory.filter(option => option.toLowerCase().includes(filterValue));
  }

  onCategorySelectionChanged(category: any, event: any) {
    if(event.isUserInput) {
      this.category = category;
    }
  }
  
  onSubmit() {
    if(this.category == null) {
      return;
    }
    this.dialogRef.close(this.category);
  }

}
