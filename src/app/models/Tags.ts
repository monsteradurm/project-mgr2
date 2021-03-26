  import * as _ from 'underscore';

  export class Tag {
    id: number;
    text: string;
  
    constructor(id: number, text: string) {
      this.id = id;
      this.text = text;
    }
  }

export class Tags {

    title: string;
    text: string;
    id: string;
    additional_info: string; // json
    value: any; //json

    constructor(cv: any) {
        this.title = cv.title;
        this.text = cv.text;
        this.id = cv.id;
        this.additional_info = JSON.parse(cv.additional_info);
        this.value = JSON.parse(cv.value);
    }

    public static ToTags(tags: Tags, col_key) : Tag[] {
        let Departments = [];
        let ExistingIds = [];
        _.forEach(tags, tag => {
          if (!tag.value || !tag.text || tag.title != col_key || tag.id != "tags")
            return;
    
          let value = JSON.parse(tag.value);
          if (!value.tag_ids)
            return;
    
          let ids = value.tag_ids;
          if (ids.length == 1 && ExistingIds.indexOf(ids[0]) == -1) {
            Departments.push(new Tag(ids[0], tag.text));
            ExistingIds.push(ids[0])
            return;
    
          } else if (ids.length == 1)
            return;
    
          let multitagged = _.filter(
            _.zip(ids, tag.text.split(', ')), d=> ExistingIds.indexOf(d[0]) == -1)
    
            multitagged.forEach(d => {
              Departments.push(new Tag(d[0], d[1]))
              ExistingIds.push(d[0]);
            })
        });
        return Departments;
    
      }
}