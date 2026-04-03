create table roles (
    id uuid primary key,
    role_code varchar(50) not null,
    name varchar(100) not null,
    description text,
    is_system boolean not null default false,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

alter table roles
    add constraint uq_roles_role_code unique (role_code);


create table permissions (
    id uuid primary key,
    permission_code varchar(100) not null,
    name varchar(150) not null,
    description text,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

alter table permissions
    add constraint uq_permissions_permission_code unique (permission_code);


create table users (
    id uuid primary key,
    public_id varchar(50) not null,
    phone_number varchar(30) not null,
    email varchar(255),
    username varchar(100),
    first_name varchar(100),
    last_name varchar(100),
    display_name varchar(150),
    password_hash varchar(255),
    pin_hash varchar(255),
    status varchar(40) not null,
    kyc_level varchar(40) not null default 'NONE',
    country_code varchar(2),
    locale varchar(10),
    phone_verified_at timestamptz,
    email_verified_at timestamptz,
    last_login_at timestamptz,
    failed_pin_attempts integer not null default 0,
    failed_password_attempts integer not null default 0,
    locked_until timestamptz,
    suspended_at timestamptz,
    suspension_reason text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    deleted_at timestamptz,
    constraint ck_users_failed_pin_attempts check (failed_pin_attempts >= 0),
    constraint ck_users_failed_password_attempts check (failed_password_attempts >= 0)
);

create unique index uq_users_public_id_active
    on users (public_id)
    where deleted_at is null;

create unique index uq_users_phone_number_active
    on users (phone_number)
    where deleted_at is null;

create unique index uq_users_email_active
    on users (lower(email))
    where email is not null and deleted_at is null;

create unique index uq_users_username_active
    on users (lower(username))
    where username is not null and deleted_at is null;

create index idx_users_status on users (status);
create index idx_users_created_at on users (created_at desc);


create table role_permissions (
    role_id uuid not null,
    permission_id uuid not null,
    created_at timestamptz not null default current_timestamp,
    primary key (role_id, permission_id),
    constraint fk_role_permissions_role
        foreign key (role_id) references roles (id) on delete cascade,
    constraint fk_role_permissions_permission
        foreign key (permission_id) references permissions (id) on delete cascade
);


create table user_roles (
    user_id uuid not null,
    role_id uuid not null,
    assigned_by_user_id uuid,
    assigned_at timestamptz not null default current_timestamp,
    primary key (user_id, role_id),
    constraint fk_user_roles_user
        foreign key (user_id) references users (id) on delete cascade,
    constraint fk_user_roles_role
        foreign key (role_id) references roles (id) on delete cascade,
    constraint fk_user_roles_assigned_by
        foreign key (assigned_by_user_id) references users (id) on delete set null
);

create index idx_user_roles_role_id on user_roles (role_id);


create table wallets (
    id uuid primary key,
    wallet_number varchar(50) not null,
    owner_type varchar(40) not null,
    owner_user_id uuid,
    wallet_type varchar(40) not null,
    name varchar(150) not null,
    status varchar(40) not null,
    currency_code varchar(3) not null,
    available_balance numeric(19,4) not null default 0,
    pending_balance numeric(19,4) not null default 0,
    ledger_balance numeric(19,4) not null default 0,
    daily_limit numeric(19,4),
    monthly_limit numeric(19,4),
    last_activity_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    deleted_at timestamptz,
    constraint ck_wallets_daily_limit check (daily_limit is null or daily_limit >= 0),
    constraint ck_wallets_monthly_limit check (monthly_limit is null or monthly_limit >= 0),
    constraint fk_wallets_owner_user
        foreign key (owner_user_id) references users (id) on delete set null
);

create unique index uq_wallets_wallet_number_active
    on wallets (wallet_number)
    where deleted_at is null;

create unique index uq_wallets_owner_type_currency_active
    on wallets (owner_type, owner_user_id, wallet_type, currency_code)
    where owner_user_id is not null and deleted_at is null;

create index idx_wallets_owner_user_id on wallets (owner_user_id);
create index idx_wallets_status on wallets (status);


create table cash_points (
    id uuid primary key,
    cash_point_code varchar(50) not null,
    name varchar(150) not null,
    description text,
    status varchar(40) not null,
    manager_user_id uuid,
    phone_number varchar(30),
    email varchar(255),
    country_code varchar(2),
    city varchar(100),
    address_line_1 varchar(255),
    address_line_2 varchar(255),
    latitude numeric(10,7),
    longitude numeric(10,7),
    supports_cash_in boolean not null default true,
    supports_cash_out boolean not null default true,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    deleted_at timestamptz,
    constraint fk_cash_points_manager_user
        foreign key (manager_user_id) references users (id) on delete set null
);

create unique index uq_cash_points_code_active
    on cash_points (cash_point_code)
    where deleted_at is null;

create index idx_cash_points_status on cash_points (status);


create table merchant_profiles (
    id uuid primary key,
    user_id uuid not null,
    merchant_code varchar(50) not null,
    business_name varchar(150) not null,
    display_name varchar(150),
    merchant_category_code varchar(50),
    business_registration_number varchar(100),
    tax_number varchar(100),
    settlement_mode varchar(40) not null default 'INSTANT',
    settlement_wallet_id uuid,
    status varchar(40) not null,
    country_code varchar(2),
    city varchar(100),
    address_line_1 varchar(255),
    address_line_2 varchar(255),
    website_url varchar(255),
    approved_by_user_id uuid,
    approved_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    deleted_at timestamptz,
    constraint fk_merchant_profiles_user
        foreign key (user_id) references users (id) on delete restrict,
    constraint fk_merchant_profiles_settlement_wallet
        foreign key (settlement_wallet_id) references wallets (id) on delete set null,
    constraint fk_merchant_profiles_approved_by
        foreign key (approved_by_user_id) references users (id) on delete set null
);

create unique index uq_merchant_profiles_user_active
    on merchant_profiles (user_id)
    where deleted_at is null;

create unique index uq_merchant_profiles_code_active
    on merchant_profiles (merchant_code)
    where deleted_at is null;

create index idx_merchant_profiles_status on merchant_profiles (status);
create index idx_merchant_profiles_category on merchant_profiles (merchant_category_code);


create table agent_profiles (
    id uuid primary key,
    user_id uuid not null,
    agent_code varchar(50) not null,
    cash_point_id uuid,
    supervisor_user_id uuid,
    settlement_wallet_id uuid,
    commission_scheme_code varchar(50),
    status varchar(40) not null,
    can_cash_in boolean not null default true,
    can_cash_out boolean not null default true,
    approved_by_user_id uuid,
    approved_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    deleted_at timestamptz,
    constraint fk_agent_profiles_user
        foreign key (user_id) references users (id) on delete restrict,
    constraint fk_agent_profiles_cash_point
        foreign key (cash_point_id) references cash_points (id) on delete set null,
    constraint fk_agent_profiles_supervisor
        foreign key (supervisor_user_id) references users (id) on delete set null,
    constraint fk_agent_profiles_settlement_wallet
        foreign key (settlement_wallet_id) references wallets (id) on delete set null,
    constraint fk_agent_profiles_approved_by
        foreign key (approved_by_user_id) references users (id) on delete set null
);

create unique index uq_agent_profiles_user_active
    on agent_profiles (user_id)
    where deleted_at is null;

create unique index uq_agent_profiles_code_active
    on agent_profiles (agent_code)
    where deleted_at is null;

create index idx_agent_profiles_status on agent_profiles (status);
create index idx_agent_profiles_cash_point_id on agent_profiles (cash_point_id);


create table kyc_records (
    id uuid primary key,
    user_id uuid not null,
    kyc_level varchar(40) not null,
    status varchar(40) not null,
    document_type varchar(50),
    document_number varchar(100),
    issuing_country_code varchar(2),
    submitted_at timestamptz,
    reviewed_at timestamptz,
    reviewed_by_user_id uuid,
    rejection_reason text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint fk_kyc_records_user
        foreign key (user_id) references users (id) on delete restrict,
    constraint fk_kyc_records_reviewed_by
        foreign key (reviewed_by_user_id) references users (id) on delete set null
);

create index idx_kyc_records_user_id on kyc_records (user_id);
create index idx_kyc_records_status on kyc_records (status);


create table fee_rules (
    id uuid primary key,
    rule_code varchar(50) not null,
    name varchar(150) not null,
    description text,
    operation_type varchar(50) not null,
    initiator_profile_type varchar(50),
    beneficiary_profile_type varchar(50),
    merchant_category_code varchar(50),
    supported_by varchar(50) not null,
    priority integer not null default 100,
    status varchar(40) not null,
    is_promotional boolean not null default false,
    created_by_user_id uuid,
    updated_by_user_id uuid,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    deleted_at timestamptz,
    constraint ck_fee_rules_priority check (priority >= 0),
    constraint fk_fee_rules_created_by
        foreign key (created_by_user_id) references users (id) on delete set null,
    constraint fk_fee_rules_updated_by
        foreign key (updated_by_user_id) references users (id) on delete set null
);

create unique index uq_fee_rules_rule_code_active
    on fee_rules (rule_code)
    where deleted_at is null;

create index idx_fee_rules_operation_type on fee_rules (operation_type);
create index idx_fee_rules_status on fee_rules (status);


create table fee_rule_versions (
    id uuid primary key,
    fee_rule_id uuid not null,
    version_number integer not null,
    status varchar(40) not null,
    calculation_mode varchar(40) not null,
    currency_code varchar(3) not null,
    min_transaction_amount numeric(19,4),
    max_transaction_amount numeric(19,4),
    fixed_amount numeric(19,4),
    percentage_rate numeric(7,4),
    minimum_fee_amount numeric(19,4),
    maximum_fee_amount numeric(19,4),
    fee_cap_amount numeric(19,4),
    valid_from timestamptz not null,
    valid_to timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint ck_fee_rule_versions_version_number check (version_number > 0),
    constraint ck_fee_rule_versions_min_transaction_amount
        check (min_transaction_amount is null or min_transaction_amount >= 0),
    constraint ck_fee_rule_versions_max_transaction_amount
        check (max_transaction_amount is null or max_transaction_amount >= 0),
    constraint ck_fee_rule_versions_fixed_amount
        check (fixed_amount is null or fixed_amount >= 0),
    constraint ck_fee_rule_versions_percentage_rate
        check (percentage_rate is null or percentage_rate >= 0),
    constraint ck_fee_rule_versions_minimum_fee_amount
        check (minimum_fee_amount is null or minimum_fee_amount >= 0),
    constraint ck_fee_rule_versions_maximum_fee_amount
        check (maximum_fee_amount is null or maximum_fee_amount >= 0),
    constraint ck_fee_rule_versions_fee_cap_amount
        check (fee_cap_amount is null or fee_cap_amount >= 0),
    constraint ck_fee_rule_versions_validity_window
        check (valid_to is null or valid_to > valid_from),
    constraint fk_fee_rule_versions_rule
        foreign key (fee_rule_id) references fee_rules (id) on delete cascade
);

alter table fee_rule_versions
    add constraint uq_fee_rule_versions_rule_version unique (fee_rule_id, version_number);

create index idx_fee_rule_versions_status_validity
    on fee_rule_versions (status, valid_from, valid_to);

create index idx_fee_rule_versions_fee_rule_id
    on fee_rule_versions (fee_rule_id);


create table money_requests (
    id uuid primary key,
    request_ref varchar(50) not null,
    requester_user_id uuid not null,
    payer_user_id uuid,
    target_wallet_id uuid,
    status varchar(40) not null,
    amount numeric(19,4),
    currency_code varchar(3),
    reason text,
    expires_at timestamptz,
    accepted_at timestamptz,
    declined_at timestamptz,
    cancelled_at timestamptz,
    paid_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint ck_money_requests_amount check (amount is null or amount > 0),
    constraint fk_money_requests_requester
        foreign key (requester_user_id) references users (id) on delete restrict,
    constraint fk_money_requests_payer
        foreign key (payer_user_id) references users (id) on delete set null,
    constraint fk_money_requests_target_wallet
        foreign key (target_wallet_id) references wallets (id) on delete set null
);

alter table money_requests
    add constraint uq_money_requests_request_ref unique (request_ref);

create index idx_money_requests_requester_status
    on money_requests (requester_user_id, status);

create index idx_money_requests_expires_at on money_requests (expires_at);


create table settlement_batches (
    id uuid primary key,
    batch_ref varchar(50) not null,
    batch_type varchar(50) not null,
    actor_type varchar(50) not null,
    merchant_profile_id uuid,
    agent_profile_id uuid,
    currency_code varchar(3) not null,
    gross_amount numeric(19,4) not null default 0,
    fee_amount numeric(19,4) not null default 0,
    net_amount numeric(19,4) not null default 0,
    status varchar(40) not null,
    period_start timestamptz not null,
    period_end timestamptz not null,
    initiated_at timestamptz,
    processed_at timestamptz,
    completed_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint ck_settlement_batches_period_window check (period_end >= period_start),
    constraint fk_settlement_batches_merchant
        foreign key (merchant_profile_id) references merchant_profiles (id) on delete set null,
    constraint fk_settlement_batches_agent
        foreign key (agent_profile_id) references agent_profiles (id) on delete set null,
    constraint ck_settlement_batches_gross_amount check (gross_amount >= 0),
    constraint ck_settlement_batches_fee_amount check (fee_amount >= 0),
    constraint ck_settlement_batches_net_amount check (net_amount >= 0)
);

alter table settlement_batches
    add constraint uq_settlement_batches_batch_ref unique (batch_ref);

create index idx_settlement_batches_status on settlement_batches (status);
create index idx_settlement_batches_period on settlement_batches (period_start, period_end);


create table qr_tokens (
    id uuid primary key,
    qr_ref varchar(50) not null,
    qr_type varchar(50) not null,
    issuer_type varchar(50) not null,
    issuer_user_id uuid,
    beneficiary_user_id uuid,
    target_wallet_id uuid,
    money_request_id uuid,
    payload jsonb not null default '{}'::jsonb,
    signed_payload text,
    amount numeric(19,4),
    currency_code varchar(3),
    nonce varchar(100) not null,
    signature varchar(512),
    single_use boolean not null default true,
    scan_limit integer not null default 1,
    usage_count integer not null default 0,
    status varchar(40) not null,
    issued_at timestamptz not null default current_timestamp,
    expires_at timestamptz,
    first_scanned_at timestamptz,
    last_scanned_at timestamptz,
    used_at timestamptz,
    invalidated_at timestamptz,
    invalidation_reason text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint fk_qr_tokens_issuer_user
        foreign key (issuer_user_id) references users (id) on delete set null,
    constraint fk_qr_tokens_beneficiary_user
        foreign key (beneficiary_user_id) references users (id) on delete set null,
    constraint fk_qr_tokens_target_wallet
        foreign key (target_wallet_id) references wallets (id) on delete set null,
    constraint fk_qr_tokens_money_request
        foreign key (money_request_id) references money_requests (id) on delete set null,
    constraint ck_qr_tokens_amount check (amount is null or amount > 0),
    constraint ck_qr_tokens_scan_limit check (scan_limit > 0),
    constraint ck_qr_tokens_usage_count check (usage_count >= 0)
);

alter table qr_tokens
    add constraint uq_qr_tokens_qr_ref unique (qr_ref);

create unique index uq_qr_tokens_nonce on qr_tokens (nonce);
create index idx_qr_tokens_status_expires_at on qr_tokens (status, expires_at);
create index idx_qr_tokens_qr_type on qr_tokens (qr_type);


create table ledger_accounts (
    id uuid primary key,
    account_code varchar(60) not null,
    account_name varchar(150) not null,
    account_type varchar(40) not null,
    account_purpose varchar(50) not null,
    owner_type varchar(40) not null,
    owner_user_id uuid,
    wallet_id uuid,
    currency_code varchar(3) not null,
    status varchar(40) not null,
    allow_negative_balance boolean not null default false,
    current_balance numeric(19,4) not null default 0,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint fk_ledger_accounts_owner_user
        foreign key (owner_user_id) references users (id) on delete set null,
    constraint fk_ledger_accounts_wallet
        foreign key (wallet_id) references wallets (id) on delete set null
);

alter table ledger_accounts
    add constraint uq_ledger_accounts_account_code unique (account_code);

create unique index uq_ledger_accounts_wallet_purpose
    on ledger_accounts (wallet_id, account_purpose)
    where wallet_id is not null;

create index idx_ledger_accounts_owner_user_id on ledger_accounts (owner_user_id);
create index idx_ledger_accounts_status on ledger_accounts (status);


create table transactions (
    id uuid primary key,
    transaction_ref varchar(50) not null,
    transaction_type varchar(50) not null,
    channel varchar(40) not null,
    status varchar(40) not null,
    source_wallet_id uuid,
    destination_wallet_id uuid,
    initiator_user_id uuid,
    payer_user_id uuid,
    payee_user_id uuid,
    merchant_profile_id uuid,
    agent_profile_id uuid,
    qr_token_id uuid,
    money_request_id uuid,
    settlement_batch_id uuid,
    parent_transaction_id uuid,
    external_reference varchar(100),
    idempotency_key varchar(100),
    amount numeric(19,4) not null,
    fee_amount numeric(19,4) not null default 0,
    net_amount numeric(19,4) not null default 0,
    currency_code varchar(3) not null,
    fee_bearer varchar(50),
    description text,
    failure_code varchar(100),
    failure_message text,
    initiated_at timestamptz not null default current_timestamp,
    confirmed_at timestamptz,
    completed_at timestamptz,
    failed_at timestamptz,
    cancelled_at timestamptz,
    expires_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint fk_transactions_source_wallet
        foreign key (source_wallet_id) references wallets (id) on delete restrict,
    constraint fk_transactions_destination_wallet
        foreign key (destination_wallet_id) references wallets (id) on delete restrict,
    constraint fk_transactions_initiator
        foreign key (initiator_user_id) references users (id) on delete set null,
    constraint fk_transactions_payer
        foreign key (payer_user_id) references users (id) on delete set null,
    constraint fk_transactions_payee
        foreign key (payee_user_id) references users (id) on delete set null,
    constraint fk_transactions_merchant_profile
        foreign key (merchant_profile_id) references merchant_profiles (id) on delete set null,
    constraint fk_transactions_agent_profile
        foreign key (agent_profile_id) references agent_profiles (id) on delete set null,
    constraint fk_transactions_qr_token
        foreign key (qr_token_id) references qr_tokens (id) on delete set null,
    constraint fk_transactions_money_request
        foreign key (money_request_id) references money_requests (id) on delete set null,
    constraint fk_transactions_settlement_batch
        foreign key (settlement_batch_id) references settlement_batches (id) on delete set null,
    constraint fk_transactions_parent_transaction
        foreign key (parent_transaction_id) references transactions (id) on delete set null,
    constraint ck_transactions_amount check (amount > 0),
    constraint ck_transactions_fee_amount check (fee_amount >= 0),
    constraint ck_transactions_net_amount check (net_amount >= 0)
);

alter table transactions
    add constraint uq_transactions_transaction_ref unique (transaction_ref);

create unique index uq_transactions_external_reference
    on transactions (external_reference)
    where external_reference is not null;

create unique index uq_transactions_idempotency_key
    on transactions (idempotency_key)
    where idempotency_key is not null;

create index idx_transactions_status_initiated_at
    on transactions (status, initiated_at desc);

create index idx_transactions_type_initiated_at
    on transactions (transaction_type, initiated_at desc);

create index idx_transactions_source_wallet_id
    on transactions (source_wallet_id, initiated_at desc);

create index idx_transactions_destination_wallet_id
    on transactions (destination_wallet_id, initiated_at desc);

create index idx_transactions_payer_user_id
    on transactions (payer_user_id, initiated_at desc);

create index idx_transactions_payee_user_id
    on transactions (payee_user_id, initiated_at desc);

create index idx_transactions_money_request_id
    on transactions (money_request_id);

create index idx_transactions_qr_token_id
    on transactions (qr_token_id);


create table transaction_fees (
    id uuid primary key,
    transaction_id uuid not null,
    fee_rule_version_id uuid,
    recipient_ledger_account_id uuid,
    fee_code varchar(50) not null,
    fee_label varchar(150),
    fee_type varchar(40) not null,
    calculation_mode varchar(40) not null,
    supported_by varchar(50) not null,
    amount numeric(19,4) not null,
    currency_code varchar(3) not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint fk_transaction_fees_transaction
        foreign key (transaction_id) references transactions (id) on delete cascade,
    constraint fk_transaction_fees_fee_rule_version
        foreign key (fee_rule_version_id) references fee_rule_versions (id) on delete set null,
    constraint fk_transaction_fees_recipient_ledger_account
        foreign key (recipient_ledger_account_id) references ledger_accounts (id) on delete set null,
    constraint ck_transaction_fees_amount check (amount >= 0)
);

create index idx_transaction_fees_transaction_id
    on transaction_fees (transaction_id);


create table transaction_status_history (
    id uuid primary key,
    transaction_id uuid not null,
    from_status varchar(40),
    to_status varchar(40) not null,
    changed_by_user_id uuid,
    change_reason_code varchar(100),
    change_reason text,
    metadata jsonb not null default '{}'::jsonb,
    changed_at timestamptz not null default current_timestamp,
    constraint fk_transaction_status_history_transaction
        foreign key (transaction_id) references transactions (id) on delete cascade,
    constraint fk_transaction_status_history_changed_by
        foreign key (changed_by_user_id) references users (id) on delete set null
);

create index idx_transaction_status_history_transaction_changed_at
    on transaction_status_history (transaction_id, changed_at desc);


create table ledger_entries (
    id uuid primary key,
    transaction_id uuid not null,
    ledger_account_id uuid not null,
    entry_ref varchar(60) not null,
    entry_direction varchar(10) not null,
    amount numeric(19,4) not null,
    currency_code varchar(3) not null,
    sequence_number integer not null,
    description text,
    value_date date,
    posted_at timestamptz not null default current_timestamp,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    constraint fk_ledger_entries_transaction
        foreign key (transaction_id) references transactions (id) on delete restrict,
    constraint fk_ledger_entries_account
        foreign key (ledger_account_id) references ledger_accounts (id) on delete restrict,
    constraint ck_ledger_entries_amount check (amount > 0),
    constraint ck_ledger_entries_sequence_number check (sequence_number > 0)
);

alter table ledger_entries
    add constraint uq_ledger_entries_entry_ref unique (entry_ref);

alter table ledger_entries
    add constraint uq_ledger_entries_transaction_sequence unique (transaction_id, sequence_number);

create index idx_ledger_entries_account_posted_at
    on ledger_entries (ledger_account_id, posted_at desc);

create index idx_ledger_entries_transaction_id
    on ledger_entries (transaction_id);


create table wallet_balance_snapshots (
    id uuid primary key,
    wallet_id uuid not null,
    snapshot_type varchar(40) not null,
    available_balance numeric(19,4) not null,
    pending_balance numeric(19,4) not null,
    ledger_balance numeric(19,4) not null,
    currency_code varchar(3) not null,
    taken_at timestamptz not null default current_timestamp,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    constraint fk_wallet_balance_snapshots_wallet
        foreign key (wallet_id) references wallets (id) on delete cascade
);

create index idx_wallet_balance_snapshots_wallet_taken_at
    on wallet_balance_snapshots (wallet_id, taken_at desc);


create table notifications (
    id uuid primary key,
    recipient_user_id uuid not null,
    notification_type varchar(50) not null,
    channel varchar(30) not null,
    status varchar(40) not null,
    title varchar(150),
    body text,
    reference_type varchar(50),
    reference_id uuid,
    transaction_id uuid,
    external_message_id varchar(100),
    sent_at timestamptz,
    read_at timestamptz,
    failed_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint fk_notifications_recipient_user
        foreign key (recipient_user_id) references users (id) on delete restrict,
    constraint fk_notifications_transaction
        foreign key (transaction_id) references transactions (id) on delete set null
);

create index idx_notifications_recipient_status_created_at
    on notifications (recipient_user_id, status, created_at desc);


create table disputes (
    id uuid primary key,
    dispute_ref varchar(50) not null,
    transaction_id uuid not null,
    complainant_user_id uuid not null,
    assigned_admin_user_id uuid,
    category varchar(50) not null,
    status varchar(40) not null,
    description text,
    resolution_notes text,
    opened_at timestamptz not null default current_timestamp,
    resolved_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint fk_disputes_transaction
        foreign key (transaction_id) references transactions (id) on delete restrict,
    constraint fk_disputes_complainant_user
        foreign key (complainant_user_id) references users (id) on delete restrict,
    constraint fk_disputes_assigned_admin_user
        foreign key (assigned_admin_user_id) references users (id) on delete set null
);

alter table disputes
    add constraint uq_disputes_dispute_ref unique (dispute_ref);

create index idx_disputes_status_opened_at
    on disputes (status, opened_at desc);


create table refund_requests (
    id uuid primary key,
    refund_ref varchar(50) not null,
    dispute_id uuid,
    transaction_id uuid not null,
    requester_user_id uuid not null,
    approver_user_id uuid,
    status varchar(40) not null,
    amount numeric(19,4) not null,
    currency_code varchar(3) not null,
    reason text,
    requested_at timestamptz not null default current_timestamp,
    approved_at timestamptz,
    rejected_at timestamptz,
    processed_at timestamptz,
    notes text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    constraint fk_refund_requests_dispute
        foreign key (dispute_id) references disputes (id) on delete set null,
    constraint fk_refund_requests_transaction
        foreign key (transaction_id) references transactions (id) on delete restrict,
    constraint fk_refund_requests_requester
        foreign key (requester_user_id) references users (id) on delete restrict,
    constraint fk_refund_requests_approver
        foreign key (approver_user_id) references users (id) on delete set null,
    constraint ck_refund_requests_amount check (amount > 0)
);

alter table refund_requests
    add constraint uq_refund_requests_refund_ref unique (refund_ref);

create index idx_refund_requests_status_requested_at
    on refund_requests (status, requested_at desc);


create table audit_logs (
    id uuid primary key,
    actor_user_id uuid,
    actor_role_code varchar(50),
    transaction_id uuid,
    action varchar(100) not null,
    entity_type varchar(50) not null,
    entity_id uuid,
    result_status varchar(30) not null,
    request_id varchar(100),
    correlation_id varchar(100),
    ip_address varchar(64),
    user_agent text,
    http_method varchar(10),
    resource_path varchar(255),
    details jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default current_timestamp,
    constraint fk_audit_logs_actor_user
        foreign key (actor_user_id) references users (id) on delete set null,
    constraint fk_audit_logs_transaction
        foreign key (transaction_id) references transactions (id) on delete set null
);

create index idx_audit_logs_actor_user_created_at
    on audit_logs (actor_user_id, created_at desc);

create index idx_audit_logs_entity_lookup
    on audit_logs (entity_type, entity_id, created_at desc);

create index idx_audit_logs_request_id
    on audit_logs (request_id);
