class Comments {
    constructor() {
        this.cookies();
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

    cookies = async () => {
        document.write('<link rel="stylesheet" type="text/css" href="/min/kucos.min.css">');
        if ( this.getCookie('spartan') == null ) {
            await this.setCookie();
        } 
    };

    renderComments = async () => {

        document.getElementById("comments").innerHTML = `<div id="kucos-root"><div class="loader"><h3>Loading...</h3></div></div>`;

        await this.getComments().then((data) => {
            var count = data.count;
            var thtml = '';
            var thtml = this.displayComments(data.comments);
            if (count == undefined) var count = 0;
        
            document.getElementById("comments").innerHTML = "<div id=\"kucos-root\"><span class=\"_comments_count\">Comments: " + count + "</span>" + this.formArea() + "<br><div id=\"commentsArea\">" + thtml  + "</div></div>";
        }).then(() => {
            new Kudoable();
            this.bindEvents();
        }) 
    };

    postComment = async (e, element, parent_id=null) => {
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
    
        let kucosServerUrl = "http://localhost:3000";
        const data = await fetch(kucosServerUrl + '/api/comments', { 
            credentials: "include",
            //mode: 'cors',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {article_url: article_url, comment: comment, author: author, email: email, website: website, parent_id: parent_id} )
        })
    
        var infos = await data.json();
    
        if (infos.status == 'success') {
            infoBox.innerHTML = 'Comment added';
            infoBox.setAttribute("style", "color: green;"); 
            document.getElementById(`comment-area${parent}`).value = "";
        } else {
            infoBox.innerHTML = infos.message;
            infoBox.setAttribute("style", "color: red;"); 
        }
    
        return;
    };

    vote = async (msgid, action) => {
        let userid = this.getCookie('spartan');
    
        let kucosServerUrl = "http://localhost:3000";
        const data = await fetch(kucosServerUrl + '/api/comments/vote', { 
            credentials: "include",
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ msgid: msgid, userid: userid, action: action })
        })
    
        let infos = await data.json();
    
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
        let kucosServerUrl = "http://localhost:3000";
        //let response = await fetch(kucosServerUrl + '/api/comments/' + article_url);

        let response = await fetch(kucosServerUrl + '/api/comments/' + article_url, { 
            credentials: "include",
        })
        
        var data = await response.json();

        return data;
    };

    displayComments = (allComments) => {
    
        if (allComments.length == 0) return 'No comments, yet!'
        // else 

        let comments = []
        for (let comment of Object.values(allComments)) {
    
            if (comment.score == null) var score = 0; else var score = comment.score;
            if (comment.likes == null) var likes = 0; else var likes = comment.likes;
            if (comment.dislikes == null) var dislikes = 0; else var dislikes = comment.dislikes;
    
            if (comment.website) {
                var web = `<a href="` + comment.website + `" rel="nofollow" class="author">` + comment.author + `</a>`;
            } else {
                var web = `<span class="author">` + comment.author + `</span>`;
            }
    
            let html = `
            <div class="comment">
                
                <div class="votes">
                    <button class="voteButton upvote" id="upvote-${comment.id}"></button>
                    <span id="votesCount-${comment.id}" title="Upvotes: ${likes}, Downvotes: ${dislikes}">${score}</span>
                    <button class="voteButton downvote" id="downvote-${comment.id}"></button>
                </div>
                    
                <div class="commentText">
    
                    <div id="comment-` + comment.id + `" class="_comment">
                        <div class="_header">
                            ` + web + ` 
                            <span class="spacer">•</span>
                            <a href="#comment-` + comment.id + `">
                                <time title="` + comment.createdOnTime + `" datetime="` + comment.createdOn + `">` + comment.created + `</time>
                            </a>
                            <a class="pointer" id="colaps-${comment.id}">[–]</a>
                        </div>
                        <div class="_textComment" id="textComment-` + comment.id + `">` + comment.comment + `</div>
                        <div class="_footer" id="` + comment.id + `"><a href="#comment-` + comment.id + `" class="pointer _areply" id="reply-${comment.id}">Reply</a></div>
                        <div class="_follow_up"></div>
                        <div id="_infos${comment.id}"></div>
                    </div>
    
                </div>
        
             </div> `;
            comments.push("<li>" + html.toString() + "</li>")
    
            if (comment.children && Object.keys(comment.children).length > 0) {
                let replies = "<ul class=\"neqcc\" id=\"neqcc-" + comment.id + "\">" + this.displayComments(comment.children) + "</ul>"
                comments = comments.concat(replies)
            }
        }
        return comments.join("");
    };
    
    formArea = (type, id) => {
    
        if (type == 'reply') {
            var input = '<button class="btn_addreply" id="addreply-' + id + '">Submit</button>';
            var text = 'Your reply...';
            var idinput = "-"+id;
        } else {
            var input = '<input id="submitComment" type="submit" value="Submit">';
            var text = 'Your comment*';
            var idinput = "";
        }
    
        let formArea = `
        <form id="_comment_form">
            <textarea id="comment-area${idinput}" placeholder="${text}"></textarea>
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

    commentsArea = (event) => {

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
            
			if (type == 'reply') {

                let inputElem = this.formArea('reply', id);
				let childListElemId = `childlist-${event.target.id.split("reply-")[1]}`;
				let childListElem = document.getElementById(childListElemId);
				
				if(childListElem == null) {
					childListElem = `<ul id="childlist-${event.target.id.split("reply-")[1]}"> ${inputElem} </ul>`;
					document.getElementById(`comment-${id}`).innerHTML += childListElem;								
				} else {
					childListElem.innerHTML = childListElem.innerHTML;
                }

                document.getElementById(`comment-area-${id}`).value = selectedText;
                //document.getElementById(`comment-area-${id}`).focus();

            } else if (type == 'colaps') {

                var neqcc = document.getElementById(`neqcc-${id}`);
                if (neqcc.getAttribute("style") == "display: none;") {
                    neqcc.setAttribute("style", "display: block;");
                    document.getElementById(`colaps-${id}`).innerHTML = "[–]"
                } else {
                    neqcc.setAttribute("style", "display: none;");
                    document.getElementById(`colaps-${id}`).innerHTML = "[+]";
                }

			} else if (type == 'addreply') {
                let e = null;
                let el = null; 
                this.postComment(e, el, id);
			} else if(type == 'upvote' || type == 'downvote') {
                this.vote(id, type);
			}
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
    
    setCookie = async () => {
        //10 * 365 * 24 * 60 * 60 * 1000 === 315360000000, or 10 years in milliseconds
        var expires = "";
        var date = new Date();
        date.setTime(date.getTime() + 315360000000);
        expires = "; expires=" + date.toUTCString();
        // SameSite=Strict
        document.cookie = "spartan=" + (this.uuidv4() || "") + ";SameSite=None"  + expires + "; path=/";
    };
    
    getCookie = (name) => {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    
}

new Comments();

