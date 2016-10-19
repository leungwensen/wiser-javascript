#!/usr/bin/env node
'use strict';
/**
 * xml2sqlite module
 * @module xml2sqlite
 * @see module:index
 */
const fs = require('fs');
const path = require('path');
const XMLLite = require('xml-lite');
//const sqlite = require('sql.js');
const es = require('event-stream');
const lang = require('zero-lang');

//fs.readFile(path.resolve(__dirname, '../spec/fixtures/zhwiki-20161001-pages-articles4.xml'), (err, data) => {
//    if (err) {
//        console.error(err);
//    }
//    let doc;
//    try {
//        doc = XMLLite.parse(data).documentElement;
//    } catch (e) {
//        console.log(doc);
//    }
//});
const IN_PAGE = 'in-page';
const OUT_OF_PAGE = 'out-of-page';

let count = 0;
let status = OUT_OF_PAGE;
let stack = [];

fs.createReadStream(path.resolve(__dirname, '../spec/fixtures/zhwiki-20160920-pages-articles.xml'))
    .pipe(es.split())
    .pipe(es.map((data) => {
        if (count < 100) {
            const trimmed = lang.trim(data);
            if (trimmed === '<page>') {
                status = IN_PAGE;
            }
            if (status === IN_PAGE) {
                stack.push(trimmed);
            }
            if (trimmed === '</page>') {
                const xml = stack.join('\n');
                const doc = XMLLite.parse(xml).documentElement;
                // console.log(doc);
                const idNode = XMLLite.findChildNode(doc, {
                    tagName: 'id'
                });
                const id = idNode ? idNode.textContent : `temp-${count}`;
                fs.writeFile(path.resolve(__dirname, `../spec/fixtures/pages/${id}.xml`), XMLLite.beautify(xml), (err) => {
                    if (err) console.error(err);
                });
                count++;
                stack = [];
                status = OUT_OF_PAGE;
                console.log(`parsing page count: ${count}`);
            }
        }
    }));
