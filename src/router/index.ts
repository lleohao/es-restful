import { parse } from 'url';

import { Route, CustomResource } from './route';

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
            throw Error(`Source path: ${path} used twice.`)
        }
        this.pathCache[path] = true;

        try {
            const resource = new Resource();
            const route = new Route(path, resource);

            this.routeList.push(route);
            _insertSort(this.routeList);
        } catch (error) {
            throw error;
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
