/** 
MIT License

Copyright (c) 2020 Felix Vogel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/ 
var Utility;(function(t){var r=function(){function t(t,r,e,n){if(n===void 0){n=255}this.r=t;this.g=r;this.b=e;this.a=n}t.prototype.fromRGBA=function(t,r,e,n){this.r=Math.max(0,Math.min(255,t));this.g=Math.max(0,Math.min(255,r));this.b=Math.max(0,Math.min(255,e));this.a=Math.max(0,Math.min(255,n));return this};t.prototype.toRGBA=function(t){if(t===void 0){t=this.a}return"rgba("+this.r+", "+this.g+", "+this.b+", "+t+")"};t.prototype.fromRGB=function(t,r,e){return this.fromRGBA(t,r,e,255)};t.prototype.toRGB=function(){return"rgb("+this.r+", "+this.g+", "+this.b+")"};t.prototype.fromHex=function(t){if(!t.match(/^#(:?[0-9a-fA-F]{2}){1,3}$/g))return this;t=t.substr(1);for(var r=0;r<t.length;r+=2){var e=parseInt(t.substr(r,2),16);switch(r){case 0:{this.r=e;break}case 2:{this.g=e;break}case 4:{this.b=e;break}default:break}}return this};t.prototype.toHex=function(){return"#"+((this.r<16?"0":"")+this.r.toString(16))+((this.g<16?"0":"")+this.g.toString(16))+((this.b<16?"0":"")+this.b.toString(16))};return t}();t.Color=r;function e(t,r){for(var e=0,n=t.length;e<n;e++){r(t[e],e)}}t.forEach=e})(Utility||(Utility={}));var Color=Utility.Color;var forEach=Utility.forEach;var options={textColor:new Color(68,255,0),gradientType:0,lineLength:6};var columns=[];window.wallpaperPropertyListener={applyUserProperties:function(t){if(t.schemecolor){var r=t.schemecolor.value.split(" ").map(function(t){return Math.min(255,Math.ceil(parseFloat(t)*255))});options.textColor.fromRGB(r[0],r[1],r[2])}if(t.gradienttype){options.gradientType=t.gradienttype.value;setGradient()}if(t.linelength){options.lineLength=t.linelength.value}}};window.onload=function(){window.wallpaperRegisterAudioListener(function(t){if(options.gradientType!==3)return;var r=Math.floor(columns.length/2);var e=Math.floor(columns.length/128);var n=0;var i=63;for(var o=r;o>-1;o--){columns[o].hsv=240*t[i]+120;n+=1;if(n>=e){n=0;i-=1}}i=64;for(var a=r+1;a<columns.length;a++){columns[a].hsv=240*t[i]+120;n+=1;if(n>=e){n=0;i+=1}}})};var setGradient=function(){switch(options.gradientType){case 0:{forEach(columns,function(t){return t.hsv=0});break}case 1:{forEach(columns,function(t){return t.hsv=0});break}case 2:{forEach(columns,function(t){return t.hsv=360*(t.x/window.innerWidth)});break}case 3:{forEach(columns,function(t){return t.hsv=60});break}}};var graphics=function(){var i=250;var r=document.getElementById("matrix-canvas");var o=r.getContext("2d");var t=function(t){r.width=window.innerWidth;r.height=window.innerHeight};t(null);window.addEventListener("resize",t);o.scale(1.2,1.2);var a=function(t,r,e,n,i){if(i===void 0){i="#000000"}o.fillStyle=i;o.fillRect(t,r,e,n)};var s=function(t,r,e){var n=Math.max(.05,Math.min(.5,Math.random()));if(options.gradientType!==0&&e)o.fillStyle="hsla("+e.hsv+", 100%, 50%, "+n+")";else o.fillStyle=options.textColor.toRGBA(n);o.fillRect(t+5,r+4,2,2)};var h=[];var e=function(t){for(var r=0,e=t.length;r<e;r++){h.push({offsetX:Math.floor(6-o.measureText(t[r]).width/2),char:t[r]})}};e("ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ日(+*;)-|2589Z");var l=function(){return{letters:0,max:Math.floor(Math.random()*(options.lineLength/2))+options.lineLength/2,letterY:10,erasing:false,eraseY:0,delay:Math.floor(Math.random()*8e3)+2e3}};var n=function(t){var r={x:t,interval:Math.floor(250*Math.random())+150,hsv:0,items:[l()]};columns.push(r)};for(var f=1;f<window.innerWidth;f+=12){if(f+12>window.innerWidth)break;for(var c=0;c<window.innerHeight;c+=12)s(f,c);n(f)}var u=function(e,t){var n=false;if(options.gradientType!==0&&options.gradientType!==3){e.hsv+=1;if(e.hsv>=360)e.hsv=0}forEach(e.items,function(t){if(t.delay<=0){a(e.x,t.letterY,12,12);if(options.gradientType!==0)o.strokeStyle="hsl("+e.hsv+", 100%, 50%)";else o.strokeStyle=options.textColor.toRGB();var r=h[Math.floor(Math.random()*h.length)];o.strokeText(r.char,e.x+r.offsetX,t.letterY);t.letterY+=12;if(t.letters>=t.max&&!t.erasing){t.erasing=true;n=true}else{t.letters+=1}if(t.erasing){a(e.x,t.eraseY,12,12);s(e.x,t.eraseY,e);t.eraseY+=12}}else{t.delay-=i}});if(n)e.items.push(l());e.items=e.items.filter(function(t){return t.eraseY<window.innerHeight});a(e.x,0,12,window.innerHeight,"rgba(0, 0, 0, 0.1)")};var v=0;var m=function(t){var r=t-v;forEach(columns,function(t){t.interval-=r;if(t.interval<=0){u(t,r);t.interval=Math.floor(250*Math.random())+150}});v=t;window.requestAnimationFrame(m)};v=performance.now();window.requestAnimationFrame(m);setGradient()};graphics();