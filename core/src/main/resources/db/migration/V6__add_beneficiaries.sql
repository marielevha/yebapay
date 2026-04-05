create table beneficiaries (
    id uuid primary key,
    owner_user_id uuid not null,
    beneficiary_user_id uuid,
    display_name varchar(150) not null,
    wallet_number varchar(50) not null,
    last_used_at timestamptz,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    deleted_at timestamptz,
    constraint fk_beneficiaries_owner_user
        foreign key (owner_user_id) references users (id) on delete cascade,
    constraint fk_beneficiaries_beneficiary_user
        foreign key (beneficiary_user_id) references users (id) on delete set null
);

create unique index uq_beneficiaries_owner_wallet_active
    on beneficiaries (owner_user_id, wallet_number)
    where deleted_at is null;

create index idx_beneficiaries_owner_last_used
    on beneficiaries (owner_user_id, last_used_at desc, updated_at desc);
