// ==UserScript==
// @author          Marco Munizaga
// @name            GSS
// @version         1.0
// @description     Accept RSS feeds in grooveshark
// @namespace       GSS
// @include         http://grooveshark.com/*
// ==/UserScript==

var SERVER = 'http://localhost';

console.log('hello');

function injectScript(scriptUrl) {
	var script = document.createElement('script');
	script.src = scriptUrl;
	document.body.appendChild(script);
}

setTimeout(function (){injectScript(SERVER + '/GSS.js')}, 2000);


