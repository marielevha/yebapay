create table auth_refresh_tokens (
    id uuid primary key,
    user_id uuid not null,
    token_family_id uuid not null,
    token_hash varchar(128) not null,
    status varchar(40) not null,
    expires_at timestamptz not null,
    used_at timestamptz,
    last_used_at timestamptz,
    revoked_at timestamptz,
    revoke_reason varchar(255),
    parent_token_id uuid,
    replaced_by_token_id uuid,
    issued_ip varchar(64),
    issued_user_agent varchar(500),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint fk_auth_refresh_tokens_user
        foreign key (user_id) references users (id) on delete cascade,
    constraint fk_auth_refresh_tokens_parent
        foreign key (parent_token_id) references auth_refresh_tokens (id) on delete set null,
    constraint fk_auth_refresh_tokens_replaced_by
        foreign key (replaced_by_token_id) references auth_refresh_tokens (id) on delete set null
);

create unique index uq_auth_refresh_tokens_token_hash
    on auth_refresh_tokens (token_hash);

create index idx_auth_refresh_tokens_user_status_expires_at
    on auth_refresh_tokens (user_id, status, expires_at desc);

create index idx_auth_refresh_tokens_family_status
    on auth_refresh_tokens (token_family_id, status);


create table auth_otp_challenges (
    id uuid primary key,
    user_id uuid not null,
    purpose varchar(50) not null,
    channel varchar(20) not null,
    delivery_target varchar(100) not null,
    code_hash varchar(255) not null,
    status varchar(40) not null,
    expires_at timestamptz not null,
    verified_at timestamptz,
    cancelled_at timestamptz,
    last_sent_at timestamptz not null default current_timestamp,
    send_count integer not null default 1,
    failed_attempts integer not null default 0,
    max_attempts integer not null default 5,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint ck_auth_otp_challenges_send_count check (send_count > 0),
    constraint ck_auth_otp_challenges_failed_attempts check (failed_attempts >= 0),
    constraint ck_auth_otp_challenges_max_attempts check (max_attempts > 0),
    constraint fk_auth_otp_challenges_user
        foreign key (user_id) references users (id) on delete cascade
);

create index idx_auth_otp_challenges_user_purpose_status_expires_at
    on auth_otp_challenges (user_id, purpose, status, expires_at desc);

create index idx_auth_otp_challenges_delivery_target_purpose_created_at
    on auth_otp_challenges (delivery_target, purpose, created_at desc);


create table auth_password_reset_sessions (
    id uuid primary key,
    user_id uuid not null,
    otp_challenge_id uuid not null,
    token_hash varchar(128) not null,
    status varchar(40) not null,
    expires_at timestamptz not null,
    consumed_at timestamptz,
    revoked_at timestamptz,
    revoke_reason varchar(255),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint fk_auth_password_reset_sessions_user
        foreign key (user_id) references users (id) on delete cascade,
    constraint fk_auth_password_reset_sessions_otp_challenge
        foreign key (otp_challenge_id) references auth_otp_challenges (id) on delete cascade
);

create unique index uq_auth_password_reset_sessions_token_hash
    on auth_password_reset_sessions (token_hash);

create index idx_auth_password_reset_sessions_user_status_expires_at
    on auth_password_reset_sessions (user_id, status, expires_at desc);
