# Engeybot

Engeybot is a telegram bot that integrates Telegram and the Perplexity API, running on Cloudflare Workers. With Perplexity online models the bot has access to realtime events.

## Core Features

- Integration with Telegram
- Perplexity AI API Integration
- In-built rate limiting

## Additional Features

- Responds exclusively to private chat interactions and flagged messages with `#idk` if in a group chat
- Rate limitations are excluded for Admin users
- Sends warning once the user reaches the request limit asking to contact admin
- [ ] TODO: Implement a way to add these users to a list to be excluded from rate limiting with admins permission

## How It Works

A telegram webhook must be set to the workers url. This should be a GET request to the following url
```http request
https://api.telegram.org/bot<token>/setWebhook?url=<worker_url>/webhooks/telegram&drop_pending_updates=true
```

When this webhook is set telegram will send a post request to that url whenever a message is sent to the bot.

## Usage

**Setting Environment Variables in Cloudflare Workers**

Inside your Cloudflare Workers settings, you can set environment variables.

1. Navigate to the Workers section in the Cloudflare dashboard
2. Click 'edit' on your Worker script
3. In the Script area, you'll find the settings tab, click it
4. You'll see an ENVIRONMENT VARIABLES section, this is where you can add your variables
5. Click the 'Add variable' button and input the variable name and its corresponding value

Once you have set the environment variables, they will be available in your Worker script.

## Dependencies

- Access to a Telegram bot
- Perplexity AI API key
- Cloudflare Workers Environment
