import { parse } from 'url';

import { Route, CustomResource } from './route';
import { createError, RestfulErrorType } from '../utils';

/**
 * Sort routerList by weight.
 * 
 * @param array 
 */
const _insertSort = function (array: Route[]) {
    let length = array.length,
        j, temp;

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

    constructor() { }

    addRoute(path: string, Resource: { new(): CustomResource }) {
        if (this.pathCache[path] !== undefined) {
            throw createError({
                message: `Source path: ${path} used twice.`,
            }, Router);
        }
        this.pathCache[path] = true;

        try {
            const resource = new Resource();
            const route = new Route(path, resource);

            this.routeList.push(route);
            _insertSort(this.routeList);
        } catch (error) {
            switch (error.type) {
                case RestfulErrorType.ROUTE:
                    throw error;
                default:
                    throw createError({
                        message: `Instance Resource: "${Resource.name}" throws an error: "${error.message}".`
                    }, Router);
            }
        }
    }

    getResource(url: string) {
        const pathname = parse(url).pathname;
        const routeList = this.routeList;

        for (let i = 0, len = routeList.length; i < len; i++) {
            const route = routeList[i];
            const urlPara = route.match(pathname);

            if (urlPara !== null) {
                return {
                    urlPara: urlPara,
                    resource: route.resource
                }
            }
        }

        return {
            urlPara: null,
            resource: null
        };
    }

    isEmpty() {
        return this.routeList.length === 0;
    }
}
