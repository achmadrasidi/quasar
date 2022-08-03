export default class String
{
  static uuidv4()
  {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
    {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static alias(string)
  {
    if (string)
    {
      const array = string.match(/\b\w/g);
      if (array && Array.isArray(array))
      {
        return array.length > 1 ? array[0] + array[array.length - 1] : array[0];
      }

      return null;
    }

    return null;
  }

  static camelCaseToString = (str) =>
  {
    const result = str.replace(/([A-Z])/g, " $1");
    return String.titleCase(result);
  }

  static titleCase(str)
  {
    if (!str) return null;
    var splitStr = str.toLowerCase().split(/ |_/);
    for (var i = 0; i < splitStr.length; i++)
    {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }

    return splitStr.join(' ');
  }

  static toThousand(v, locale = "id", decimal = 2)
  {
    if (!v) return 0;

    const regex = new RegExp("^-?\\d+(?:.\\d{0," + (decimal || -1) + "})?");
    const fixed = parseFloat(v.toString().match(regex)[0]);

    return new Intl.NumberFormat(locale).format(fixed);
  }
};
