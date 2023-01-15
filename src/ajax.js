/*
 * Copyright (C) 2023 Eric Roy
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see http://www.gnu.org/licenses/.
*/

"use strict";

if (typeof svnjs === "undefined")
    svnjs = {};

(function () {
    /* 
    options : {
        path : string (can be relative path),
        type : string (request type),
        host : string (needed for relative path),
        background_ajax : bool,
        noAuth : bool (if header auth isn't required),
        content : string (request body),
        headers : {key: value, ...}
    }
    */
    svnjs._ajax = function (options) {
        // Without host it fails in firefox
        if (!options.path.startsWith(options.host))
            options.path = options.host + options.path;

        var base_func = options.background_ajax ? chrome.runtime.sendMessage : foregroud_request;

        var requestHeaders = new Headers();

        if (!options.noAuth)
            requestHeaders.append("Authorization", self.auth);

        if (options.headers) {
            for(var key in options.headers) {
                var val = options.headers[key];
                requestHeaders.append(key, val);
            }
        }

        return new Promise (resolve => {
            base_func({
                contentScriptQuery: "SVNJSrequest",
                path: options.path,
                options: {
                    credentials: 'omit',
                    method: options.type,
                    cache: 'no-cache',
                    headers: requestHeaders,
                    body: options.content
                }
            })
            .then(response => {
                resolve(response);
            });
        });
    }

    // A foreground request may not work in Cross-origin requests.
    function foregroud_request(data) {
        return new Promise( (resolve, reject) => {
            fetch(data.path, data.options)
            .then(response => response.text().then(text => {
                var parsedResponse = {
                    status: response.status,
                    statusText: response.statusText,
                    body: text,
                };
                resolve(parsedResponse);
            }))
            .catch(error => {
                console.error(error);
                var parsedResponse = {
                    status: 0,
                    statusText: "Network Error",
                    body: error
                };
                resolve(parsedResponse);
            });
        })
    }
})();
