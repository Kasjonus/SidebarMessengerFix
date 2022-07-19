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
				sendAndLog({ result: 200, theme: theme || "light", gx: localStorage.getItem("GXTheme") });
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
		case "saveGXTheme":
			try {
				localStorage.setItem("GXTheme", message.theme);
				sendAndLog({ result: 200, theme: message.theme });
			} catch (error) {
				sendAndLog({ result: 500, error: error });
			}

		default:
			sendAndLog({ result: 400, error: "invalid function" });
			break;
	}
});
