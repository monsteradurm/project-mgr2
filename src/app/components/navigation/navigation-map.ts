import { faCogs, faUsers, faThList, faCalendar, IconDefinition} from '@fortawesome/free-solid-svg-icons';
import { faWikipediaW} from '@fortawesome/free-brands-svg-icons'
import { ActionButton, ActionGroup } from '@ng-action-outlet/core';
import { LocalizedString } from '@angular/compiler';
import * as _ from 'underscore';

export class DropDownMenuGroup {
    icon: string;
    background: string;
    menu: any;
    title:string;
    use_menu: boolean = true;
    route: string;
    id: string;
    constructor(item: Partial<DropDownMenuGroup>) {
        this.icon = item.icon;
        this.background = item.background;
        this.menu = null;
        this.title = item.title;
        this.route = item.route;
        this.use_menu = item.use_menu;
        this.id = item.id;
    }
    /*
    constructor(id: string, t:string, i: string, b:string, route:string, um:boolean = true) {
        this.id = id;
        this.icon = i;
        this.background = b;
        this.title = t;
        this.route = route;
        if (!um)
            this.use_menu = false;
    }*/
}


export class NavigationMapping {
    Pages: {[title: string]: DropDownMenuGroup} = {}

    Titles: string[] = []
    constructor(pages: Partial<DropDownMenuGroup>[]) {
        this.Pages = {};
        pages.forEach(page => {
            this.Pages[page.title] = new DropDownMenuGroup(page); 
            this.Titles.push(page.title);
        });

        /*
        pages.forEach(page => {
            let icon = _.find(page.column_values, c=> c.title == 'Icon').text;
            let color = _.find(page.column_values, c=> c.title == 'Color').text;
            let use_menu = _.find(page.column_values, c=> c.title == 'Menu').text == 'v';
            let route = _.find(page.column_values, c=> c.title == 'Route').text;

            this.Pages[page.name] =
                new DropDownMenuGroup(page.id, page.name, icon, color, route, use_menu);
            
            this.Titles.push(page.name);
        })
        */
    }
}
