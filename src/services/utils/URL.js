import { parse } from "path-to-regexp";
import RestService from "../RestService";

export default class URL
{
    static parsePath(val)
    {
        const [path, ...rest] = parse(val);
        const params = rest.filter(v => v && typeof v === "object");
        const key = params.length ? params[0].name : null;
        return { path, params, key }
    }
};
