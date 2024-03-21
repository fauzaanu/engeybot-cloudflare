# Engeybot

Engeybot is a Telegram bot that integrates Telegram and the Perplexity API, running on Cloudflare Workers. The bot leverages Perplexity's online models to interact with messages in real time.

## Core Features

- Integration with Telegram
- Perplexity AI API Integration

## Additional Features

- Responds exclusively to private chat interactions and flagged messages with `#idk` in group chats.

## How It Works

To use the bot, a Telegram webhook needs to be set to the URL of the worker. This can be done by making a GET request to the following URL:

```http request
https://api.telegram.org/bot /setWebhook?url=<worker_url>/webhook&drop_pending_updates=true
```

After setting this webhook, Telegram will send a POST request to this URL whenever a message is sent to the bot.

## Usage

**Setting Environment Variables in Cloudflare Workers**

You can set environment variables within your Cloudflare Workers settings.

1. Navigate to the "Workers" section in the Cloudflare dashboard.
2. Click 'edit' on your Worker script.
3. Navigate to the "Settings" tab within the script area.
4. You'll find an "Environment Variables" section where you can add your variables.
5. Click the 'Add variable' button and input the variable name and its corresponding value.

After setting these environment variables, they will be available in your worker script.

## Dependencies

- Access to a Telegram bot.
- Perplexity AI API key.
- Cloudflare Workers Environment.
