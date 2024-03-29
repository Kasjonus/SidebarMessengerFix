let port = null;

chrome.runtime.onConnect.addListener((_port) => {
	port = _port;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const sendAndLog = (data) => {
		sendResponse(data);
		console.log(message.mode, data);
	};

	(async () => {
		switch (message.mode) {
			case "getTheme":
				try {
					chrome.storage.local.set({ ["connection"]: true });
					const status = await chrome.storage.local.get("connection");

					sendAndLog({ result: 200, status });
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
	})();

	return true;
});
