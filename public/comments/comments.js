class Comments {
    constructor() {
        this.styles();
        this.renderComments();
    }
  
    bindEvents = () => {
      this.on(document.getElementById("submitComment"), 'click', this.postComment);
      this.on(document.getElementById("commentsArea"), 'click', this.commentsArea);
    };

    on = (element, event, func) => {
      try {
        element.addEventListener(event, function(e) { e.preventDefault(); func(e, element); }, false);
      } catch(e) {
        element.attachEvent('on' + event, function(e) { e.preventDefault(); func(e, element); });
      }
    };

    styles = () => {
        document.write('<link rel="stylesheet" type="text/css" href="/min/kucos.min.css">');
    };

    renderComments = async () => {
        document.getElementById("comments").innerHTML = `<div id="kucos-root"><div class="loader"><h3>Loading...</h3></div></div>`;

        await this.getComments().then((data) => {
            var count = data.count;
            var thtml = '';
            var thtml = this.displayComments(data.comments, data.count);
            var comments = thtml[0] == null ? '' : thtml[0];
            var sticky = thtml[1] == null ? '' : thtml[1];
            if (count == undefined) var count = 0;
        
            document.getElementById("comments").innerHTML = 
                                            `<div id="kucos-root">
                                                <span class="_comments_count">
                                                    Comments: <span id="_amount">${count}</span>
                                                </span>
                                                ${this.formArea()}
                                                <div id="commentsArea">
                                                    <div id="sticky">${sticky}<div>
                                                    ${comments}
                                                </div>
                                            </div>`;
        }).then(() => {
            new Kudoable();
            this.bindEvents();
            this.editableGetMyComments();
        }).then(() => {
            this.addAutoResize();
        }) 
    };

    postComment = async (e, element, parent_id=null, type) => {
        let article_url = window.location.href;

        if (parent_id != null) {
            var parent = "-" + parent_id;
        } else {
            var parent_id = "";
            var parent = "";
        }

        var comment=document.getElementById(`comment-area${parent}`).value;
        var author=document.getElementById(`author${parent}`).value;
        var email=document.getElementById(`email${parent}`).value;
        var website=document.getElementById(`website${parent}`).value;

        let infoBox = document.getElementById(`_infos${parent}`);
    
        if (type == 'addedit')
            var method = 'PATCH';
        else
            var method = 'POST';

        const infos = await this.request('article_url=' + encodeURIComponent(article_url) + '&comment=' + encodeURIComponent(comment) + '&author=' + encodeURIComponent(author)
        + '&email=' + encodeURIComponent(email) + '&website=' + encodeURIComponent(website) + '&parent_id=' + encodeURIComponent(parent_id), method, '/api/comments');

        if (infos.status == 'success') {
            //infoBox.innerHTML = 'Comment added';
            //infoBox.setAttribute("style", "color: green;"); 
            
            if (type == 'addedit')
                document.getElementById(`textComment${parent}`).innerHTML = infos.message.comment;
            else
                this.appendNewComment(infos, parent);
                this.editableSaveMyComments(infos.message.id);

            document.getElementById(`comment-area${parent}`).value = "";
        } else {
            infoBox.innerHTML = infos.message;
            infoBox.setAttribute("style", "color: red;"); 
        }
    
        return;
    };

    appendNewComment = (data, id) => {
        let html = this.commentHtml(data.message);
        let nid = data.message.id;
        let pid = data.message.parent_id;
        let _a = document.getElementById('_amount');
        _a.innerText = parseInt(_a.innerText)+1;
        if (id) {
            document.getElementsByClassName('neqcc' + id)[0].insertAdjacentHTML('afterend', `<ul class="neqcc-${nid} neqcc" id="neqcc-${id}">${html.toString()}</ul>`);
            document.getElementById('comment-' + nid).classList.add('highlight');
            document.getElementById('comment-' + pid).scrollIntoView({behavior: 'smooth'});
            this.appendEditBtn(nid);
        }
        else {
            document.getElementById('commentsArea').insertAdjacentHTML('beforeend', `<li class="neqcc-${nid}">${html.toString()}</li>`);
            let nc = document.getElementById('comment-' + nid);
            nc.classList.add('highlight');
            nc.scrollIntoView({behavior: 'smooth'});
            this.appendEditBtn(nid);
        }
    }

    vote = async (msgid, action) => {
        let infos = await this.request('msgid=' + encodeURIComponent(msgid) + '&action=' + encodeURIComponent(action), 'POST', '/api/comments/vote');
    
        if (infos.status == 'success') {
            var vcel = document.getElementById(`votesCount-${msgid}`);
            vcel.innerHTML = infos.message.score;
            vcel.setAttribute("style", "color: green;");
        } else {
            var inel = document.getElementById(`_infos${msgid}`);
            inel.innerHTML = infos.message;
            inel.setAttribute("style", "color: red;"); 
        }
        return;
    };

    getComments = async () => {
        let article_url = encodeURIComponent(window.location.href);
        let data = this.request(null, 'GET', '/api/comments/' + article_url)
        return data;
    };

    getRowComment = async (id) => {
        let data = this.request(null, 'GET', '/api/comments/row/' + id)
        return data;
    };

    displayComments = (allComments, count) => {

        if (count == 0) return ['No comments, yet!', null]
        // else 

        let comments = [];
        let sticky = [];
        
        for (let comment of Object.values(allComments)) {
    
            if (comment.sticky == 1) {
                var stickyHtml = this.commentHtml(comment, 'sticky');

                sticky.push(`<li class="neqcc-${comment.id}">${stickyHtml.toString()}</li>`)
                if (comment.children && Object.keys(comment.children).length > 0) {
                    let replies = `<ul class="neqcc-${comment.id} neqcc" id="neqcc-${comment.id}">${this.displayComments(comment.children)}</ul>`
                    sticky = sticky.concat(replies)
                }
            } else {
                var html = this.commentHtml(comment);

                comments.push(`<li class="neqcc-${comment.id}">${html.toString()}</li>`)
                if (comment.children && Object.keys(comment.children).length > 0) {
                    let replies = `<ul class="neqcc-${comment.id} neqcc" id="neqcc-${comment.id}">${this.displayComments(comment.children)}</ul>`
                    comments = comments.concat(replies)
                }
            }

        }
        return [comments.join(""), sticky.join("")];
    };
    
    commentHtml = (comment, sticky=null) => {

        let score = comment.score ? comment.score : 0;
        let likes = comment.likes ? comment.likes : 0;
        let dislikes = comment.dislikes ? comment.dislikes : 0;
        let edited = comment.createdOnTime != comment.updatedOn ? `<span title="${comment.updatedOn}"><em>edited</em></span>` : ''
        var sticky = sticky != null ? ' sticky' : '';

        if (comment.spam == 1) {
            var spamInfo = `<span><em>This comment must be reviewed before publishing it.</em></span>`;
            var spam = ' spam';
            var dnone = ' dnone';
        } else {
            var spamInfo = '';
            var spam = ''; 
            var dnone = '';
        }

        if (comment.website) {
            var web = `<a href="` + comment.website + `" rel="nofollow" class="author">` + comment.author + `</a>`;
        } else {
            var web = `<span class="author">` + comment.author + `</span>`;
        }

        let html = `
        <div class="comment${spam}">
            
            <div class="votes${dnone}">
                <button class="voteButton upvote" id="upvote-${comment.id}"></button>
                <span id="votesCount-${comment.id}" title="Upvotes: ${likes}, Downvotes: ${dislikes}">${score}</span>
                <button class="voteButton downvote" id="downvote-${comment.id}"></button>
            </div>
                
            <div class="commentText">
        
                <div id="comment-${comment.id}" class="_comment${sticky}">
                    <div class="_header">
                        <span style="text-transform: capitalize;font-weight: bold;">${sticky}</span>
                        ` + web + ` 
                        <span class="spacer">•</span>
                        <a href="#comment-${comment.id}">
                            <time title="${comment.createdOnTime}" datetime="${comment.createdOn}">${comment.created}</time>
                        </a>
                        ${edited}
                        <a class="pointer" id="colaps-${comment.id}">[–]</a>
                        ${spamInfo}
                    </div>
                    <div class="_textComment" id="textComment-${comment.id}">${comment.comment}</div>
                    <div class="_footer${dnone}">
                        <a href="#comment-${comment.id}" class="pointer _areply" id="reply-${comment.id}">Reply</a> 
                    </div>
                    <div class="_follow_up"></div>
                    <div id="_infos${comment.id}"></div>
                </div>
        
            </div>
        
         </div>`;

         return html;
    }

    formArea = (type, id) => {
    
        if (type == 'reply') {
            var input = '<button class="btn_addreply" id="addreply-' + id + '">Submit</button>';
            var text = 'Your reply...';
            var idinput = "-"+id;
        } else if (type == 'edit') {
            var input = '<button class="btn_addreply" id="addedit-' + id + '">Edit</button>';
            var text = 'Your edit...';
            var idinput = "-"+id;
        } else {
            var input = '<input id="submitComment" type="submit" value="Submit">';
            var text = 'Your comment*';
            var idinput = "";
        }
    
        let formArea = `
        <form id="_comment_form">
            <textarea data-autoresize id="comment-area${idinput}" placeholder="${text}"></textarea>
            <br />
            <input type="hidden" id="username${idinput}" placeholder="Your username">
            <input type="text" id="author${idinput}" placeholder="Your name (optional)">
            <input type="email" id="email${idinput}" placeholder="Your email (optional)">
            <input type="website" id="website${idinput}" placeholder="Your website (optional)">
            ${input}
        </form>
        <div id="_infos${idinput}"></div>`;
    
        return formArea;
    };

    commentsArea = async (event) => {

        var getSelectedText = this.getSelectionText();
        var selectedText = "";

        if (getSelectedText) {
            var selectedText = getSelectedText.replace(/^/gm, '> ') + "\n";
        }

		if (event.target.nodeName === 'A' || event.target.nodeName === 'BUTTON') {
			let parts = event.target.id.split("-");
			let type = parts[0];
			let id = parts[parts.length-1];
            let eid = event.target.id.split("reply-")[1]; 
            let prevChild = document.getElementById(`childlist-${id}`);

			if (type == 'reply' || type == 'edit') {

                if (prevChild) document.getElementById(`childlist-${id}`).remove(); 

                let inputElem = this.formArea(type, id);
				let childListElemId = `childlist-${id}`;
				let childListElem = document.getElementById(childListElemId);
				
				if(childListElem == null) {
					childListElem = `<ul id="childlist-${id}"> ${inputElem} </ul>`;
                    document.getElementById(`comment-${id}`).innerHTML += childListElem;
				} else {
					childListElem.innerHTML = childListElem.innerHTML;
                }

                if (type == 'edit') {
                    var rowComment = await this.getRowComment(id);
                    document.getElementById(`comment-area-${id}`).value = rowComment.message;
                } else {
                    document.getElementById(`comment-area-${id}`).value = selectedText;
                }

            } else if (type == 'colaps') {

                var neqcc = document.getElementById(`neqcc-${id}`);
                if (neqcc.getAttribute("style") == "display: none;") {
                    neqcc.setAttribute("style", "display: block;");
                    document.getElementById(`colaps-${id}`).innerHTML = "[–]"
                } else {
                    neqcc.setAttribute("style", "display: none;");
                    document.getElementById(`colaps-${id}`).innerHTML = "[+]";
                }

			} else if (type == 'addreply' || type == 'addedit') {
                let e = null;
                let el = null; 
                this.postComment(e, el, id, type);
                //prevChild.remove();
			} else if(type == 'upvote' || type == 'downvote') {
                this.vote(id, type);
			}
		}

    };

    request = async (body=null, method, param) => {        
        let kucosServerUrl = "http://localhost:3000";

        if (method == 'POST' || method == 'PATCH') {

            const data = await fetch(kucosServerUrl + param, { 
                // FIX: changed application/json to application/x-www-form-urlencoded for sending cookies to the server
                // I have no idea why, but application/json doesn't send cookies with POST.
                headers: { 
                    'Accept': 'application/x-www-form-urlencoded', 
                    'Content-Type': 'application/x-www-form-urlencoded' 
                },
                credentials: 'include',
                method: method,
                body: body
            });
            return await data.json();

        } else if (method == 'GET') {
            let response = await fetch(kucosServerUrl + param, { 
                credentials: "include",
            })
            return await response.json();
        }
    };

    getSelectionText = () => {
        var text = "";    
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    };

    editableSaveMyComments = (id) => {
        var storage = localStorage.getItem('comments');
        var comments = JSON.parse(storage);
        if (storage) {
            // Check if id exist already in localstorage 
            if (comments.some(item => item.id === id)) {
                return
            }
        }

        var now = new Date();
        var item = {
            id: id,
            expiry: now.getTime() + 3600000
        };

        storage = storage ? comments : [];
        storage = [].concat(storage, item);
        localStorage.setItem('comments', JSON.stringify(storage));
    };

    editableGetMyComments = () => {
        var storage = localStorage.getItem('comments');
        var data = JSON.parse(storage);
        if (!storage) return null;
        var now = new Date();

        for (var i = 0; i < data.length; i++) {
            var id = data[i].id;
            var expiry = data[i].expiry;
            // remove edit button from expired comments
            // only 1 hour can by comment editable
            if (now.getTime() > expiry) {
                data.splice(i, 1);
                i--; 
            }
            this.appendEditBtn(id);
        }

        if (JSON.stringify(data) != storage) {
            localStorage.setItem('comments', JSON.stringify(data))
        }
    };

    appendEditBtn = (id) => {
        try {
            var editbtn = ` <a href="#comment-${id}" class="pointer _areply" id="edit-${id}">Edit</a>`;
            document.getElementById('reply-' + id).insertAdjacentHTML('afterend', editbtn); 
        } catch (e) {}

    };


    addAutoResize = () => {
        document.querySelectorAll('[data-autoresize]').forEach(function (element) {
            element.style.boxSizing = 'border-box';
            var offset = element.offsetHeight - element.clientHeight;
            element.addEventListener('input', function (event) {
                event.target.style.height = 'auto';
                event.target.style.height = event.target.scrollHeight + offset + 'px';
            });
            element.removeAttribute('data-autoresize');
        });
    }

}

new Comments();