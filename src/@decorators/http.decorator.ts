import e from "express";
import server from "../server";
import { Redirect, ResponseError } from "src/controllers";
import { ControllerData, HttpMethod } from "src/@types";


function methodHandler(route: string, method: HttpMethod): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        const handler = async function (req: e.Request, res: e.Response) {
            try {
                const data = await descriptor.value({
                    body: req.body,
                    query: req.query,
                    headers: req.headers,
                    params: req.params,
                    response: res,
                } as ControllerData);
                if (data instanceof Redirect) {
                    return res.redirect(data.route)
                }
                res.status(data.status).send(data.message);
            } catch (e) {
                if (e instanceof ResponseError) {
                    return res.status(e.status).send({ message: e.message });
                }
                return res.status(500).send({ message: e.message });
            }
        }
        server[method](`/${route}`, handler);
        console.log(`Registered ${method.toUpperCase()} /${route}`)
    }
}

export const GET = (route: string) => methodHandler(route, HttpMethod.GET);
export const POST = (route: string) => methodHandler(route, HttpMethod.POST);
export const DELETE = (route: string) => methodHandler(route, HttpMethod.DELETE);
export const PUT = (route: string) => methodHandler(route, HttpMethod.PUT);