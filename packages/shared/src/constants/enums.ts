export const SESSION_TYPES = ['bouldering', 'sport', 'mixed', 'training'] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const ASCENT_STYLES = ['flash', 'onsight', 'redpoint', 'repeat', 'attempt'] as const;
export type AscentStyle = (typeof ASCENT_STYLES)[number];

export const ASCENT_RESULTS = ['send', 'fall', 'project'] as const;
export type AscentResult = (typeof ASCENT_RESULTS)[number];

export const LOCATION_TYPES = ['gym', 'crag', 'board', 'home_wall'] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export const WALL_ANGLES = ['slab', 'vertical', 'slight_overhang', 'overhang', 'roof'] as const;
export type WallAngle = (typeof WALL_ANGLES)[number];

export const HOLD_TYPES = ['crimps', 'slopers', 'pockets', 'jugs', 'pinches', 'volumes', 'underclings', 'sidepulls', 'gastons'] as const;
export type HoldType = (typeof HOLD_TYPES)[number];

export const BOARD_TYPES = ['kilter', 'tension', 'moon', 'aurora'] as const;
export type BoardType = (typeof BOARD_TYPES)[number];

export const GRADE_SYSTEMS = ['font', 'french', 'v_scale', 'yds'] as const;
export type GradeSystem = (typeof GRADE_SYSTEMS)[number];

export const PROJECT_STATUSES = ['active', 'sent', 'abandoned'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_TYPES = ['boulder', 'sport', 'board'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const CALENDAR_EVENT_TYPES = ['session', 'competition', 'rest_day', 'trip', 'custom'] as const;
export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];

export const MEDIA_TYPES = ['photo', 'video'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
