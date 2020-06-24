class Kudoable {
  constructor() {
      this.kudosForm();
      this.counter = document.getElementById('num');
      this.element = document.getElementById('kudoable');
      this.bindEvents();
      this.getKudos();
  };

  bindEvents = () => {
    this.on(this.element, 'touchstart', this.start);
    this.on(this.element, 'touchend', this.end);
    this.on(this.element, 'mouseover', this.start);
    this.on(this.element, 'mouseout', this.end);
    this.on(this.element, 'click', this.unkudo);
  };

  on = (element, event, func) => {
    try {
      element.addEventListener(event, function(e) { e.preventDefault(); func(e, element); }, false);
    } catch(e) {
      element.attachEvent('on' + event, function(e) { e.preventDefault(); func(e, element); });
    }
  };

  isKudoable = () => {
      return this.hasClass(this.element, 'kudoable')
  };
  isKudod = () => {
      return this.hasClass(this.element, 'complete')
  };
  start = () => {
      if (this.isKudoable() && !this.isKudod()) {
          this.addClass('active');
          return (this.timer = setTimeout(this.complete, 700));
      }
  };
  end = () => {
      if (this.isKudoable() && !this.isKudod()) {
          this.removeClass('active');
          if (this.timer != null) {
              return clearTimeout(this.timer);
          }
      }
  };

  complete = () => {
      this.end();
      this.incrementCount();
      this.addClass('complete');
      this.request('add');
  };
  unkudo = () => {
      if (this.isKudod()) {
        this.decrementCount();
        this.removeClass('complete');
        this.request('remove');
      }
  };

  setCount = (count) => {
      return this.counter.innerText = count;
  };
  currentCount = () => {
      return parseInt(this.counter.innerText);
  };
  incrementCount = () => {
      return this.setCount(this.currentCount() + 1);
  };
  decrementCount = () => {
      return this.setCount(this.currentCount() - 1);
  };

  getKudos = async () => {
    let url = window.location.href;

    var kudoStorage = localStorage.getItem('kudo:' + url);
    if (kudoStorage == 'saved') {
        this.addClass('complete');
    }

    let article_url = encodeURIComponent(url);
    let kucosServerUrl = "http://localhost:3000";

    let res = await fetch(kucosServerUrl + '/api/kudos/' + article_url, { 
        credentials: "include"
    });

    let data = await res.json();
    return this.setCount(data.message.kudos);

  };

  request = async (action) => {
    let url = window.location.href;
    if (action == "add") localStorage.setItem('kudo:' + url, 'saved');
    if (action == "remove" ) localStorage.removeItem('kudo:' + url);
    
    let kucosServerUrl = "http://localhost:3000";
    let req = await fetch(kucosServerUrl + '/api/kudos', {
        // FIX: changed application/json to application/x-www-form-urlencoded for sending cookies to the server
        // I have no idea why, but application/json doesn't send cookies with POST.
        headers: { 
            'Accept': 'application/x-www-form-urlencoded', 
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        credentials: 'include',
        method: 'POST',
        body: 'id=' + encodeURIComponent(url) + '&kudo=' + encodeURIComponent(action)
    });

    var data = await req.json();
    return this.setCount(data.message.kudos);

  };

  kudosForm = () => {
    let kudosForm = `
    <figure id="kudoable" class="kudo kudoable">
        <a class="kudobject">
            <div class="opening"><div class="circle">&nbsp;</div></div>
        </a>
        <a href="#kudo" class="count">
            <span id="num" class="num">0</span>
            <span class="txt">Kudos</span>
            <span class="dontmove">Don't move!</span>
        </a>
    </figure>`;
    return document.getElementById('comments').insertAdjacentHTML('beforebegin', kudosForm)
  };



  // helpers
  hasClass = (element, className) => {
      return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
  };
  addClass = (className) => {
      return this.element.classList.add(className);
  };
  removeClass = (className) => {
      return this.element.classList.remove(className);
  };


}