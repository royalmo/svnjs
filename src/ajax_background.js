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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery == "SVNJSrequest") {
            //console.log("Processing new SVNJSrequest: " + request);
            fetch(request.path, request.options)
            .then(response => response.text().then(text => {
                var parsedResponse = {
                    status: response.status,
                    statusText: response.statusText,
                    body: text,
                };
                sendResponse(parsedResponse);
            }))
            .catch(error => {
                console.error(error);
                var parsedResponse = {
                    status: 0,
                    statusText: "Network Error",
                    body: error
                };
                sendResponse(parsedResponse);
            });
            return true;
        }
    }
);
