import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { callApi } from './api-client.js';

// Shared annotations — all tools are read-only queries against a closed dataset
const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

export function registerTools(server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      // ── ORGANISATIONS ENDPOINTS ─────────────────────────────────────
      {
        name: 'get_all_organisations',
        title: 'List All Organisations',
        description:
          'Returns every organisation in the BanatIT/TechTable directory for Timișoara, Romania. ' +
          'Each record contains: ID (kebab-case slug, e.g. "banat-it"), Nume (display name in Romanian), ' +
          'Website, Descriere (short description), LogoID, and Rol. ' +
          'Rol values: "Tech Company", "NGO", "Tech NGO", "Ecology NGO", "Coworking Space", "Accelerator", "Student Org", "Community". ' +
          'Use this when you need the full catalogue of ecosystem organisations.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_organisation_by_id',
        title: 'Get Organisation by ID',
        description:
          'Returns a single organisation by its unique ID slug. ' +
          'IDs are kebab-case ASCII strings (e.g. "banat-it", "endava-tm", "bio-team-tm"). ' +
          'Returns all fields: ID, Nume, Website, Descriere, LogoID, Rol. ' +
          'Use this when you already know the exact organisation slug.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Organisation ID slug in kebab-case (e.g. "banat-it", "code-for-timisoara", "impact-hub-tm")'
            }
          },
          required: ['id']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_organisations_by_role',
        title: 'Filter Organisations by Role',
        description:
          'Returns all organisations matching a given Rol value (case-insensitive match). ' +
          'Valid Rol values: "Tech Company", "NGO", "Tech NGO", "Ecology NGO", ' +
          '"Coworking Space", "Accelerator", "Student Org", "Community". ' +
          'Use this to find all NGOs, all companies, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              description: 'Role to filter by. Valid values: "Tech Company", "NGO", "Tech NGO", "Ecology NGO", "Coworking Space", "Accelerator", "Student Org", "Community"'
            }
          },
          required: ['role']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'search_organisations',
        title: 'Search Organisations',
        description:
          'Performs a case-insensitive substring (contains) search across organisation records. ' +
          'Optionally restrict to a single field. Searchable fields: ID, Nume, Website, Descriere, LogoID, Rol. ' +
          'Returns all matching organisation records. ' +
          'Example: q="fundatia" searches all fields; q="tech", field="Rol" searches only the Rol column.',
        inputSchema: {
          type: 'object',
          properties: {
            q: {
              type: 'string',
              description: 'Search query — performs a case-insensitive substring match'
            },
            field: {
              type: 'string',
              description: 'Optional: restrict search to this column. Valid values: "ID", "Nume", "Website", "Descriere", "LogoID", "Rol". Omit to search all fields.'
            }
          },
          required: ['q']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },

      // ── EVENTS ENDPOINTS ─────────────────────────────────────────
      {
        name: 'get_all_events',
        title: 'List All Events',
        description:
          'Returns every event in the TechTable directory for Timișoara, sorted by Date ascending. ' +
          'Each record contains: ID (format "evt-NNN"), Year, OrganizationID (FK to Organisations.ID), ' +
          'LocationID, Name, Short (tagline), Description, Date (YYYY-MM-DD), Start_Time (HH:MM), ' +
          'End_Time (HH:MM), Category, Tags (string array), Max_Participants, Event_URL, ' +
          'Event_Cover_URL, Access_Type ("Free" or "Ticketed"), Tickets_URL, EventPhotos_URL, ' +
          'Speakers (string array of names), SpeakersCount, Real_Participants. ' +
          'Category values: "Conference", "Meetup", "Workshop", "Hackathon", "Fundraiser", "Networking", "Community", "Education".',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_event_by_id',
        title: 'Get Event by ID',
        description:
          'Returns a single event by its unique ID. Event IDs use the format "evt-NNN" ' +
          '(e.g. "evt-001", "evt-012", "evt-030"). Returns the full event record with all fields.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Event ID in format "evt-NNN" (e.g. "evt-001", "evt-012")'
            }
          },
          required: ['id']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_upcoming_events',
        title: 'List Upcoming Events',
        description:
          'Returns events with Date >= today (server time, Europe/Bucharest timezone), ' +
          'sorted by Date ascending (nearest future event first). ' +
          'Use this to find what\'s happening next in the Timișoara tech ecosystem. ' +
          'Note: Real_Participants will be blank for future events.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_past_events',
        title: 'List Past Events',
        description:
          'Returns events with Date < today (server time, Europe/Bucharest timezone), ' +
          'sorted by Date descending (most recent past event first). ' +
          'Past events may include Real_Participants (actual attendance) and EventPhotos_URL.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_events_by_org',
        title: 'Events by Organisation',
        description:
          'Returns all events organised by a specific organisation, identified by its ID slug. ' +
          'The orgId must match an Organisations.ID value (e.g. "banat-it", "code-for-timisoara"). ' +
          'Use this to see all events — past and future — hosted by a given organisation.',
        inputSchema: {
          type: 'object',
          properties: {
            orgId: {
              type: 'string',
              description: 'Organisation ID slug (kebab-case, e.g. "banat-it", "impact-hub-tm"). Must match Organisations.ID.'
            }
          },
          required: ['orgId']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_events_by_category',
        title: 'Events by Category',
        description:
          'Returns all events matching a given Category value. ' +
          'Valid categories: "Conference", "Meetup", "Workshop", "Hackathon", ' +
          '"Fundraiser", "Networking", "Community", "Education". ' +
          'Use this to find all meetups, all hackathons, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Event category. Valid values: "Conference", "Meetup", "Workshop", "Hackathon", "Fundraiser", "Networking", "Community", "Education"'
            }
          },
          required: ['category']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_events_by_date_range',
        title: 'Events by Date Range',
        description:
          'Returns events within an inclusive date range. Both "from" and "to" are optional: ' +
          'omit "from" to get all events up to the "to" date; omit "to" to get all events from "from" onwards; ' +
          'omit both to get all events (equivalent to get_all_events). ' +
          'Dates must be ISO 8601 format YYYY-MM-DD. Results sorted by Date ascending.',
        inputSchema: {
          type: 'object',
          properties: {
            from: {
              type: 'string',
              description: 'Start date inclusive, format YYYY-MM-DD (e.g. "2027-06-01"). Optional.'
            },
            to: {
              type: 'string',
              description: 'End date inclusive, format YYYY-MM-DD (e.g. "2027-06-30"). Optional.'
            }
          },
          required: []
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_events_by_access',
        title: 'Events by Access Type',
        description:
          'Returns events filtered by their Access_Type field. ' +
          'Only two valid values: "Free" (no ticket required) or "Ticketed" (requires ticket purchase). ' +
          'Ticketed events will include a Tickets_URL field with the purchase link.',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Access type filter. Must be exactly "Free" or "Ticketed".'
            }
          },
          required: ['type']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'search_events',
        title: 'Search Events',
        description:
          'Performs a case-insensitive substring (contains) search across event records. ' +
          'Optionally restrict to a single field. Searchable fields include: ID, Name, Short, Description, ' +
          'Category, Tags, Speakers, OrganizationID, Access_Type, and all other event columns. ' +
          'Example: q="AI" searches all fields; q="Hackathon", field="Category" searches only Category.',
        inputSchema: {
          type: 'object',
          properties: {
            q: {
              type: 'string',
              description: 'Search query — performs a case-insensitive substring match'
            },
            field: {
              type: 'string',
              description: 'Optional: restrict search to this column (e.g. "Name", "Category", "Tags", "Description", "OrganizationID"). Omit to search all fields.'
            }
          },
          required: ['q']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },

      // ── MEMBERS ENDPOINTS ─────────────────────────────────────────
      // NOTE: Members is a junction table. One person → N rows (one per organisation).
      {
        name: 'get_all_members',
        title: 'List All Members',
        description:
          'Returns all membership rows in the BanatIT/TechTable community directory (one row per person–org pair). ' +
          'Members is a junction table: a single person can appear in multiple rows if they belong to multiple organisations. ' +
          'Use this when you need the full directory of community memberships.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_member_by_id',
        title: 'Get Member by ID',
        description:
          'Returns all membership rows for a person by their unique ID slug. ' +
          'Because Members is a junction table, this always returns an ARRAY (one entry per organisation the person belongs to). ' +
          'IDs are kebab-case ASCII strings (e.g. "ana-blaga", "john-doe"). ' +
          'Use this when you already know the exact member slug.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Member ID slug in kebab-case (e.g. "ana-blaga", "john-doe")'
            }
          },
          required: ['id']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_members_by_org',
        title: 'Members by Organisation',
        description:
          'Returns all members belonging to a specific organisation, identified by its ID slug. ' +
          'The orgId must match an Organisations.ID value (e.g. "banat-it", "code-for-timisoara"). ' +
          'Use this to see all people associated with a given organisation.',
        inputSchema: {
          type: 'object',
          properties: {
            orgId: {
              type: 'string',
              description: 'Organisation ID slug (kebab-case, e.g. "banat-it", "impact-hub-tm"). Must match Organisations.ID.'
            }
          },
          required: ['orgId']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_orgs_for_member',
        title: 'Organisations for a Member',
        description:
          'Returns all membership rows for a person, with full organisation data embedded under an "Organisation" key. ' +
          'Useful for displaying a person\'s complete profile across all orgs they belong to. ' +
          'The id must be the member\'s kebab-case slug (e.g. "ana-blaga").',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Member ID slug in kebab-case (e.g. "ana-blaga")'
            }
          },
          required: ['id']
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'get_members_with_org',
        title: 'All Members with Organisation Details',
        description:
          'Returns all membership rows with the parent organisation\'s Nume and Rol embedded in each record. ' +
          'Useful for directory listings where you want to display each member alongside their organisation name and type. ' +
          'No parameters required.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        annotations: READ_ONLY_ANNOTATIONS
      },
      {
        name: 'search_members',
        title: 'Search Members',
        description:
          'Performs a case-insensitive substring (contains) search across member records. ' +
          'Optionally restrict to a single field. ' +
          'Returns all matching membership rows. ' +
          'Example: q="irimia" searches all fields; q="ana", field="Name" searches only the Name column.',
        inputSchema: {
          type: 'object',
          properties: {
            q: {
              type: 'string',
              description: 'Search query — performs a case-insensitive substring match'
            },
            field: {
              type: 'string',
              description: 'Optional: restrict search to this column (e.g. "Name", "OrganizationID"). Omit to search all fields.'
            }
          },
          required: ['q']
        },
        annotations: READ_ONLY_ANNOTATIONS
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
        // ── MEMBERS ────────────────────────────────────────────────
        case 'get_all_members':
          result = await callApi({ resource: 'members', action: 'getAll' });
          break;
        case 'get_member_by_id':
          result = await callApi({ resource: 'members', action: 'getById', id: args.id });
          break;
        case 'get_members_by_org':
          result = await callApi({ resource: 'members', action: 'getByOrg', orgId: args.orgId });
          break;
        case 'get_orgs_for_member':
          result = await callApi({ resource: 'members', action: 'getOrgsForMember', id: args.id });
          break;
        case 'get_members_with_org':
          result = await callApi({ resource: 'members', action: 'getMembersWithOrg' });
          break;
        case 'search_members':
          result = await callApi({ resource: 'members', action: 'search', q: args.q, field: args.field });
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
