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
    class SVNJSError extends Error {
        constructor(message) {
          super(message);
          this.name = "SVNJSError";
        }
    }
    
    svnjs.Error = SVNJSError;
})()
