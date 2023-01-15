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
    // Inner function. Opts is an object that must contain:
    // - auth : string, svn auth
    // - base : string, svn path
    // - msg : string, commit message
    // - background_ajax : bool, wether ajax is performed in a background script
    // - handlers : list, commit tasks
    // - success : func()
    // - error : func()
    // - progress : func(msg : string, percent : int)

    svnjs._commit = function (opts) {
        var webdav = svnjs._WebDav(opts);

        var parsed_message = { set : { log : message } };

        webdav.req_options()
        .then(() => webdav.req_propfind())
        .then(() => webdav.req_mkactivity())
        .then(() => webdav.req_checkout())
        .then(() => webdav.req_proppatch(props=parsed_message))
        .then(() => {
            return new Promise ( (resolve, reject) => {
                perform_tasks(webdav, tasks, resolve, reject);
            });       
        })
        .then(() => webdav.req_merge())
        .then(resolve)
        .catch(reject);
    };

    perform_tasks = function(webdav, tasks, resolve, reject) {
        var current_task = tasks.shift();
        var method = current_task.method;
        var params = current_task.params;
        var checkout_url = params[0];

        dav.CHECKOUT(url)
        .then( () => {
            var func;
            switch (method) {
                case "PUT":
                    webdav.req_put
                    break;

                default:
                    console.warn(method);
                    break;
            }
            return func(params);
        })
        .then( () => {
            if (tasks.length > 0) {
                perform_tasks(webdav, tasks, resolve, reject);
            }
            else {
                resolve();
            }
        })
        .catch(reject);
    }

})()
