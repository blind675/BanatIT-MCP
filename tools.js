import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { callApi } from './api-client.js';

export function registerTools(server) {
  // ── ORGANISATIONS ENDPOINTS ─────────────────────────────────────

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'get_all_organisations',
        description: 'Get all organisations',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_organisation_by_id',
        description: 'Get a single organisation by ID slug',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Organisation ID slug' }
          },
          required: ['id']
        }
      },
      {
        name: 'get_organisations_by_role',
        description: 'Get all organisations with a given role (case-insensitive)',
        inputSchema: {
          type: 'object',
          properties: {
            role: { type: 'string', description: 'Role to filter by (e.g., NGO)' }
          },
          required: ['role']
        }
      },
      {
        name: 'search_organisations',
        description: 'Search organisations by field. Contains search. Omit field to search all fields.',
        inputSchema: {
          type: 'object',
          properties: {
            q: { type: 'string', description: 'Search query' },
            field: { type: 'string', description: 'Field to search (optional, e.g., Nume)' }
          },
          required: ['q']
        }
      },
      // ── EVENTS ENDPOINTS ─────────────────────────────────────────

      {
        name: 'get_all_events',
        description: 'Get all events sorted by Date ascending',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_event_by_id',
        description: 'Get a single event by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Event ID' }
          },
          required: ['id']
        }
      },
      {
        name: 'get_upcoming_events',
        description: 'Get events with Date >= today, sorted ascending',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_past_events',
        description: 'Get events with Date < today, sorted descending',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_events_by_org',
        description: 'Get all events linked to an organization ID',
        inputSchema: {
          type: 'object',
          properties: {
            orgId: { type: 'string', description: 'Organization ID' }
          },
          required: ['orgId']
        }
      },
      {
        name: 'get_events_by_category',
        description: 'Get events matching a Category value',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Event category (e.g., Hackathon)' }
          },
          required: ['category']
        }
      },
      {
        name: 'get_events_by_date_range',
        description: 'Get events within an inclusive date range. Both params optional.',
        inputSchema: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
            to: { type: 'string', description: 'End date (YYYY-MM-DD)' }
          },
          required: []
        }
      },
      {
        name: 'get_events_by_access',
        description: 'Get events filtered by Access_Type (Free or Ticketed)',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Access type: Free or Ticketed' }
          },
          required: ['type']
        }
      },
      {
        name: 'search_events',
        description: 'Search events by field. Contains search. Omit field to search all fields.',
        inputSchema: {
          type: 'object',
          properties: {
            q: { type: 'string', description: 'Search query' },
            field: { type: 'string', description: 'Field to search (optional, e.g., Name)' }
          },
          required: ['q']
        }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;

      switch (name) {
        // ── ORGANISATIONS ────────────────────────────────────────
        case 'get_all_organisations':
          result = await callApi({ resource: 'organisations', action: 'getAll' });
          break;
        case 'get_organisation_by_id':
          result = await callApi({ resource: 'organisations', action: 'getById', id: args.id });
          break;
        case 'get_organisations_by_role':
          result = await callApi({ resource: 'organisations', action: 'getByRole', role: args.role });
          break;
        case 'search_organisations':
          result = await callApi({ resource: 'organisations', action: 'search', q: args.q, field: args.field });
          break;
        // ── EVENTS ────────────────────────────────────────────────
        case 'get_all_events':
          result = await callApi({ resource: 'events', action: 'getAll' });
          break;
        case 'get_event_by_id':
          result = await callApi({ resource: 'events', action: 'getById', id: args.id });
          break;
        case 'get_upcoming_events':
          result = await callApi({ resource: 'events', action: 'getUpcoming' });
          break;
        case 'get_past_events':
          result = await callApi({ resource: 'events', action: 'getPast' });
          break;
        case 'get_events_by_org':
          result = await callApi({ resource: 'events', action: 'getByOrg', orgId: args.orgId });
          break;
        case 'get_events_by_category':
          result = await callApi({ resource: 'events', action: 'getByCategory', category: args.category });
          break;
        case 'get_events_by_date_range':
          result = await callApi({ resource: 'events', action: 'getByDateRange', from: args.from, to: args.to });
          break;
        case 'get_events_by_access':
          result = await callApi({ resource: 'events', action: 'getByAccess', type: args.type });
          break;
        case 'search_events':
          result = await callApi({ resource: 'events', action: 'search', q: args.q, field: args.field });
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2)
        }],
        isError: true
      };
    }
  });
}
