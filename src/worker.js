const rateLimiter = {};

// Limit users to 10 requests per hour
const MAX_REQUESTS_PER_HOUR = 2;
const RATE_LIMIT_HOURS = 1;

export default {
	fetch(request, env, ctx) {
		return handleEvent(request, env);
	}
};

async function handleEvent(request, env) {
	const { TELEGRAM_KEY, PPX_KEY, ADMIN, ADMIN_CHAT_ID } = env;

	async function makePerplexityRequest(messageText) {
		const url = 'https://api.perplexity.ai/chat/completions';
		const params = {
			model: 'pplx-70b-online',
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

	function checkRateLimit(userId) {
		const currentTime = Math.floor(Date.now() / 1000);
		if (!rateLimiter[userId]) {
			rateLimiter[userId] = { start: currentTime, count: 0 };
		}
		const timeElapsed = (currentTime - rateLimiter[userId].start) / (60 * 60);

		if (timeElapsed >= RATE_LIMIT_HOURS) {
			// Reset rate limit for user after an hour
			rateLimiter[userId] = { start: currentTime, count: 0 };
		}

		// if ADMIN is sending message, don't limit
		if (userId === ADMIN) {
			return true;
		}

		return rateLimiter[userId].count < MAX_REQUESTS_PER_HOUR;
	}


	if (request.method === 'POST') {
		const body = await request.json();
		const chatId = body.message.chat.id;
		const chatType = body.message.chat.type;
		const messageText = body.message.text;

		if (chatType === 'private' || messageText.includes('#idk')) {

			await sendMessageToTelegram(
				chatId,
				'Please wait while I think...'
			)

			// Apply rate limiting here
			if (!checkRateLimit(chatId)) {
				const limitMessage = 'Rate limit exceeded. Please contact ' + ADMIN;
				await sendMessageToTelegram(chatId, limitMessage);
				return new Response(limitMessage, { status: 429 });
			}

			let formatted_msg_text = messageText.replace('#idk', '');

			const aiResponse = await makePerplexityRequest(formatted_msg_text);
			await sendMessageToTelegram(chatId, aiResponse);
			rateLimiter[chatId].count++;
		}
		return new Response('', { status: 200 });
	} else {
		return new Response('', { status: 405 });
	}
}
