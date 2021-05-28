import { Observable, SchedulerLike } from "rxjs";
import { shareReplay } from "rxjs/operators";

export class shareReplayUntil<T> {

    private sharedReplay$: Observable<T>;
    private subscriptionTime: number;


   sharedReplayTimerRefresh(
       source: Observable<T>, bufferSize: number = 1,
       windowTime: number = 3000000,  scheduler?: SchedulerLike): Observable<T> {

        const currentTime = new Date().getTime();
        if (!this.sharedReplay$ || 
            currentTime - this.subscriptionTime > windowTime) {
            this.sharedReplay$ = source.pipe(shareReplay(
                bufferSize, windowTime, scheduler));
            this.subscriptionTime = currentTime;
        }

        return this.sharedReplay$;
    }
}