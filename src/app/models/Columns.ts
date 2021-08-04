  import * as _ from 'underscore';

  export class Tag {
    id: number;
    text: string;
    type: ColumnType;

    constructor(id: number, text: string, type: ColumnType) {
      this.id = id;
      this.text = text;
    }
  }
  
export enum ColumnType {
  Artist = 'Artist',
  Director = 'Director', 
  Timeline = 'Timeline',
  TimeTracking = 'Time Tracking',
  SubItems = 'SubItems',
  Department = 'Department', 
  Description = 'Description',
  Caption = 'Caption',
  ItemCode = 'ItemCode',
  Status = 'Status',
  Issuer = 'Issuer',
  Team = 'Team',
  Service = 'Service',
  Application = 'Application',
  Renderer ='Renderer',
  Support = 'Support',
  Due = 'Due',
  ExpectedDays = 'Expected Days'
} 
export class ColumnValues {

    title: string;
    text: string;
    id: string;
    additional_info: any; // json
    value: any; //json

    constructor(cv: any) {
        if (cv) {
          this.title = cv.title;
          this.text = cv.text;
          this.id = cv.id;
          this.additional_info = JSON.parse(cv.additional_info);
          this.value = JSON.parse(cv.value);

          if (this.value && this.value.date)
            this.value = this.value.date;
        }
        else {
          this.additional_info = {};
        }
    }

    public static ParseDistinct(tags: any[], type:ColumnType) {
      let values = this.ParseArray(tags, type);
      return _.uniq(values, v => v.id);
    }

    public static ParseFirst(tags: any[], type:ColumnType) {
      let values = this.ParseArray(tags, type);
      return values.length > 0 ? values[0] : null;
    }
    public static ParseValue(tags:any[], type: ColumnType) {
      let c = _.find(tags, v => v.title == type);
        if (c && c.value)
          return JSON.parse(c.value);
        return null;
    }

    public static IsTagType(type: ColumnType) {
      return type == ColumnType.Artist || type == ColumnType.Director
      || type == ColumnType.Department;
    }

    public static FindColumn(values: ColumnValues[], type: ColumnType, requiredValue: boolean = false) {
      if (!requiredValue)
        return _.filter(values, v => v.title == type);

      return _.filter(values, v=> v.title == type && v.value);
    }

    public static FindColumnId(values: ColumnValues[], type: ColumnType) { 
        let c = _.find(values, v => v.title == type);
        if (c && c.value && type == ColumnType.TimeTracking)
        if (c) return c.id;
        return null;
    }

    public static ParseArray(tags: any[], type:ColumnType) { 
      let values = _.map(tags, t=> new ColumnValues(t));

      if (type)
        values =  _.filter(values, v => v.title == type && v.value)

      if (!this.IsTagType(type))
        return values;

      let multi = _.filter(values, v => v.text.indexOf(',') > -1);
      
      let single = _.map(
          _.filter(values, v => v.text.indexOf(',') == -1), 
            v => type == ColumnType.Department ? 

            new Tag(v.value.tag_ids[0], v.text, type) : 
            new Tag(v.value.personsAndTeams[0].id, v.text, type)
      )

      if (multi.length < 1)
        return single;

      multi.forEach(v => {
        let textArr = v.text.split(', ')
        for(let i = 0; i < textArr.length; i++) {
          let id = type == ColumnType.Department ? 
            v.value.tag_ids[i] : v.value.personsAndTeams[i].id
          single.push(new Tag(id, textArr[i], type))
        }
      });

      return single;
    }
  }
