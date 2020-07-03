'use strict';

const hljs = require('highlight.js');

/**
 * Javascript version of https://gist.github.com/jbroadway/2836900
 *
 * Slimdown - A very basic regex-based Markdown parser. 
 *
 * Author: Johnny Broadway <johnny@johnnybroadway.com>
 * 
 * Modified by: Sebastian Korotkiewicz <Kuscos>
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

    highlight(language, content) {
        if (language) {
            var highlightedCode = hljs.highlight(language, content).value
        } else {
            highlightedCode = hljs.highlightAuto(content).value
        }
        return `<pre><code class="hljs">${highlightedCode}</code></pre>`;
    }

    // Render some Markdown into HTML.
    render(text) {

        text = text.replace('KUCOSMULTILINECODEID', 'KUCOSMULTILINECODE');

        var regex = /```(.*)([^]+?.*?[^]+?[^]+?)\n```/g;
        var arr = [];
        const matches = text.matchAll(regex);

        // Match all multiline codes, push into array and replace codes with temporary string
        for (const match of matches) {
            var code = this.highlight(match[1].trim(), match[2].trim() )
            arr.push(code);
            text = text.replace(match[0], 'KUCOSMULTILINECODEID');
        }

        // Match remaining text and replace with rules
        for (let i = 0; i < this.rules.length; i++) {
            const rule = this.rules[i];
            text = text.replace(rule.regex, rule.replacement);
        }
        
        // Match temporary string and replace with multiline codes from array
        for (let i = 0; i < arr.length; i++) {
            text = text.replace('KUCOSMULTILINECODEID', arr[i]);
        }

        return text.trim();
    }
}

////////////

module.exports = Slimdown;