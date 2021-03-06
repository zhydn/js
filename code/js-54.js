(function () {
  if(!/member\.bilibili\.com/.test(window.location.href)) {
    alert('需要在 member.bilibili.com 域名下使用，点击确认后自动打开，如果未能打开请手动打开');
    window.open('https://member.bilibili.com');
    return;
  }
  var view_list = document.querySelector('#viewBox .list');
  if (view_list === null) {
    // 显示
    var view_box = document.createElement('div');
    view_box.setAttribute('id', 'viewBox');
    view_box.setAttribute(
      'style',
      'position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow-y: auto; z-index: 100000'
    );
    view_list = document.createElement('ul');
    view_list.setAttribute('class', 'list');
    var otherInfo = document.createElement('div');
    otherInfo.setAttribute('class', 'otherInfo');
    var view_background = document.createElement('div');
    view_background.setAttribute('id', 'viewBackground');
    view_background.setAttribute(
      'style',
      'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; opacity: 0.75; z-index: 10000'
    );
    view_box.appendChild(view_list);
    document.body.appendChild(view_box);
    document.body.appendChild(otherInfo);
    document.body.appendChild(view_background);

    var style = document.createElement('style');
    style.innerText =
      '.list { position: absolute; top: 20px; left: 0; } .list li { height: 40px; list-style: none; color: #FFF; font-size: 30px; font-weight: 700; } .otherInfo { position: fixed; top: 0; right: 0; width: 300px; font-size: 26px; color: #FFF; z-index: 100000; display: none; } .otherInfo img { width: 30px; height: 30px; border-radius: 100%; } .otherInfo a { text-decoration: none; color: #999 }';
    document.head.appendChild(style);
  } else {
    var view_box = document.querySelector('#viewBox');
    var view_background = document.querySelector('#viewBackground');

    if (view_box.style.display !== 'none') {
      view_box.style.display = 'none';
      view_background.style.display = 'none';
      return;
    } else {
      view_list.innerHTML = '';
      view_box.style.display = 'block';
      view_background.style.display = 'block';
    }
  }

  var page = 1;
  var noface = 0;
  var noname = 0;
  var last = '';
  var showText = [];

  setInterval(function () {
    if (showText.length > 0) {
      addListItem(showText[0]);
      showText.shift();
      if (showText.length === 0) {
        otherInfo.style.display = 'block';
      }
      view_box.scrollTop = view_list.clientHeight;
    }
  }, 100);

  addListItem('运行开始，每页为 20 人');

  function addListItem(text) {
    var li = document.createElement('li');
    li.innerText = text;
    view_list.appendChild(li);
  }

  function request(last_id) {
    last = last_id;
    var xhr = new XMLHttpRequest();
    xhr.open(
      'GET',
      'https://member.bilibili.com/x/h5/data/fan/list?ps=500&last_id=' +
        (last_id !== undefined ? last_id : ''),
      true
    );
    xhr.withCredentials = true;
    xhr.send();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(json);

        if (json.code !== 0) {
          request(last);
          return;
        }

        var isEnd = false;

        if (json.data.result.length === 500) {
          setTimeout(function () {
            request(json.data.result[json.data.result.length - 1].mtime_id);
          }, 1000);
        } else {
          isEnd = true;
        }

        var curNoface = 0;
        var curNoname = 0;
        json.data.result.forEach(function (item, index) {
          if (/noface\.jpg$/.test(item.card.face)) {
            ++noface;
            ++curNoface;
          }
          if (/^(bili_(\d+)|(\d+)_bili)$/.test(item.card.name)) {
            ++noname;
            ++curNoname;
          }

          if (
            (index + 1) % (20) === 0 ||
            (index + 1 === json.data.result.length && (index + 1) % (20) >= 0)
          ) {
            showText.push(
              '第' +
                page +
                '页：未设置头像 ' +
                curNoface +
                ' 人；未设置昵称 ' +
                curNoname +
                ' 人'
            );
            curNoface = 0;
            curNoname = 0;
            ++page;
          }

          if (isEnd) {
            otherInfo.innerHTML =
              '你的第一位粉丝：<br> <a href="https://space.bilibili.com/' +
              item.card.mid +
              '" target="_blank"><img src="' +
              item.card.face +
              '">' +
              item.card.name +
              '</a><br> 于 ' +
              item.mtime +
              ' 关注了你';
          }
        });

        // request(++page)
      } else {
        if (xhr.readyState !== 4) return;
        request(last);
      }
    };
  }

  request();
})();
