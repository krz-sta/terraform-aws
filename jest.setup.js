process.env.AWS_REGION ??= "eu-central-1";
process.env.ACTIVE_SESSIONS_TABLE_NAME ??= "workout-stats-api-active-sessions";
process.env.SESSION_HISTORY_TABLE_NAME ??= "workout-stats-api-session-history";
process.env.USER_STATS_TABLE_NAME ??= "workout-stats-api-user-stats";
process.env.WORKOUTS_ARCHIVE_BUCKET_NAME ??=
    "workout-stats-api-workouts-archive4df7ba6ff1d1aec09b015b1cf2";
process.env.DELETE_DATA_STATE_MACHINE_ARN ??=
    "arn:aws:states:eu-central-1:123456789012:stateMachine:delete-data-placeholder";
