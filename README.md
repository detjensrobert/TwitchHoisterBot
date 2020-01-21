# Twitch Hoister

Gives a hoisted role to people currently streaming.

------------

### Overview

A moderator adds a user to be tracked by the bot with `!streamer add @USER`.

When a user goes live and is set to be tracked, the bot gives them a hoisted role while they are streaming.

------------

### Usage
- `!streamer add @USER`

  Adds @USER to the verfied streamers list.
  
- `!streamer remove @USER`

  Removes @USER from the verfied streamers list.

------------

### Setup
Main file is `bot.js`.  `npm start` will start the bot.

Bot token goes in `token.json`. Create if not present:
```json
{
  "token": "TOKEN HERE"
}
```

Default prefix is `!streamer`. 
The role IDs for the moderator and "Currently Streaming" roles go under `roles` in `config.json`: 
```json
{
  "prefix": "!streamer",

  "roles": {
    "moderator": "MODERATOR ID",
    "streaming": "CURRENTLY STREAMING ID"
  }
}
```
