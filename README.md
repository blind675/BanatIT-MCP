# BanatIT MCP Server

An MCP (Model Context Protocol) server that exposes BanatIT organisations and events endpoints for Timișoara, Romania. Built with Node.js, Express, and the MCP SDK using SSE transport for remote access.

## Prerequisites

- Node.js >= 18

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

The `API_BASE_URL` is pre-configured to the Google Apps Script endpoint.

## Running Locally

```bash
npm start
```

The server will start on port 3000 (or the `PORT` env var).

- SSE endpoint: `http://localhost:3000/sse`
- Health check: `http://localhost:3000/health`

## Deploying to Railway

1. Connect your GitHub repository to Railway
2. Set the `API_BASE_URL` environment variable in Railway settings
3. Railway will auto-detect Node.js and run `npm start`

## Available MCP Tools

### Organisations (4 tools)
- `get_all_organisations` — Get all organisations
- `get_organisation_by_id` — Get single organisation by ID slug
- `get_organisations_by_role` — Filter by role (case-insensitive)
- `search_organisations` — Contains search on any/all fields

### Events (9 tools)
- `get_all_events` — Get all events (sorted by Date ascending)
- `get_event_by_id` — Get single event by ID
- `get_upcoming_events` — Events with Date >= today
- `get_past_events` — Events with Date < today
- `get_events_by_org` — Events linked to an organization ID
- `get_events_by_category` — Events matching a Category
- `get_events_by_date_range` — Events within date range (inclusive)
- `get_events_by_access` — Filter by Access_Type (Free/Ticketed)
- `search_events` — Contains search on any/all fields

## Connecting from Claude Desktop

Add to your Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "banatit": {
      "transport": {
        "type": "sse",
        "url": "https://your-railway-app-url.railway.app/sse"
      }
    }
  }
}
```
