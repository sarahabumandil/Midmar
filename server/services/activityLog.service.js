import { ActivityLog } from '../models/ActivityLog.js';

const normalizeIp = (req) => {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || '';
};

const normalizeActor = (req, fallback = {}) => {
  const actor = req.user || fallback.user || null;
  if (!actor) {
    return {
      actorUserId: null,
      actorEmail: '',
      actorName: '',
      actorRole: 'anonymous',
      clubId: null,
    };
  }
  return {
    actorUserId: actor._id || actor.id || null,
    actorEmail: actor.email || '',
    actorName: actor.name || '',
    actorRole: actor.role || 'user',
    clubId: actor.clubId || fallback.clubId || null,
  };
};

export const logActivity = async (req, payload) => {
  try {
    const actor = normalizeActor(req, payload || {});
    await ActivityLog.create({
      ...actor,
      action: String(payload?.action || '').trim(),
      resource: String(payload?.resource || '').trim(),
      status: payload?.status || 'success',
      details: payload?.details || '',
      metadata: payload?.metadata || {},
      ipAddress: normalizeIp(req),
      userAgent: req.headers?.['user-agent'] || '',
    });
  } catch (error) {
    console.error('Failed to write activity log:', error?.message || error);
  }
};
