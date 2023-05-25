var port = chrome.runtime.connect({ name: "themeLoader" });
port.onMessage.addListener(function (message, sender) {
	console.log(message, sender);
	if (message.mode === "loadGXTheme") {
		document.documentElement.style = message.gx;
		message.isDarkTheme ? loadCSS("css/DarkGXSkin") : unloadCSS("css/DarkGXSkin");
	} else if (message.mode === "loadTheme") {
		message.isDarkTheme ? loadCSS("css/DarkSkin") : unloadCSS("css/DarkSkin");
	}
});

document.addEventListener("readystatechange", () => {
	if (document.readyState === "interactive") {
		document.body.style.backgroundColor = "#242526";
		loadCSS("css/DefaultFix");

		var checkAdExist = setInterval(function () {
			const container = document.querySelector(`div[id=":ri:"]`);

			if (!container) return;

			const adParentChildren = container.parentElement.children;
			adParentChildren[adParentChildren.length - 1].style.display = "none";

			clearInterval(checkAdExist);
		}, 100);

		chrome.runtime.sendMessage({ mode: "getTheme" }, async (response) => {
			console.log(response);

			let variables;

			const Browser = {
				OPERA: "Opera",
				OPERA_GX: "Opera GX",
				OTHER: "other",
			};

			const getProduct = async () => {
				if (navigator.userAgentData.brands.filter((b) => b.brand === Browser.OPERA_GX).length === 1) return Browser.OPERA_GX;
				if (navigator.userAgentData.brands.filter((b) => b.brand === Browser.OPERA).length === 1) return Browser.OPERA;
				return Browser.OTHER;
			};

			const isGx = async () => {
				return (await getProduct()) === Browser.OPERA_GX;
			};

			let isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

			const getGxColors = async () => {
				isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
				console.log("zMIANA");

				if (await isGx()) {
					variables = "";

					const setVariable = (name, value) => (variables += `--gx-${name}:${value};`);
					const getColor = (name, opacity = 1) =>
						new Promise((resolve) => {
							opr.palette.getColorHSL(name, (clr) => {
								const s = Math.floor(clr.s * 100);
								const l = Math.floor(clr.l * 100);
								resolve(`hsla(${clr.h}, ${s}%, ${l}%, ${clr.alpha * opacity})`);
							});
						});
					const isDarkFont = await new Promise((resolve) => {
						opr.palette.getColor("gx_accent", (clr) => {
							// http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
							const getLuminance = () => {
								const rgb = [clr.r, clr.g, clr.b].map((c) => {
									let cs = c / 255;
									return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
								});
								return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
							};
							resolve(getLuminance() > 0.45);
						});
					});

					const accentColor = await getColor("gx_accent");
					setVariable("accent-color", accentColor);
					const highlightColor = await getColor("gx_accent", 0.5);
					setVariable("highlight-color", highlightColor);
					setVariable("primary-button-font-color", isDarkFont ? "black" : "white");

					const primaryFontColor = await getColor(isDarkTheme ? "gx_no_100" : "gx_no_00");
					setVariable("primary-font-color", primaryFontColor);
					const secondaryFontColor = await getColor(isDarkTheme ? "gx_no_77" : "gx_no_24");
					setVariable("secondary-font-color", secondaryFontColor);

					setVariable("primary-button-color", accentColor);
					const disabledButtonBackgroundColor = await getColor(isDarkTheme ? "gx_no_16" : "gx_no_88", 0.5);
					setVariable("primary-button-disabled-color", disabledButtonBackgroundColor);
					setVariable("primary-button-hover-color", accentColor);
					setVariable("primary-button-focus-color", accentColor);

					const secondaryButtonColor = await getColor(isDarkTheme ? "gx_no_12" : "gx_no_98");
					setVariable("secondary-button-color", secondaryButtonColor);
					const secondaryButtonActionColor = await getColor(isDarkTheme ? "gx_no_08" : "gx_no_92");
					setVariable("secondary-button-hover-color", secondaryButtonActionColor);
					setVariable("secondary-button-focus-color", secondaryButtonActionColor);

					const primaryBackgroundColor = await getColor(isDarkTheme ? "gx_no_08" : "gx_no_96");
					setVariable("primary-background-color", primaryBackgroundColor);
					const secondaryBackgroundColor = await getColor(isDarkTheme ? "gx_no_12" : "gx_no_98");
					setVariable("secondary-background-color", secondaryBackgroundColor);

					const inputBackgroundColor = await getColor(isDarkTheme ? "gx_no_16" : "gx_no_88");
					setVariable("input-background-color", inputBackgroundColor);
					const inputBorderColor = await getColor(isDarkTheme ? "gx_no_32" : "gx_no_80");
					setVariable("input-border-color", inputBorderColor);

					const buttonBackgroundColor = await getColor(isDarkTheme ? "gx_no_20" : "gx_no_90");
					setVariable("button-background-color", buttonBackgroundColor);
					const buttonBackgroundHoverColor = await getColor(isDarkTheme ? "gx_no_32" : "gx_no_80");
					setVariable("button-background-hover-color", buttonBackgroundHoverColor);
					const buttonBackgroundFocusColor = await getColor(isDarkTheme ? "gx_no_59" : "gx_no_40");
					setVariable("button-background-focus-color", buttonBackgroundFocusColor);

					const separatorColor = await getColor(isDarkTheme ? "gx_no_32" : "gx_no_80");
					setVariable("separator-color", separatorColor);

					// port && port.postMessage({ mode: "loadGXTheme", gx: variables, isDarkTheme });
					document.documentElement.style = variables;
					loadCSS("css/GXSkin");
					isDarkTheme ? loadCSS("css/DarkGXSkin") : unloadCSS("css/DarkGXSkin");
				} else {
					// let isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
					// port && port.postMessage({ mode: "loadTheme", isDarkTheme });
				}

				// TODO: Jest problem z dynamicznym odświeżaniem po stronie jasnej
				// Zmienia kolor dopiero po wykonaniu jakiegoś eventu
				// Można by jakiś wywołać, żeby było git?
			};

			await getGxColors();

			if (window?.opr?.palette && !opr?.palette?.onPaletteChanged?.hasListener(getGxColors)) {
				getGxColors();
				console.log("Z GX");
				opr.palette.onPaletteChanged.addListener(getGxColors);
			}

			window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
				console.log("Z prefers-color-scheme");

				getGxColors();
			});

			loadCSS("css/GXSkin");
			document.documentElement.style = variables;
			isDarkTheme && loadCSS("css/DarkGXSkin");

			// if (response.gx !== "") {
			// 	loadCSS("css/GXSkin");
			// 	document.documentElement.style = response.gx;
			// 	response.isDarkTheme && loadCSS("css/DarkGXSkin");
			// } else {
			// 	response.isDarkTheme && loadCSS("css/DarkSkin");
			// }
		});

		let blockHidePanel = false;

		var checkExist = setInterval(function () {
			if (!document.querySelector(`input[dir="ltr"]`)) return;

			document.querySelector(`input[dir="ltr"]`).addEventListener("focus", () => {
				document.querySelector(`div[role="navigation"]`).classList.add("fullWidth");
				blockHidePanel = true;
			});

			document.querySelector(`input[dir="ltr"]`).addEventListener("blur", () => {
				document.querySelector(`div[role="navigation"]`).classList.remove("fullWidth");
				blockHidePanel = false;
			});

			if (document.querySelectorAll(`div[role="navigation"] > div > div:last-child div.x2bj2ny.x13vifvy > div:last-child`).length) {
				document.querySelector(`div[role="navigation"] > div > div:last-child div.x2bj2ny.x13vifvy > div:last-child`).classList.add("switchTheme");

				document.querySelector(".switchTheme").innerHTML = `
				<div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k">
					<a
						aria-label="Settings"
						class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1q0g3np x87ps6o x1lku1pv x1rg5ohu x1a2a7pz"
						rel="nofollow noopener"
						role="link"
						tabindex="0"
						target="_blank"
						><div class="x6s0dn4 x78zum5 xl56j7k">
							<span class="x1w0mnb"
								><svg viewBox="0 0 36 36" class="x1lliihq x1k90msu x2h7rmj x1qfuztq x198g3q0" fill="currentColor" height="24" width="24"><path clip-rule="evenodd" d="M19.842 7.526A1.5 1.5 0 0018.419 6.5h-.838a1.5 1.5 0 00-1.423 1.026l-.352 1.056c-.157.472-.541.827-1.006 1.003a8.93 8.93 0 00-.487.202c-.453.204-.976.225-1.42.002l-.997-.498a1.5 1.5 0 00-1.732.281l-.592.592a1.5 1.5 0 00-.28 1.732l.497.996c.223.445.202.968-.002 1.421-.072.16-.139.323-.202.487-.176.465-.531.849-1.003 1.006l-1.056.352A1.5 1.5 0 006.5 17.581v.838a1.5 1.5 0 001.026 1.423l1.056.352c.472.157.827.541 1.003 1.006.063.164.13.327.202.487.204.453.225.976.002 1.42l-.498.997a1.5 1.5 0 00.281 1.732l.593.592a1.5 1.5 0 001.73.28l.998-.497c.444-.223.967-.202 1.42.002.16.072.323.139.487.202.465.176.849.531 1.006 1.003l.352 1.056a1.5 1.5 0 001.423 1.026h.838a1.5 1.5 0 001.423-1.026l.352-1.056c.157-.472.541-.827 1.006-1.003.164-.063.327-.13.486-.202.454-.204.977-.225 1.421-.002l.997.498a1.5 1.5 0 001.732-.281l.592-.592a1.5 1.5 0 00.28-1.732l-.497-.996c-.223-.445-.202-.968.002-1.421.072-.16.139-.323.202-.487.176-.465.531-.849 1.003-1.006l1.056-.352a1.5 1.5 0 001.026-1.423v-.838a1.5 1.5 0 00-1.026-1.423l-1.056-.352c-.472-.157-.827-.541-1.003-1.006a8.991 8.991 0 00-.202-.487c-.204-.453-.225-.976-.002-1.42l.498-.997a1.5 1.5 0 00-.281-1.732l-.593-.592a1.5 1.5 0 00-1.73-.28l-.998.497c-.444.223-.967.202-1.42-.002a8.938 8.938 0 00-.487-.202c-.465-.176-.849-.531-1.006-1.003l-.352-1.056zM18 23.5a5.5 5.5 0 100-11 5.5 5.5 0 000 11z" fill-rule="evenodd"></path></svg></span
							><span class="xzd29fr"
								><span
									class="x1lliihq x1plvlek xryxfnj x1n2onr6 x193iq5w xeuugli x13faqbe x1vvkbs x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x1xmvt09 x1f6kntn x1s688f xzsf02u x2b8uid xudqn12 x3x7a5m xq9mrsl"
									dir="auto"
									style="line-height: var(--base-line-clamp-line-height); --base-line-clamp-line-height: 20px"
									>Settings</span
								></span
							>
						</div>
						<div
							class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h"
							data-visualcompletion="ignore"
						></div
					></a>
				</div>
				`;
				document.querySelector(".switchTheme").addEventListener("click", () => {
					const div = document.createElement("div");

					div.style.backgroundColor = "red";
					div.style.height = "100px";
					div.style.width = "100px";
					div.style.position = "fixed";
					div.style.zIndex = "100000000";
					div.style.top = "50%";
					div.style.left = "50%";
					div.style.transform = "translate(-50%, -50%)";
					div.onclick = () => {
						document.body.removeChild(div);
					};

					document.body.appendChild(div);
				});
				clearInterval(checkExist);
			}

			clearInterval(checkExist);
		}, 100);

		let leftPanelState = 1;
		document.addEventListener("mousemove", (e) => {
			const navElement = document.querySelector(`div[role="navigation"]`);
			if (e.clientX < 10 && leftPanelState === 0) {
				navElement.classList.remove("zeroWidth");
				leftPanelState = 1;
			} else if (!blockHidePanel && window.innerWidth < 900 && e.clientX > navElement.clientWidth && leftPanelState === 1) {
				navElement.classList.add("zeroWidth");
				leftPanelState = 0;
			}
		});
	}
});

function loadCSS(file) {
	if (document.querySelectorAll(`link[id="${file}"]`).length > 0) return;
	var link = document.createElement("link");
	link.href = chrome.runtime.getURL(file + ".css");
	link.id = file;
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
}

function unloadCSS(file) {
	var cssNode = document.querySelectorAll(`link[id="${file}"]`);
	cssNode.forEach((elm) => elm.parentNode.removeChild(elm));
}
