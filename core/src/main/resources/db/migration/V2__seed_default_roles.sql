insert into roles (id, role_code, name, description, is_system, created_at, updated_at)
values
    ('4a28dc07-5579-4cee-b52f-f1df67d38d21', 'CUSTOMER', 'Customer', 'Default role for end users and personal wallets.', true, current_timestamp, current_timestamp),
    ('4f168471-fb3a-4f9e-bdb6-cb0908c0dc75', 'MERCHANT', 'Merchant', 'Role for merchants receiving payments.', true, current_timestamp, current_timestamp),
    ('3884f84d-0435-48e4-8df0-2240cf95d6e2', 'AGENT', 'Agent', 'Role for cash-in and cash-out agents.', true, current_timestamp, current_timestamp),
    ('ecf51595-d1a0-4cb8-a39b-81732f9b3597', 'ADMIN', 'Administrator', 'Platform administration role.', true, current_timestamp, current_timestamp)
on conflict (role_code) do nothing;
