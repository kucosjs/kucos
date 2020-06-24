'use strict';

/**
 * Javascript version of https://gist.github.com/jbroadway/2836900
 *
 * Slimdown - A very basic regex-based Markdown parser. Supports the
 * following elements (and can be extended via Slimdown::add_rule()):
 *
 * - Headers
 * - Links
 * - Bold
 * - Emphasis
 * - Deletions
 * - Quotes
 * - Inline code
 * - Blockquotes
 * - Ordered/unordered lists
 * - Horizontal rules
 *
 * Author: Johnny Broadway <johnny@johnnybroadway.com>
 * Website: https://gist.github.com/jbroadway/2836900
 * License: MIT
 */
class Slimdown {

    constructor() {
        // Rules
        this.rules = [
            //{regex: /(#+)(.*)/g, replacement: header},                                          // headers
            //{regex: /!\[([^\[]+)\]\(([^\)]+)\)/g, replacement: '<img src=\'$2\' alt=\'$1\'>'},  // image
            {regex: /\[([^[]+)\]\(([^)]+)\)/g, replacement: '<a href=\'$2\'>$1</a>'},           // hyperlink
            {regex: /(\*\*|__)(.*?)\1/g, replacement: '<strong>$2</strong>'},                     // bold
            {regex: /(\*|_)(.*?)\1/g, replacement: '<em>$2</em>'},                                // emphasis
            {regex: /~~(.*?)~~/g, replacement: '<del>$1</del>'},                              // del
            {regex: /:"(.*?)":/g, replacement: '<q>$1</q>'},                                  // quote
            {regex: /```\s*([^]+?.*?[^]+?[^]+?)```/g, replacement: '<pre><code>$1</code></pre>'}, // multiline code
            {regex: /`(.*?)`/g, replacement: '<code>$1</code>'},                                  // inline code
            //{regex: /\n\*(.*)/g, replacement: ulList},                                          // ul lists
            //{regex: /\n[0-9]+\.(.*)/g, replacement: olList},                                    // ol lists
            
            //{regex: /((?:^> .*?$\n)+)/gm, replacement: blockquote},                             // single and multiline blockquotes
            {regex: /((?:^&gt; .*?$\n)+)/gm, replacement: blockquote},                            // single and multiline blockquotes
            
            //{regex: /(&gt;|\>)(.*)/g, replacement: blockquote},                              // blockquotes
            //{regex: /\n-{5,}/g, replacement: '\n<hr />'},                                      // horizontal rule
            //{regex: /\n([^\n]+)\n/g, replacement: para},                                       // add paragraphs
            {regex: /\n/g, replacement: '<br>'},
            //{regex: /<\/ul>\s?<ul>/g, replacement: ''},                                        // fix extra ul
            //{regex: /<\/ol>\s?<ol>/g, replacement: ''},                                        // fix extra ol
            {regex: /(<br\s*\/?>){3,}/g, replacement: '<br><br>'},
            {regex: /<\/blockquote><blockquote>/g, replacement: '\n'}                          // fix extra blockquote
        ];


        ////////////
        function blockquote(text) {
            text = text.replace(/(^&gt; )/gm, '');
            //text = text.replace(/(^> )/gm, '');
            return `<blockquote>${text.trim()}</blockquote>`;
        }

        /*
        function para(text, line) {
            const trimmed = line.trim();
            if (/^<\/?(ul|ol|li|h|p|bl)/i.test(trimmed)) {
                return `\n${line}\n`;
            }
            //return `\n<p>${trimmed}</p>\n`;
            return `\n<br>${trimmed}<br>\n`;
        }

        function ulList(text, item) {
            return `\n<ul>\n\t<li>${item.trim()}</li>\n</ul>`;
        }

        function olList(text, item) {
            return `\n<ol>\n\t<li>${item.trim()}</li>\n</ol>`;
        }

        function header(text, chars, content) {
            const level = chars.length;
            return `<h${level}>${content.trim()}</h${level}>`;
        }*/

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
        this.rules.forEach( (rule) => {
            text = text.replace(rule.regex, rule.replacement);
        });

        return text.trim();
    }
}


////////////

module.exports = Slimdown;