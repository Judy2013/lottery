"use strict"

function Lottery(options){
  var settings = $.extend(true, {}, {
    "parts":[],
    "cData":["一等奖","二等奖","三等奖","四等奖"],
    "colorList":['', 'text-purple', 'text-blueD'],
    "elmts":"lotteryWrapper",
  }, options);
  var that = this;
  this.storage = window.sessionStorage;
  this.lottery = $("#"+settings.elmts);
  this.list = this.lottery.find('.lottery-list').children('ul');
  this.userImg = this.lottery.find('.usersImg');
  this.playBtn = this.lottery.find('.playBtn');
  this.category = this.lottery.find('.lottery-category');
  this.prevBtn = this.category.children('.btn-l');
  this.nextBtn = this.category.children('.btn-r');
  this.total = this.lottery.find('.total_numb').find('span');
  this.winnerNumb = this.lottery.find('.winner_numb').find('span');
  this.winner = (JSON.parse(this.storage.getItem("winner")))?JSON.parse(this.storage.getItem("winner")):[];
  this.url = '../images';
  this.idx = settings.cData.length-1;
  this.runImg = null;
  this.parts = (JSON.parse(this.storage.getItem("parts")))?JSON.parse(this.storage.getItem("parts")):settings.parts;
  this.colorList = settings.colorList;
  this.cData = settings.cData;
  this.playing = that.storage.getItem("lotteryStatus");
  
  this.render = function(){
    if (this.parts.length == 0) {
      that.userImg.find('img').attr('src', that.url+'/userDefault.png');
    };
    that.updateNumb(this.parts.length,that.winner.length);
    that.category.find('.text').html(that.cData[that.cData.length-1]);
    var img = (that.parts.length > 0)? that.parts[Math.floor(Math.random()*that.parts.length)].img:that.url+'/userDefault.png';
    that.userImg.find('img').attr('src', img);
    btnStatus();
    this.renderList(that.winner);
    if (that.playing === "1") {that.playBtn.css("background-image","url("+that.url+"/btn_stop.png)");};
  }
  this.bindEvent = function(){
    that.playBtn.click(this.play.bind(this));
    that.prevBtn.on('click', function(){
      if (that.idx > 0) {
        that.idx--;
      }else{
        that.idx=0;
      };
      btnStatus();
      that.category.find('.text').html(settings.cData[that.idx]);
      return that.idx;
    });
    that.nextBtn.on('click', function(){
      if (that.idx < settings.cData.length-1) {
        that.idx++;
      }else{
        that.idx=settings.cData.length-1;
      };
      btnStatus();
      that.category.find('.text').html(settings.cData[that.idx]);
      return that.idx;
    });
  }
  function btnStatus(){
    if (that.idx == 0) {
      that.prevBtn.css({"cursor":"not-allowed","opacity":0.5});
      that.nextBtn.css({"cursor":"pointer","opacity":1});
    } else if (that.idx >= settings.cData.length-1){
      that.nextBtn.css({"cursor":"not-allowed","opacity":0.5});
      that.prevBtn.css({"cursor":"pointer","opacity":1});
    } else {
      that.prevBtn.css({"cursor":"pointer","opacity":1});
      that.nextBtn.css({"cursor":"pointer","opacity":1});
    };
  }

  this.getRandomImg = function(fn){
    var imgIdx = Math.floor(Math.random()*that.parts.length);
    if (that.parts.length > 0) {
      that.userImg.find('img').attr('src', that.parts[imgIdx].img)
    }else{
      that.userImg.find('img').attr('src', that.url+'/userDefault.png');
    };
    if (!!fn) {fn(imgIdx)};
  }
}
Lottery.prototype.init = function(){
  this.render();
  this.bindEvent();
}

