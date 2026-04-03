update wallets
set daily_limit = 1000000
where daily_limit is null;

update wallets
set monthly_limit = 10000000
where monthly_limit is null;

insert into ledger_accounts (
    id,
    account_code,
    account_name,
    account_type,
    account_purpose,
    owner_type,
    currency_code,
    status,
    allow_negative_balance,
    current_balance,
    metadata,
    created_at,
    updated_at
)
select
    '9f96cf18-ea72-4f88-937c-e741dcd10cd5',
    'SYS-FEE-REV-XAF',
    'Platform Fee Revenue XAF',
    'REVENUE',
    'PLATFORM_FEE_REVENUE',
    'SYSTEM',
    'XAF',
    'ACTIVE',
    false,
    0,
    '{}'::jsonb,
    current_timestamp,
    current_timestamp
where not exists (
    select 1
    from ledger_accounts
    where account_code = 'SYS-FEE-REV-XAF'
);

insert into ledger_accounts (
    id,
    account_code,
    account_name,
    account_type,
    account_purpose,
    owner_type,
    currency_code,
    status,
    allow_negative_balance,
    current_balance,
    metadata,
    created_at,
    updated_at
)
select
    '5a5f8adc-1f38-43c8-b976-33cce23087f9',
    'SYS-CASH-IN-CLEARING-XAF',
    'Platform Cash-In Clearing XAF',
    'ASSET',
    'PLATFORM_CASH_IN_CLEARING',
    'SYSTEM',
    'XAF',
    'ACTIVE',
    false,
    0,
    '{}'::jsonb,
    current_timestamp,
    current_timestamp
where not exists (
    select 1
    from ledger_accounts
    where account_code = 'SYS-CASH-IN-CLEARING-XAF'
);

insert into fee_rules (
    id,
    rule_code,
    name,
    description,
    operation_type,
    initiator_profile_type,
    beneficiary_profile_type,
    supported_by,
    priority,
    status,
    is_promotional,
    created_at,
    updated_at
)
select
    '8cfaaad3-67c6-49dd-b97b-6dabf928e8ca',
    'P2P_TRANSFER_DEFAULT',
    'Default P2P transfer fee',
    'Flat default fee for customer to customer transfer.',
    'P2P_TRANSFER',
    'CUSTOMER',
    'CUSTOMER',
    'PAYER',
    10,
    'ACTIVE',
    false,
    current_timestamp,
    current_timestamp
where not exists (
    select 1
    from fee_rules
    where rule_code = 'P2P_TRANSFER_DEFAULT'
      and deleted_at is null
);

insert into fee_rule_versions (
    id,
    fee_rule_id,
    version_number,
    status,
    calculation_mode,
    currency_code,
    fixed_amount,
    minimum_fee_amount,
    maximum_fee_amount,
    valid_from,
    metadata,
    created_at,
    updated_at
)
select
    '1fa1c299-5053-4d98-8ee6-0a5d5ceb33cf',
    '8cfaaad3-67c6-49dd-b97b-6dabf928e8ca',
    1,
    'ACTIVE',
    'FIXED',
    'XAF',
    5,
    5,
    5,
    current_timestamp,
    '{}'::jsonb,
    current_timestamp,
    current_timestamp
where not exists (
    select 1
    from fee_rule_versions
    where fee_rule_id = '8cfaaad3-67c6-49dd-b97b-6dabf928e8ca'
      and version_number = 1
);

insert into fee_rules (
    id,
    rule_code,
    name,
    description,
    operation_type,
    initiator_profile_type,
    beneficiary_profile_type,
    supported_by,
    priority,
    status,
    is_promotional,
    created_at,
    updated_at
)
select
    '36bb2486-441a-4ba7-b9fd-d02d1fc928fd',
    'MERCHANT_PAYMENT_DEFAULT',
    'Default merchant payment fee',
    'Flat default fee supported by merchant.',
    'MERCHANT_PAYMENT',
    'CUSTOMER',
    'MERCHANT',
    'MERCHANT',
    10,
    'ACTIVE',
    false,
    current_timestamp,
    current_timestamp
