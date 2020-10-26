const ytdl = require('ytdl-core');
const fs = require('fs');
const http = require('http');
const  { exec } = require('child_process');

const dltype = "mp4"; //download type

var server = http.createServer(handleRequest);

var index = http.createServer(hndreqindex);

async function hndreqindex(request, response){
    response.end('<!DOCTYPE html><html><head><title>YouTube Downloader</title><script>var download_list = []; var dl = []; var sw = 0; function add() {var input = document.getElementById("in").value; if (input === "") return; document.getElementById("in").value = ""; download_list[download_list.length] = input;} function download() {var url = ""; for (var i = 0; i < download_list.length; i++) {if (i > 0) url += ","; url += download_list[i];} url = `http://localhost:2000/${url}`; window.location.assign(url);} function del() {var leng = download_list.length - 1; var temp = []; for (var i = 0; i < leng; i++) {temp[i] = download_list[i];} download_list = temp;} setInterval(function () {var disp = "";if (sw == 0) {for (var i = 0; i < download_list.length; i++) {if (i == 0) {disp = `<p id="out">${download_list[i]}</p><br>`;} else {disp += `<p id="out">${download_list[i]}</p><br>`;}}}document.getElementById("outsec").innerHTML = disp;}, 10);</script><style>body {margin: 0px; padding: 0px; font-family: Arial;} #outsec {width: 50%; margin-top: 20px; margin-left: 20px; padding: 10px; border: 1px solid #000;} #out {margin-top: 5px; font-size: 20px;}</style></head><body><input id="in"><button id="add" onclick="add();">Add to list</button><button id="submit" onclick="download();">Start Download</button><button id="del" onclick="del();">delete last</button><section id="outsec"></section></body></html>');
}

async function handleRequest(request, response){
    var url = "undefined";
    url = request.url;
    url = url.split("/");
    url = url[1];
    if (url == "favicon.ico") return;
    var urllist = url.split(",");
    var linklist = urllist;
    for (var i = 0; i < urllist.length; i++) {
        var ll = urllist[i];
        linklist[i] = `https://www.youtube.com/watch?v=${ll}`;
    }
    var leng = linklist.length;
    var names = [];
    var namelist = [];
    for (var i = 0; i < urllist.length; i++) {
        var temppp = urllist[i].split("/");
        temppp = temppp[3];
        temppp = temppp.split("=");
        temppp = temppp[1];
        namelist[i] = temppp;
    }
    if (namelist == undefined) {
        namelist = [];
    }
    for (var i = 0; i < leng; i++) {
        var ytl = linklist[i];
        if (namelist[i] == undefined) {
            namelist[i] = i;
        }
        var filen = namelist[i];
        var suc = 0;
        try {
            if (fs.existsSync(`${filen}.${dltype}`)) {
                suc = 1;
            }
        } catch (err) {

        }
        if (suc == 0) dl(ytl, filen);
        names[names.length] = filen;
    }
    response.write(`<html><body>Surcess</body></html>`);
    response.end();
}

async function dl(link, file) {
    var fn = `${file}.${dltype}`;
    var vid = ytdl(link, {quality:"137"}); // 137 == 1080p 136 == 720p
    var aud = ytdl(link, {quality:"140"});
    aud.pipe(fs.createWriteStream(`aud_${fn}`));
    vid.pipe(fs.createWriteStream(`vid_${fn}`));
    var idle = 0;
    setTimeout(function () {
        var int = setInterval(function () {
                var state = vid._transformState;
                state = state.writechunk;
                if (state == null) {
                    idle++;
                } else {
                    idle = 0;
                }
                if (idle > 1000) {
                    exec(`ffmpeg -i vid_${fn} -i aud_${fn} -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 ${fn}`);
                    clearInterval(int);
                }
            }, 10);
    }, 120);
}

server.listen(2000);
index.listen(82);

console.log("ready");