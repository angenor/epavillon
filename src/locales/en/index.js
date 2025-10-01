// Auto-generated translation index for en
import common from './common.json' with { type: 'json' };
import auth from './auth.json' with { type: 'json' };
import admin from './admin.json' with { type: 'json' };
import profile from './profile.json' with { type: 'json' };
import events from './events.json' with { type: 'json' };
import activities from './activities.json' with { type: 'json' };
import community from './community.json' with { type: 'json' };
import negotiations from './negotiations.json' with { type: 'json' };
import directory from './directory.json' with { type: 'json' };
import organizations from './organizations.json' with { type: 'json' };
import organizations_list from './organizations_list.json' with { type: 'json' };
import maintenance from './maintenance.json' with { type: 'json' };

export default {
  ...common,
  ...auth,
  ...admin,
  ...profile,
  ...events,
  activities: activities.activities,
  activity: activities.activity,
  ...community,
  ...negotiations,
  ...directory,
  ...organizations,
  ...organizations_list,
  ...maintenance,
};
