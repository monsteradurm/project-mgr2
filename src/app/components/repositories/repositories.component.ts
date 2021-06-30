import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { RepositoryService } from 'src/app/services/repository.service';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  styleUrls: ['./repositories.component.scss']
})
export class RepositoriesComponent implements OnInit {

  constructor(private repositories: RepositoryService) { }

  ngOnInit(): void {
  }
  DownloadLatest() {
    this.repositories.LastUpdate$.pipe(take(1)).subscribe((result) => {
      window.open(result, "_blank")
    })
  }
  Repositories$ = this.repositories.LastUpdate$;
}
