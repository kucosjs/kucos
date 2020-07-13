<p align="center">
    <a href="https://github.com/kucosjs/kucos">
        <img src="https://kucos.js.org/assets/img/kucos.gif" alt="Kucos Logo" height="60"/>
    </a>
</p>
<h1 align="center">Kucos.js</h1>
<p align="center">Simple and privacy focused serverless comments with kudos.</p>

<p align="center">
    <a href="https://github.com/kucosjs/kucos">
        <img src="https://img.shields.io/badge/total%20size-17%20kb-brightgreen" />
        <img src="https://img.shields.io/badge/license-MIT-brightgreen" />
        <img src="https://img.shields.io/badge/version-v0.10.5-blue" />
    </a>
</p>

<br />

<p align="center">
    <a href="https://github.com/kucosjs/kucos">
        <img src="https://i.imgur.com/oxUGn7M.gif" style="width: 600px;display: block; margin: 0 auto;" />
        <img src="https://i.imgur.com/cOmvr3S.png" style="width: 600px;display: block; margin: 0 auto;" />
    </a>
</p>
<br />

Simple and privacy focused comments with kudos.

You don't need a server to host your comment system, you can easily host Kucos on <s>ZEIT NOW</s> (now [Vercel](https://vercel.com/)) and database on Mongo Atlas where 500mb is for free (for comments it is a lot space :)).

Kucos is focused on complete user privacy and data security, that' s why commenting is completely anonymous, no account is needed.

Kucos is written entirely in JavaScript, backend in _NodeJS_ with _MongoDB (Mongoose)_ and frontend in pure JS. Source of Kucos can be found on GitHub, I invite you to test the demo on [this page](https://kucos.js.org), also I'm happy to see pull requests with your fixes or new features :)

A simple _Markdown_ is also available, [here](https://kucos.js.org/markdown.html) you can check out the available Markdown.

## Available functions:

- Writing new comments
- Reply to comments
- Fast quote comments (select text and click _Reply_)
- Hidding/showing children comments
- Voting on comments
- Markdown text formatting
- Adding Kudos under post

## Todo
- [x] Edit own comments within an hour -(v0.10.2)
- [x] Simple moderation of comments by the website owner [Screenshot](https://i.imgur.com/Zyt0Jxu.gif) -(v0.10.4)
- [x] Checking whether a comment is spam. (Akismet) -(v0.10.4)
- [x] Fast and lightweight code highlighting in comments -(v0.10.5)
- [ ] Antiflood function
- [ ] Internationalization (i18n)

## Add Kucos to your website

To add Kucos to your website you only need to add two additional lines.

- `<div id="comments"></div>`
- `<script src="http://localhost:3000/min/kucos.min.js"></script>`

## Installation

Installation of Kucos is very simple, you need to download the source code then rename the _config.example.js_ file to _config.js_ and fill it in correctly.

- `$ git clone https://github.com/kucosjs/kucos`
- `$ mv config.example.js config.js`
- `$ vim config.js`

Now all you have to do is _npm install_, run the command _gulp_ and _node index.js_ to start the server.

- `$ npm install`
- `$ gulp`
- `$ node index.js`

## Credits

- [Sebastian Korotkiewicz](https://github.com/skorotkiewicz)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
