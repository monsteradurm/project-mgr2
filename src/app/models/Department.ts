import * as _ from 'underscore';

export class Department {
  id: number;
  text: string;

  constructor(id: number, text: string) {
    this.id = id;
    this.text = text;
  }
}

export class DepartmentTags {
  title: string;
  text: string;
  id: string;
  additional_info: string; // json
  value: string; //json

  public static ToDepartments(tags: DepartmentTags) : Department[] {
    let Departments = [];
    let ExistingIds = [];
    _.forEach(tags, tag => {
      if (!tag.value || !tag.text || tag.title != "Departments" || tag.id != "tags")
        return;

      let value = JSON.parse(tag.value);
      if (!value.tag_ids)
        return;

      let ids = value.tag_ids;
      if (ids.length == 1 && ExistingIds.indexOf(ids[0]) == -1) {
        Departments.push(new Department(ids[0], tag.text));
        ExistingIds.push(ids[0])
        return;

      } else if (ids.length == 1)
        return;

      let multitagged = _.filter(
        _.zip(ids, tag.text.split(', ')), d=> ExistingIds.indexOf(d[0]) == -1)

        multitagged.forEach(d => {
          Departments.push(new Department(d[0], d[1]))
          ExistingIds.push(d[0]);
        })
    });
    return Departments;

  }
}