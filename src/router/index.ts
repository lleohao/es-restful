import { parse } from "url";

import { createError, RestfulErrorType } from "../utils";
import { CustomResource, Route } from "./route";

/**
 * Sort routerList by weight.
 *
 * @param array
 */
const insertSort = (array: Route[]) => {
    const length = array.length;
    let j, temp;

    for (let i = 1; i < length; i++) {
        j = i;
        temp = array[i];

        while (j > 0 && array[j - 1].weight > temp.weight) {
            array[j] = array[j - 1];
            j--;
        }
        array[j] = temp;
    }
};

export class Router {
    private routeList: Route[] = [];
    private pathCache: {} = {};

    public addRoute(path: string, Resource: { new(): CustomResource }) {
        if (this.pathCache[path] !== undefined) {
            throw createError({
                message: `Source path: ${path} used twice.`,
                type: RestfulErrorType.ROUTER
            }, this.addRoute);
        }
        this.pathCache[path] = true;

        try {
            const resource = new Resource();
            const route = new Route(path, resource, this);

            this.routeList.push(route);
            insertSort(this.routeList);
        } catch (error) {
            switch (error.type) {
                case RestfulErrorType.ROUTE:
                case RestfulErrorType.ROUTER:
                    throw error;
                default:
                    throw createError({
                        message: `Instance Resource: "${Resource.name}" throws an error: "${error.message}".`,
                    }, this.addRoute);
            }
        }
    }

    public getResource(url: string) {
        const pathname = parse(url).pathname;
        const routeList = this.routeList;

        for (let i = 0, len = routeList.length; i < len; i++) {
            const route = routeList[i];
            const urlPara = route.match(pathname);

            if (urlPara !== null) {
                return {
                    resource: route.resource,
                    urlPara,
                };
            }
        }

        return {
            resource: null,
            urlPara: null,
        };
    }

    public isEmpty() {
        return this.routeList.length === 0;
    }
}
