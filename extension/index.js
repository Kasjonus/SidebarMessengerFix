document.addEventListener("readystatechange", () => {
	if (document.readyState === "interactive") {
		document.body.style.backgroundColor = "#242526";
		loadCSS("css/DefaultFix");

		chrome.runtime.sendMessage({ mode: "getTheme" }, (response) => {
			response.theme === "dark" && loadCSS("css/PayToWinSkin");
		});

		var checkExist = setInterval(function () {
			if (document.querySelectorAll(".hybvsw6c > .rj1gh0hx").length) {
				document.querySelector(".hybvsw6c > .rj1gh0hx").classList.add("switchTheme");
				document.querySelector(".switchTheme").innerHTML = `
				<i
					data-visualcompletion="css-img"
					class="hu5pjgll lzf7d6o1"
					style="
						background-image: url('https://static.xx.fbcdn.net/rsrc.php/v3/yk/r/oq_FJcM-f8I.png');
						background-position: 0px -977px;
						background-size: auto;
						width: 20px;
						height: 20px;
						background-repeat: no-repeat;
						display: inline-block;
					"
				></i>
				`;
				document.querySelector(".switchTheme").addEventListener("click", () => {
					switchTheme();
				});
				clearInterval(checkExist);
			}
		}, 100);

		let leftPanelState = 1;
		document.addEventListener("mousemove", (e) => {
			if (e.clientX < 10 && leftPanelState === 0) {
				document.querySelector(`div[role="navigation"]`).style.width = "88px";
				leftPanelState = 1;
			} else if (e.clientX > 88 && leftPanelState === 1) {
				document.querySelector(`div[role="navigation"]`).style.width = 0;
				leftPanelState = 0;
			}
		});
	}
});

function loadCSS(file) {
	var link = document.createElement("link");
	link.href = chrome.extension.getURL(file + ".css");
	link.id = file;
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
}

function unloadCSS(file) {
	var cssNode = document.getElementById(file);
	cssNode && cssNode.parentNode.removeChild(cssNode);
}

function switchTheme() {
	chrome.runtime.sendMessage({ mode: "getTheme" }, (response) => {
		if (response.theme === "dark") {
			unloadCSS("css/PayToWinSkin");
		} else {
			loadCSS("css/PayToWinSkin");
		}

		chrome.runtime.sendMessage({ mode: "saveTheme", theme: response.theme === "dark" ? "light" : "dark" });
	});
}
