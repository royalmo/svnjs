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
    class WebDav {
        constructor (opts) {
            this.auth = 'Basic ' + opts.auth;
            this.base = opts.base;
            this.msg = opts.msg;
            this.handlers = opts.handlers;
            this.success = opts.success;
            this.error = opts.error;
            this.progress = opts.progress;
            this.background_ajax = opts.webdav.background_ajax;
            
            this.host = this.base.split('/', 3).join('/');
        }

        req_ajax (opts) {
            return svnjs._ajax({
                host : this.host,
                background_ajax : this.background_ajax,
                auth : this.auth,
                ...opts
            })
        }

        req_options () {
            return new Promise( (resolve, reject) => {
                this.req_ajax({
                    type : 'OPTIONS',
                    path : this.base,
                    headers : {
                        'Content-type': 'text/xml;charset=utf-8'
                    },
                    content: "<?xml version=\"1.0\" encoding=\"utf-8\"?><D:options xmlns:D=\"DAV:\"><D:activity-collection-set/></D:options>"
                }).then(response => {
                    if (response.status != 200) {
                        reject("OPTIONS", response);
                        return;
                    }
                    this._parseOptions(response);
                    resolve();
                });
            });
        }

        _parseOptions (response) {
            act_regex = /<D:activity-collection-set><D:href>([^<]+)<\/D:href>/;
            this.act = response.body.match(act_regex)[1];
            this.unique_key = this._getUniqueKey();
        }

        _getUniqueKey () {
            var key = [];
            var lens = [8, 4, 4, 4, 12];
            for (var i = 0; i < 5; i++) {
                var len = lens[i];
                var arr = [];
                for (var j = 0; j < len; j++)
                    arr.push(this._getRandomChar());
                key.push(arr.join(''));
            }
            return key.join('-');
        }
    
        _getRandomChar () {
            var source = '0123456789abcdefghijklmnopqrstuvwxyz';
            return source.charAt(
                Math.round(
                    Math.random() * 36)
            );
        }

        req_propfind ( path=this.base, prop ) {
            return new Promise ( (resolve, reject) => {
                this.req_ajax({
                    type : 'PROPFIND',
                    path : path,
                    headers : {
                        'Depth': 0,
                        'Content-type': 'text/xml;charset=utf-8'
                    },
                    content : [
                        '<?xml version="1.0" encoding="utf-8"?>',
                        '<D:propfind xmlns:D="DAV:">',
                        prop ? prop : '<D:allprop />',
                        '</D:propfind>'
                    ].join('')
                }).then( response => {
                    if (response.status != 207) {
                        reject("PROPFIND", response);
                        return;
                    }
                    this._parseResponse(response.body);
                    resolve();
                });
            });
        }

        _parseResponse (txt) {
            var regexs = {
                'vcc': /version-controlled-configuration><D:href>([^<]+)<\/D:href>/,
                'cki': /:checked-in><D:href>([^<]+)<\/D:href>/,
                'cko': /<\w+>Checked-out resource (\S+) has been created/,
                'blc': /:baseline-collection><D:href>([^<]+)<\/D/,
                'blr': /:baseline-ralative-path>([^<]+)<\//
            };
            for (var prop in re) {
                this.props[prop] = txt.match(regexs[prop])[1];
            }
        }

        req_mkactivity () {
            return new Promise ( (resolve, reject) => {
                this.req_ajax({
                    type: 'MKACTIVITY',
                    path: self.act + self.uniqueKey
                }).then(response => {
                    if (response.status != 201) {
                        reject("MKACTIVITY", response);
                        return;
                    }
                    resolve();
                })
            });
        }

        req_checkout (path = this.props.vcc) {
            return new Promise ((resolve, reject) => {
                this.req_ajax({
                    type : 'CHECKOUT',
                    path : path,
                    content : [
                        '<?xml version="1.0" encoding="utf-8"?>',
                        '<D:checkout xmlns:D="DAV:">',
                        '<D:activity-set><D:href>', self.act + self.uniqueKey, '</D:href>',
                        '</D:activity-set><D:apply-to-version/></D:checkout>'
                    ].join('')
                }).then(response => {
                    if (response.status != 201) {
                        this.rmact();
                        reject("CHECKOUT", response);
                        return;
                    }
                    this._parseResponse(response.body)
                    resolve();
                });
            });
        }



        _getProppatchXML (propset, propdel) {
            var xml = [];
            if (propset) {
                xml.push('<D:set>');
                for (var ns in propset)
                    xml.push(
                        '<D:prop>',
                        '<S:', ns, ' >', propset[ns],
                        '</S:', ns, '>',
                        '</D:prop>'
                    );
                xml.push('</D:set>');
            }
            if (propdel) {
                xml.push('<D:remove>');
                for (var i = 0, ns; ns = propdel[i]; i++)
                    xml.push(
                        '<D:prop>',
                        '<S:', ns, ' />',
                        '</D:prop>'
                    );
                xml.push('</D:remove>');
            }
            return xml.join('');
        }

    }

    svnjs._WebDav = WebDav;
})();
