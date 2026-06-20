/**
 * Auth Validation Schemas (Joi)
 * Validates request bodies for all auth endpoints.
 */

const Joi = require('joi');

/**
 * POST /api/v1/auth/register
 * Body sent along with the Firebase ID token.
 */
const registerSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(50).required()
    .messages({
      'string.empty': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters',
    }),
  last_name: Joi.string().trim().max(50).allow('', null)
    .messages({
      'string.max': 'Last name cannot exceed 50 characters',
    }),
  phone: Joi.string().trim().pattern(/^\+?[1-9]\d{6,14}$/).allow('', null)
    .messages({
      'string.pattern.base': 'Phone must be a valid international format (e.g., +923001234567)',
    }),
  age: Joi.number().integer().min(13).max(120).required()
    .messages({
      'number.min': 'Must be at least 13 years old',
      'number.max': 'Invalid age',
      'any.required': 'Age is required',
    }),
  accessibility_profile: Joi.string()
    .valid('standard', 'elderly', 'injury_prone')
    .default('standard'),
});

/**
 * PUT /api/v1/users/:user_id/profile (used in Phase 9, defined here for reuse)
 */
const updateProfileSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(50),
  last_name: Joi.string().trim().max(50).allow('', null),
  phone: Joi.string().trim().pattern(/^\+?[1-9]\d{6,14}$/).allow('', null),
  age: Joi.number().integer().min(13).max(120),
  profile_photo_url: Joi.string().uri().allow('', null),
  accessibility: Joi.object({
    profile: Joi.string().valid('standard', 'elderly', 'injury_prone'),
    font_size: Joi.string().valid('small', 'medium', 'large', 'xlarge'),
    theme: Joi.string().valid('light', 'dark', 'high_contrast'),
    voice_guidance: Joi.boolean(),
    haptic_feedback: Joi.boolean(),
  }),
  settings: Joi.object({
    language: Joi.string().valid('en', 'ur', 'hi'),
    notifications: Joi.object({
      daily_reminder: Joi.boolean(),
      streak_alerts: Joi.boolean(),
      achievement_alerts: Joi.boolean(),
    }),
  }),
  privacy: Joi.object({
    show_on_leaderboard: Joi.boolean(),
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update',
});

/**
 * Middleware factory: validates req.body against a Joi schema.
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,     // collect all errors
      stripUnknown: true,    // remove fields not in schema
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: messages,
      });
    }

    req.body = value; // use the sanitized/coerced values
    next();
  };
}

module.exports = { registerSchema, updateProfileSchema, validate };