where not exists (
    select 1
    from fee_rules
    where rule_code = 'MERCHANT_PAYMENT_DEFAULT'
      and deleted_at is null
);

insert into fee_rule_versions (
    id,
    fee_rule_id,
    version_number,
    status,
    calculation_mode,
    currency_code,
    fixed_amount,
    minimum_fee_amount,
    maximum_fee_amount,
    valid_from,
    metadata,
    created_at,
    updated_at
)
select
    'f44bf0a4-1e97-43f2-bc0f-0f9040d57e52',
    '36bb2486-441a-4ba7-b9fd-d02d1fc928fd',
    1,
    'ACTIVE',
    'FIXED',
    'XAF',
    2,
    2,
    2,
    current_timestamp,
    '{}'::jsonb,
    current_timestamp,
    current_timestamp
where not exists (
    select 1
    from fee_rule_versions
    where fee_rule_id = '36bb2486-441a-4ba7-b9fd-d02d1fc928fd'
      and version_number = 1
);

insert into fee_rules (
    id,
    rule_code,
    name,
    description,
    operation_type,
    initiator_profile_type,
    beneficiary_profile_type,
    supported_by,
    priority,
    status,
    is_promotional,
    created_at,
    updated_at
)
select
    '68ba8f62-bdb9-4e2d-baf7-f1e34686a5d7',
    'MONEY_REQUEST_DEFAULT',
    'Default money request payment fee',
    'Flat default fee when settling a money request.',
    'MONEY_REQUEST',
    'CUSTOMER',
    'CUSTOMER',
    'PAYER',
    10,
    'ACTIVE',
    false,
    current_timestamp,
    current_timestamp
where not exists (
    select 1
    from fee_rules
    where rule_code = 'MONEY_REQUEST_DEFAULT'
      and deleted_at is null
);

insert into fee_rule_versions (
    id,
    fee_rule_id,
    version_number,
    status,
    calculation_mode,
    currency_code,
    fixed_amount,
    minimum_fee_amount,
    maximum_fee_amount,
    valid_from,
    metadata,
    created_at,
    updated_at
)
select
    '4c8f5a72-cd15-4cf9-befa-c535fc3a9766',
    '68ba8f62-bdb9-4e2d-baf7-f1e34686a5d7',
    1,
    'ACTIVE',
    'FIXED',
    'XAF',
    5,
    5,
    5,
    current_timestamp,
    '{}'::jsonb,
    current_timestamp,
    current_timestamp
where not exists (
    select 1
    from fee_rule_versions
    where fee_rule_id = '68ba8f62-bdb9-4e2d-baf7-f1e34686a5d7'
      and version_number = 1
);

insert into fee_rules (
    id,
    rule_code,
    name,
    description,
    operation_type,
    initiator_profile_type,
    supported_by,
    priority,
    status,
    is_promotional,
    created_at,
    updated_at
)
select
    '0cf3d750-8752-4053-849a-2b2a9a5db8f7',
    'CASH_IN_DEFAULT',
    'Default cash-in fee',
    'Cash-in is free for the wallet owner in the MVP.',
    'CASH_IN',
    'CUSTOMER',
    'PLATFORM',
    10,
    'ACTIVE',
    false,
    current_timestamp,
    current_timestamp
where not exists (
    select 1
    from fee_rules
    where rule_code = 'CASH_IN_DEFAULT'
      and deleted_at is null
);

insert into fee_rule_versions (
    id,
    fee_rule_id,
    version_number,
    status,
    calculation_mode,
    currency_code,
    fixed_amount,
    minimum_fee_amount,
    maximum_fee_amount,
    valid_from,
    metadata,
    created_at,
    updated_at
)
select
    'e650e0cb-4d89-4600-8d71-74abeb392c28',
    '0cf3d750-8752-4053-849a-2b2a9a5db8f7',
    1,
    'ACTIVE',
    'FIXED',
    'XAF',
    0,
    0,
    0,
    current_timestamp,
    '{}'::jsonb,
    current_timestamp,
    current_timestamp
where not exists (
    select 1
    from fee_rule_versions
    where fee_rule_id = '0cf3d750-8752-4053-849a-2b2a9a5db8f7'
      and version_number = 1
);
