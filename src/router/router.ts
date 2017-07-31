import { IncomingMessage } from 'http';
import { parse } from 'url';

import { Route } from './route';
import { Resource } from '../resource';
import { arrHas, throwError } from '../utils';

export interface CustomResource extends Resource { }
export interface ResourceRouter {
    route: Route;
    id: string;
    resource: CustomResource;
}

const routerList: ResourceRouter[] = [];

const getRoute = function (req: IncomingMessage) {
    const pathname = parse(req.url).pathname;

    for (let i = 0, len = routerList.length; i < len; i++) {
        let resource = routerList[i];

        const route = resource.route;
        const params = route.parse(pathname);

        if (params !== null) {
            return {
                params: params,
                resource: resource.resource
            }
        }
    }

    return {
        params: null,
        resource: null
    };
}

const addRoute = function <T extends Resource>(Resource: { new(): T }, path: string): void {
    if (arrHas(routerList, 'id', path)) {
        throwError(`The path:${path} already exists.`)
    }

    let resource: T;
    let route: Route;

    try {
        resource = new Resource();
        route = new Route(path);
        routerList.push({
            id: path,
            route: route,
            resource: resource
        });
    } catch (error) {
        throw error;
    }
}

export default {
    getRoute,
    addRoute,
    routerList
}
