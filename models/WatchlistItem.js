const mongoose = require('mongoose');
const {
  WATCH_STATUSES,
  POSTER_SOURCES,
  RATING_MIN,
  RATING_MAX,
  NOTES_MAX_LENGTH,
} = require('../constants/watchlist');

const watchlistItemSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: [true, 'tmdbId is required'],
      unique: true,
      min: [1, 'tmdbId must be a positive integer'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: 300,
    },
    overview: { type: String, default: '' },
    releaseDate: { type: Date, default: null },
    genres: { type: [{ type: String, trim: true }], default: [] },

    // The poster currently shown: a TMDB image URL or a local path like /uploads/abc.jpg
    posterUrl: { type: String, default: null },
    posterSource: {
      type: String,
      enum: { values: POSTER_SOURCES, message: 'posterSource must be one of: tmdb, custom' },
      default: 'tmdb',
    },
    // Original TMDB poster, kept so a custom poster can be reverted.
    tmdbPosterUrl: { type: String, default: null },

    status: {
      type: String,
      enum: {
        values: WATCH_STATUSES,
        message: `status must be one of: ${WATCH_STATUSES.join(', ')}`,
      },
      default: 'to_watch',
    },
    rating: {
      type: Number,
      min: [RATING_MIN, `rating must be between ${RATING_MIN} and ${RATING_MAX}`],
      max: [RATING_MAX, `rating must be between ${RATING_MIN} and ${RATING_MAX}`],
      validate: {
        validator: (value) => value == null || Number.isInteger(value),
        message: 'rating must be a whole number',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [NOTES_MAX_LENGTH, `notes cannot exceed ${NOTES_MAX_LENGTH} characters`],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  },
);

// Business rule enforced at the data layer as a last line of defence.
watchlistItemSchema.pre('validate', function enforceRatingRule(next) {
  if (this.status !== 'done' && this.rating != null) {
    this.invalidate('rating', 'rating is only allowed when status is "done"');
  }
  next();
});

watchlistItemSchema.index({ status: 1, createdAt: -1 });
watchlistItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);
