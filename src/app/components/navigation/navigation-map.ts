import { faCogs, faUsers, faThList, faCalendar, IconDefinition} from '@fortawesome/free-solid-svg-icons';
import { faWikipediaW} from '@fortawesome/free-brands-svg-icons'
import { ActionGroup } from '@ng-action-outlet/core';
import { LocalizedString } from '@angular/compiler';

export class DropDownMenuGroup {
    icon: string;
    background: string;
    menu: ActionGroup;
    title:string;
    use_menu: boolean = true;
    constructor(t:string, i: string, b:string, um:boolean = true) {
        this.icon = i;
        this.background = b;
        this.title = t;

        if (!um)
            this.use_menu = false;
    }
}

export const NavigationMap = {
    Home: new DropDownMenuGroup("Home", 'home', "rgb(64, 120, 251)", false),
    Projects: new DropDownMenuGroup("Projects", 'view_list', "rgb(0, 152, 118)"),
    People: new DropDownMenuGroup("People", 'account_circle', "rgb(153, 87, 255)", false),
    Scheduling: new DropDownMenuGroup("Scheduling", 'schedule', "rgb(53, 179, 255)", false),
    System: new DropDownMenuGroup("System", 'settings', "#c80051", false)
}

