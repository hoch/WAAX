(function (WX) {

	var domClientVersion = document.querySelector('#client-ver'),
	  	domWAAXVersion = document.querySelector('#waax-ver');

	domClientVersion.textContent = 'CLIENT VERSION: ' +
		navigator.userAgent.toLowerCase();
	domWAAXVersion.textContent = 'WAAX VERSION: ' + WX.getVersion();

})(WX);