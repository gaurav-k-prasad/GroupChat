const input = document.querySelector("#input");
const send = document.querySelector("#send");
const data = document.querySelector(".data");
const getName = document.querySelector("#get-name input");
const setName = document.querySelector("#name-select-button");
const overlay = document.querySelector("#overlay");
const getNamePopup = document.querySelector("#get-name");
const container = document.querySelector(".container");
const reply = document.querySelector(".reply");

const CLOSE = -1;
const MESSAGE = 0;
const OPEN = 1;
let wss, color;
let replyColor;

let userName = "anonymous";

// * Functions
function main() {
	getName.focus();
}

function createColor() {
	const hue = Math.floor(Math.random() * 360);
	const saturation = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
	const lightness = Math.floor(Math.random() * (85 - 40 + 1)) + 40;

	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function createMessage(chat) {
	let wrapper = document.createElement("div");
	let user = document.createElement("div");
	let text = document.createElement("div");

	if (data.innerHTML.trim() != "") {
		let hr = document.createElement("hr");
		hr.style.border = "0";
		hr.style.paddingBottom = "8px";
		hr.style.opacity = 0.2;
		hr.style.borderTop = "white 1px solid";
		hr.style.width = "80%";
		hr.style.margin = "auto"
		wrapper.appendChild(hr);
	}

	if (chat.operation == CLOSE) {
		const disconnect = document.createElement("span");
		disconnect.classList.add("disconnect");
		disconnect.innerText = `"${chat.userName}"` + " disconnected";
		wrapper.appendChild(disconnect);

		return wrapper;
	} else if (chat.operation == OPEN) {
		const connect = document.createElement("span");
		connect.classList.add("connect");
		connect.innerText = `"${chat.userName}"` + " connected";
		wrapper.appendChild(connect);

		return wrapper;
	}

	wrapper.classList.add("message");

	let userSpan = document.createElement("span");
	userSpan.innerText = "~ " + chat.userName;
	userSpan.classList.add("user");
	userSpan.style.color = chat.color;
	user.appendChild(userSpan);
	wrapper.appendChild(user);

	if (chat?.userInfo) {
		console.log(chat);
		let arrowSpan = document.createElement("span");
		arrowSpan.style.color = "white";
		arrowSpan.innerHTML = arrowSpan.innerHTML + " &rarr; ";
		user.appendChild(arrowSpan);

		let responseUserSpan = document.createElement("span");
		responseUserSpan.classList.add("user");
		responseUserSpan.style.color = chat.userInfo.color;
		responseUserSpan.innerText = "~ " + chat.userInfo.userName;
		user.appendChild(responseUserSpan);
	}

	user.style.paddingBottom = "0.2rem";

	text.innerText = chat.text;
	wrapper.appendChild(text);

	return wrapper;
}

function addMessage(userMessage) {
	let newMessage = createMessage(userMessage);
	data?.appendChild(newMessage);
	data.scrollTop = data.scrollHeight;
}

function sendMessage() {
	let text = input.value.trim();
	if (text == "") return;

	input.value = "";

	let message = {
		operation: MESSAGE,
		userName: userName,
		text: text,
		color: color,
	};

	if (!reply.classList.contains("display-none")) {
		let userInfo = {};
		userInfo.userName = reply.innerText.substring(2);
		userInfo.color = replyColor;
		message.userInfo = userInfo;
		reply.classList.add("display-none");
	}

	wss.send(JSON.stringify(message));
}

function setNameForSocket() {
	let value = getName.value.trim();
	if (value == "") {
		getName.focus();
		return;
	}

	userName = value;
	overlay.classList.add("display-none");
	getNamePopup.classList.add("display-none");
	container.classList.remove("blur");

	wss = new WebSocket("ws://localhost:8080");
	// const wss = new WebSocket("https://zz1j2hqn-8080.inc1.devtunnels.ms/");
	color = createColor();

	// * WebSocket
	wss.onopen = () => {
		wss.send(
			JSON.stringify({
				operation: OPEN,
				userName: userName,
				color: color,
			})
		);
		console.log("Connected");
	};

	wss.onclose = () => {
		console.log("Connection close");
	};

	wss.onmessage = (event) => {
		let message = JSON.parse(event.data);
		console.log(message);

		if (message.operation == CLOSE) {
		} else if (message.operation == OPEN) {
		}

		addMessage(message);
	};

	input.focus();
}

// * Event Listeners
send.addEventListener("click", () => {
	if (wss.readyState) {
		sendMessage();
	}
});

document.addEventListener("keypress", (event) => {
	if (event.key == "/" && overlay.classList.contains("display-none")) {
		setTimeout(() => {
			input?.focus();
		}, 0);
	} else if (event.key == "Enter") {
		if (container.classList.contains("blur")) setNameForSocket();
		else sendMessage();
	}
});

reply.addEventListener("click", () => {
	reply.classList.add("display-none");
});

setName.addEventListener("click", setNameForSocket);

data.addEventListener("click", (event) => {
	if (event.target.classList.contains("user")) {
		reply.innerText = event.target.innerText;
		reply.classList.remove("display-none");
		replyColor = event.target.style.color;
		input.focus();
	}
});

window.addEventListener("beforeunload", (event) => {
	if (wss.readyState === WebSocket.OPEN) {
		wss.send(
			JSON.stringify({
				operation: CLOSE,
				userName: userName,
				color: color,
			})
		);
	}
});

// * Flow
main();
