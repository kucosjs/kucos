<h1 style="text-align:center;">Introducing Kucos <a href="https://kucos.js.org"><img style="vertical-align:middle;" src="https://kucos.js.org/assets/img/kucos.gif" /></a></h1>
<img src="https://i.imgur.com/oxUGn7M.gif" style="width: 600px;display: block; margin: 0 auto;" alt="Screenshot of Kucos">

### Please notice, this is a version that is being heavily developed, so I do not recommend using it in production yet. But to try it out locally is highly recommended! 

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
- [x] Fast and lightweight code highlighting in comments
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
