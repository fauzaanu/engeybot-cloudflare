export default {
    fetch(request, env, ctx) {
        // Separate the URL path
        const url = new URL(request.url);
        // Only accepting '/webhook' path
        if (url.pathname === '/webhook') {
            return handleEvent(request, env);
        }
        return new Response("Not found", { status: 404 });
    }
};

/**
 * Handles an event and performs necessary actions based on the request and environment variables.
 *
 * @param {Request} request - The incoming request object.
 * @param {Object} env - The environment variables object.
 * @returns {Response} - The response object.
 */
async function handleEvent(request, env) {
	const { TELEGRAM_KEY, PPX_KEY } = env;

	async function makePerplexityRequest(messageText) {
		const url = 'https://api.perplexity.ai/chat/completions';
		const params = {
			model: 'pplx-7b-online',
			messages: [
				{ role: 'system', content: 'Be precise and concise.' },
				{ role: 'user', content: messageText }
			]
		};
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${PPX_KEY}`,
				'Content-Type': 'application/json',
				'accept': 'application/json'
			},
			body: JSON.stringify(params)
		});
		const data = await res.json();
		return data.choices[0].message.content;
	}

	async function sendMessageToTelegram(chatId, text) {
		const url = `https://api.telegram.org/bot${TELEGRAM_KEY}/sendMessage`;
		const params = {
			chat_id: chatId,
			text
		};
		await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(params)
		});
	}



	if (request.method === 'POST') {
		const body = await request.json();
		console.log(body);
		let chatId;
		let chatType;
		let messageText;

		try {
			chatId = body.message.chat.id;
			chatType = body.message.chat.type;
			messageText = body.message.text;
		} catch (e) {
			console.log(body);
			return new Response('', { status: 405 });
		}

		if (chatType === 'private' || messageText.includes('#idk')) {
			await sendMessageToTelegram(
				chatId,
				'Please wait while I think...'
			);

			let formatted_msg_text = messageText.replace('#idk', '');

			const aiResponse = await makePerplexityRequest(formatted_msg_text);
			await sendMessageToTelegram(chatId, aiResponse);
			return new Response('', { status: 200 });
		} else {
			return new Response('', { status: 405 });
		}
	} else if (request.method === 'GET') {
		return new Response('', { status: 405 });
	} else {
		return new Response('', { status: 405 });
	}
}
