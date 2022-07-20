let variables = "";
let port = null;

const getGxColors = async () => {
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
	const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

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

	port && port.postMessage({ mode: "loadGXTheme", gx: variables });
};

if (!opr.palette.onPaletteChanged.hasListener(getGxColors)) {
	getGxColors();
	opr.palette.onPaletteChanged.addListener(getGxColors);
}

chrome.runtime.onConnect.addListener((_port) => {
	port = _port;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const sendAndLog = (data) => {
		sendResponse(data);
		console.log(message.mode, data);
	};

	switch (message.mode) {
		case "getTheme":
			try {
				const theme = localStorage.getItem("theme");
				if (theme === null) {
					localStorage.setItem("theme", "light");
				}
				sendAndLog({ result: 200, theme: theme || "light", gx: variables });
			} catch (error) {
				sendAndLog({ result: 500, error: error });
			}
			break;
		case "saveTheme":
			try {
				localStorage.setItem("theme", message.theme);
				sendAndLog({ result: 200, theme: message.theme });
			} catch (error) {
				sendAndLog({ result: 500, error: error });
			}

			break;

		default:
			sendAndLog({ result: 400, error: "invalid function" });
			break;
	}
});
