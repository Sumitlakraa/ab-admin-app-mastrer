import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { throwError } from "rxjs";

export class NetworkUtil {

  static handleErrorForAll2(error: HttpErrorResponse, snackBar: MatSnackBar) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }

    let errorMsg = 'Something bad happened; please try again later.';
    this.showSnackBar(snackBar, errorMsg);

    // Return an observable with a user-facing error message.
    return throwError(() => new Error(errorMsg));
  }

    static handleErrorForAll(error: HttpErrorResponse) {
        if (error.status === 0) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          console.error(`Backend returned code ${error.status}, body was: `, error.error);
        }

        let errorMsg = 'Something bad happened; please try again later.';

        // Return an observable with a user-facing error message.
        return throwError(() => new Error(errorMsg));
    }

    static showSnackBar(snackBar: MatSnackBar, message: string) {
        snackBar.open( message, '', {
          duration: 2 * 1000,
        });
    }

    static showSnackBarFor1Min(snackBar: MatSnackBar, message: string) {
      snackBar.open( message, '', {
        duration: 60 * 1000,
      });
  }

}