Lottery.prototype.play = function(){
  var p = this.userImg.parent();
  var that = this;
  if (this.playing === "0" || this.playing == null) {
    p.addClass('spin');
    that.playBtn.css("background-image","url("+that.url+"/btn_stop.png)");
    that.playImg();
    that.playing = "1"; //1 = 筛选中，0 = 停止筛选
  }else{
    clearInterval(that.runImg);
    this.getRandomImg(function(index){
      that.addWinner(index);
    });
    p.removeClass('spin');
    this.playBtn.css("background-image","url("+that.url+"/btn_start.png)");
    this.playing = "0";
  };
  this.storage.setItem("lotteryStatus",that.playing);
}

Lottery.prototype.playImg = function(){
  var that = this;
  this.runImg = setInterval(that.getRandomImg, 100);
}
Lottery.prototype.deleteWinner = function(i){
  var that = this;
  if (this.winner.length>0) {
    this.parts.push({
      "uid":that.winner[i].uid,
      "img":that.winner[i].img,
      "name":that.winner[i].name
    });
    if (this.parts.length > 0) {
      this.userImg.find('img').attr('src', that.winner[i].img);
    }
    this.winner.splice(i,1);
    this.storage.setItem("winner", JSON.stringify(that.winner));
    this.storage.setItem("parts",JSON.stringify(that.parts));
  } else{
    this.storage.setItem("winner", "[]");
  };
  this.updateNumb(that.parts.length,that.winner.length);
}

Lottery.prototype.addWinner = function (i){
  var that = this;
  if (this.parts.length>0) {
    this.winner.unshift({
      "uid":that.parts[i].uid,
      "rank":that.idx+1,
      "name":that.parts[i].name,
      "img":that.parts[i].img
    });
    this.parts.splice(i, 1);
    this.winner.sort(function (a,b){
      return (a.rank == b.rank) ? b.t - a.t : a.rank - b.rank;
    });
    this.renderList(that.winner);
    this.storage.setItem("winner", JSON.stringify(that.winner));
    this.storage.setItem("parts",JSON.stringify(that.parts));
  }else{
    this.storage.setItem("parts","[]");
  };
  this.updateNumb(that.parts.length,that.winner.length);
}
Lottery.prototype.delectList = function(){
  var that = this;
  this.list.find('li').delegate('.icon-closebtn', 'click', function(){
    var i = $(this).parent().parent().index();
    $(this).parentsUntil('ul').remove();
    that.deleteWinner(i);
  });
}
Lottery.prototype.renderList = function(){
  var cls, that = this;
  this.list.empty();
  for (var i = 0; i < this.winner.length; i++) {
    cls = (this.winner[i].rank <= this.colorList.length)?this.colorList[this.winner[i].rank-1]:''
    var html = '<li>'
            +'  <div class="item">'
            +'    <a class="iconfont icon-closebtn"></a>'
            +'    <span class="numb cup '+cls+'"><span>'+this.winner[i].rank+'</span></span>'
            +'    <div class="userCon"><img src="'+this.winner[i].img+'" alt=""></div>'
            +'    <div class="text">'
            +'      <span class="font18">'+this.winner[i].name+'</span>'
            +'    </div>'
            +'  </div>'
            +'</li>';

    this.list.append(html);
  };
  if (this.parts.length == 0) {
    this.userImg.find('img').attr('src', that.url+'/userDefault.png');
  };
  this.delectList();
}
Lottery.prototype.updateNumb = function(tNumb,wNumb){
  if (tNumb >= 0) {
    this.total.html(tNumb);
    this.winnerNumb.html(wNumb);
  }else{
    this.total.html(0);
    this.winnerNumb.html(wNumb);
  };
}

$(function(){
  var parts = [
      {
        "name":"小河",
        "img":"../images/user01.png",
        "uid":23
      },
      {
        "name":"周云蓬",
        "img":"../images/user02.png",
        "uid":24
      },
      {
        "name":"万晓利",
        "img":"../images/user03.png",
        "uid":25
      },
      {
        "name":"张玮玮",
        "img":"../images/user01.png",
        "uid":26
      }
    ];
  var l = new Lottery({"parts": parts});
  l.init();
})


