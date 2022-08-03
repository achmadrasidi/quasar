import * as  moment from "moment";
import * as XLSX from "xlsx";

export default class Obj
{
  static clone = (obj) => JSON.parse(JSON.stringify(obj));

  static set = (fields, obj) =>
  {
    const keys = fields && Array.isArray(fields) ? fields : [];
    if (!keys.length) return obj;

    const res = {};
    for (const i in keys)
    {
      const k = keys[i];
      const v = obj[k];

      res[k] = v;
    }

    return res;
  }

  static setValueByPath(obj, path, value)
  {
    const a = path.split('.');
    let o = obj;
    while (a.length - 1)
    {
      const n = a.shift();
      if (!(n in o)) o[n] = {}
      o = o[n]
    }

    o[a[0]] = value;
  }

  static findNested(arr, keyName, key, nestingKey)
  {
    return arr.reduce((a, item) =>
    {
      if (a) return a;
      if (item[keyName] === key) return item;
      if (item[nestingKey]) return Obj.findNested(item[nestingKey], keyName, key, nestingKey);
    }, null);
  }

  static assignItems(sources, target, key)
  {
    for (const i in target)
    {
      const el = target[i];

      const x = sources.findIndex(s => s[key] === el[key]);
      if (x > -1)
      {
        sources[x] = Object.assign(sources[x], el[i]);
      } else
      {
        sources.push(el);
      }
    }
  }

  static arrayToObject(arrays, key, value)
  {
    return arrays.reduce((res, el) =>
    {
      res[el[key]] = el[value];
      return res;
    }, {});
  }

  static isNull(o)
  {
    if (!o || o === undefined) return null;
    if (Object.keys(o).length === 0) return null;

    return true;
  }

  static propExtractor(props)
  {
    if (Array.isArray(props)) return [...props];
    const iprops = { ...props };
    return Object.keys(iprops).map((k) =>
    {
      const el = iprops[k];
      const attribute = { name: k, value: null };
      if (k === "modelValue") attribute.type = "String";
      if (el.name)
      {
        attribute.type = el.name;
      } else
      {
        Object.keys(el).forEach(o =>
        {
          if (el[o] && el[o].name)
          {
            if (!attribute.type) attribute.type = [];
            if (typeof attribute.type === "string") attribute.type = [attribute.type];
            attribute.type.push(el[o].name);
          } else
          {
            switch (o)
            {
              case "type":
                if (Array.isArray(el[o])) attribute.type = el[o].map(el => el.name);
                else attribute.type = el[o].name;
                break;

              case "required":
                attribute.required = el[o];
                break;

              case "default":
                attribute.value = el[o];
                break;

              default:

                break;
            }
          }
        })
      }

      if (Array.isArray(attribute.type) && attribute.type.length === 1)
      {
        attribute.type = attribute.type[0];
      }

      return attribute;
    });
  }

  static eventExtractor(events)
  {
    if (!events) return [];
    if (Array.isArray(events))
    {
      const ievents = [...events];
      return ievents.map(el => el.name ? el : ({ name: el, value: null }));
    } else
    {
      const results = [];
      Object.keys(events).forEach(e =>
      {
        if (typeof events[e] === "string") results.push(events[e]);
        else results.push(e);
      });
    }
  }

  static exportExcel(header, data, filename)
  {
    const createXLSLFormatObj = [header].concat(data);

    const suffix = moment().format("YYYYMMDD-hhmm");
    filename = `${filename}-${suffix}.xlsx`;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);

    XLSX.utils.book_append_sheet(wb, ws);
    XLSX.writeFile(wb, filename);
  }
};
