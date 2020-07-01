'use strict';

const hljs = require('highlight.js');
const fc = require('./functions');

/**
 * Javascript version of https://gist.github.com/jbroadway/2836900
 *
 * Slimdown - A very basic regex-based Markdown parser. Supports the
 * following elements (and can be extended via Slimdown::add_rule()):
 *
 * Author: Johnny Broadway <johnny@johnnybroadway.com>
 * Modified by Sebastian Korotkiewicz <Kuscos>
 * Website: https://gist.github.com/jbroadway/2836900
 * 
 * License: MIT
 */
class Slimdown {

    constructor() {
        // Rules
        this.rules = [

            {regex: /\[([^[]+)\]\(([^)]+)\)/g, replacement: '<a href=\'$2\'>$1</a>'},  // hyperlink
            {regex: /(\*\*|__)(.*?)\1/g, replacement: '<strong>$2</strong>'},          // bold
            {regex: /(\*|_)(.*?)\1/g, replacement: '<em>$2</em>'},                     // emphasis
            {regex: /~~(.*?)~~/g, replacement: '<del>$1</del>'},                       // del
            {regex: /:"(.*?)":/g, replacement: '<q>$1</q>'},                           // quote
            {regex: /`(.*?)`/g, replacement: '<code>$1</code>'},                       // inline code
            {regex: /((?:^&gt;.*?$\n)+)/gm, replacement: blockquote},                 // single and multiline blockquotes
            {regex: /((?:^!(.*).*?$\n)+)/gm, replacement: spoiler},                   // spoiler
            {regex: /\n/g, replacement: '<br>'},
            {regex: /(<br\s*\/?>){3,}/g, replacement: '<br><br>'},
            {regex: /<\/blockquote><blockquote>/g, replacement: '\n'}                  // fix extra blockquote

        ];

        function spoiler(text) {
            var id = Math.random().toString(36).substring(7);
            text = text.replace(/(^!)/gm, '');
            return `<input type="checkbox" id="checker-${id}" class="checker"><label for="checker-${id}" id="checker-${id}" class="toggle">show spoiler</label><div class="spoiler"><code class="text">${text}</code></div>`;
        }

        function blockquote(text) {
            text = text.replace(/(^&gt;)/gm, '');
            //text = text.replace(/(^> )/gm, '');
            return `<blockquote>${text.trim()}</blockquote>`;
        }

    }

    highlight(text) {
        var regex = /```(.*)[a-z]*\n\s*([^]+?.*?[^]+?[^]+?)\n```/g;
        var match = regex.exec(text);
        var language = match[1];
        var content = match[2];

        if (language) {
            var highlightedCode = hljs.highlight(language, content).value
        } else {
            highlightedCode = hljs.highlightAuto(content).value
        }

        text = text.replace(regex, `<pre><code class="hljs">${highlightedCode}</code></pre>`);
        return text;
    }

    // Add a rule.
    addRule(regex, replacement) {
        regex.global = true;
        regex.multiline = true;
        this.rules.push({
            regex,
            replacement,
        });
    }

    // Render some Markdown into HTML.
    render(text) {
        //text = `\n${text}\n`;
        if ( /```\s*([^]+?.*?[^]+?[^]+?)```/g.test(text) ) {
            text = this.highlight(text);
        } else {
            text = fc.cleanHtml(text);
            this.rules.forEach( (rule) => {
                text = text.replace(rule.regex, rule.replacement);
            });
        }
        return text.trim();
    }
}

////////////

module.exports = Slimdown;