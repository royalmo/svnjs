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

(function(){

    class SVNJSClient {
        constructor (opts) {
            this._auth = opts.auth? opts.auth : btoa(opts.username + ':' + opts.password);
            this._base = opts.base;
            this._background_ajax = opts.background_ajax? opts.background_ajax : false;

            // A list of the actions to do before each commit.
            this._handlers = [];
            this._commit_done = false;
        }

        get tasks() {
            return this._handlers.length;
        }

        add (path, content) {
            _fail_if_commited();
            this._handlers.push({
                method: 'PUT',
                params: [path, content]
            });
        }
        del (path) {
            _fail_if_commited();
            this._handlers.push({
                method: 'DELETE',
                params: [path]
            });
        }
        copy (path, topath) {
            _fail_if_commited();
            _fail_no_implemented("Copy");
        }
        move (path, topath) {
            _fail_if_commited();
            _fail_no_implemented("Move");
        }
        lock () {
            _fail_if_commited();
            _fail_no_implemented("Lock");
        }
        unlock () {
            _fail_if_commited();
            _fail_no_implemented("Unlock");
        }
        mkdir (name) {
            _fail_if_commited();
            this._handlers.push({
                method: 'MKCOL',
                params: [name]
            });
        }
        propset (path, props) {
            _fail_if_commited();
            this._handlers.push({
                method: 'PROPPATCH',
                params: [
                    path, { set: props }
                ]
            });
        }
        propdel (path, props) {
            _fail_if_commited();
            this._handlers.push({
                method: 'PROPPATCH',
                params: [
                    path, { del: props }
                ]
            });
        }

        // progress_function can be of type func(msg : string, percent : int)
        commit (commit_message, progress_function=_default_progress_function) {
            _fail_if_commited();

            if (this.tasks === 0) {
                throw new svnjs.Error("Need at least 1 task to make a commit.");
            }

            return new Promise( (resolve, reject) => {
                svnjs._commit(opts = {
                    auth            : this.auth,
                    base            : this.base,
                    msg             : commit_message,
                    background_ajax : this.background_ajax,
                    handlers        : this.handlers,
                    progress        : progress_function,
                    error           : reject,
                    success         : () => {
                        this._commit_done=true;
                        resolve()
                    },
                })
            });
        }

        _fail_if_commited() {
            if (this._commit_done)
                throw new svnjs.Error("Instance already commited, please create a new svnjs.Client object to commit again.")
        }

        _fail_no_implemented(func_name = "This") {
            throw new svnjs.Error(func_name + " function isn't yet implemented!");
        }

        _default_progress_function(msg, percent) {
            console.log("[SVNJS Commit info] " + msg + " (" + percent + "%)");
        }

        // Aliases
        rm = remove = del;
        mv = rename = ren = move;
        pset = ps = propset;
        pdel = pd = propdel;
        //up = update;
    }

    svnjs.Client = SVNJSClient;
})();
