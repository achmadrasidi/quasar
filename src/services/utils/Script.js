import evaluate from "static-eval";
import { parse } from "esprima";

export default class Script
{
    static run = (script, context = {}) =>
    {
        let value;
        try
        {
            value = eval("with(context) { " + script + " }");
        } catch (e)
        {
            if (e instanceof SyntaxError)
            {
                try
                {
                    value = new Function("with(this) { " + script + " }").call(context);
                } catch (e)
                {
                    console.error(e);
                }
            }
        }

        return value;
    }

    static expression = (expression, context = {}) =>
    {
        try
        {
            const asc = parse(expression).body[0].expression;
            return evaluate(asc, context);
        } catch (e)
        {
            console.error(e.message);
            return undefined;
        }
    }
};