# WhatsApp Bot Setup Guide

This guide walks through setting up the Munsif AI WhatsApp bot using Twilio's WhatsApp Business API.

## Prerequisites

- A Twilio account ([sign up here](https://www.twilio.com/try-twilio))
- A phone number with WhatsApp (for testing)
- The Munsif AI site deployed and publicly accessible (or tunneled for local dev)

## Step 1: Set Up Twilio WhatsApp Sandbox

1. Log in to your [Twilio Console](https://console.twilio.com).
2. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**.
3. You'll see a WhatsApp Sandbox page with:
   - A **Sandbox number** (e.g., `+14155238886`) — this is your `TWILIO_PHONE_NUMBER`
   - A **join code** (e.g., `join sand-pain`)
4. Send the join code as a WhatsApp message to the sandbox number from your phone. You'll receive a confirmation reply like _"You are now connected to the sandbox."_

## Step 2: Configure Environment Variables

Add the following to your `.env.local`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

- `TWILIO_ACCOUNT_SID` — Found on your Twilio Console dashboard
- `TWILIO_AUTH_TOKEN` — Found on your Twilio Console dashboard
- `TWILIO_PHONE_NUMBER` — Your sandbox number in WhatsApp format (e.g., `whatsapp:+14155238886`)

## Step 3: Configure the Webhook URL

Twilio needs a publicly accessible webhook URL. In the WhatsApp Sandbox page:

1. Under **Sandbox Configuration**, find the field: **When a message comes in**
2. Set it to: `https://your-domain.com/api/webhooks/whatsapp`
3. Set the Method to: `POST`
4. Click **Save**

### For local development

Use a tunneling service (locally, the dev server runs on port 3000):

```bash
# The site is already published on port 3000 via bun run publish
# For local dev with Twilio, you'll need a tool that exposes port 3000 publicly.
# Once the tunnel URL is ready, configure Twilio to:
# https://your-tunnel-url.com/api/webhooks/whatsapp
```

The production webhook URL should be: `https://munsif.ai/api/webhooks/whatsapp`

## Step 4: Test the Bot

1. Send any message to the sandbox WhatsApp number.
2. You should receive the welcome message with options:
   - 📄 Create a Document
   - 📋 My Documents
   - ❓ Help
3. Try the full flow: create a document → answer questions → receive the summary.
4. The PDF is available on the web dashboard at `/dashboard/documents`.

## Conversation Flow

| State | Description |
|-------|-------------|
| Welcome | User chooses Create / My Docs / Help |
| Choosing Doc | Select from 8 document types (reply with number or name) |
| Collecting Fields | One question at a time, 5-6 fields per document |
| Generating | PDF generation triggered, summary sent via WhatsApp |
| Done | Options to create another or exit |

### Commands

- `restart` / `start over` — Restart from the beginning
- `skip` — Skip an optional field
- `done` / `exit` — End the session

## Important Notes

- **Sandbox limitations**: The Twilio sandbox supports unlimited messages but only to/from numbers that have joined via the join code. For production, apply for WhatsApp Business API approval.
- **Interactive messages**: Due to Twilio's template approval requirements, the bot uses numbered lists and text replies instead of native buttons/list pickers. This simplifies development and avoids template pre-approval delays.
- **PDF delivery**: Due to the need for a publicly accessible media URL, PDFs are currently delivered as text summaries with a link to the web dashboard. To enable direct PDF delivery via WhatsApp media messages, implement cloud storage (S3/CloudFront) for generated PDFs and pass the public URL to `sendPdf()`.
- **Session expiry**: In-memory sessions expire after 30 minutes of inactivity.
- **AI Disclaimer**: Every document delivery includes the disclaimer that documents are AI-generated and not a substitute for licensed legal advice.

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | WhatsApp sandbox number (format: `whatsapp:+1XXXXXXXXXX`) |
