update wallets
set currency_code = 'XAF'
where currency_code = 'CDF';

update ledger_accounts
set currency_code = 'XAF'
where currency_code = 'CDF';

update ledger_entries
set currency_code = 'XAF'
where currency_code = 'CDF';

update fee_rule_versions
set currency_code = 'XAF'
where currency_code = 'CDF';

update qr_tokens
set currency_code = 'XAF'
where currency_code = 'CDF';

update money_requests
set currency_code = 'XAF'
where currency_code = 'CDF';

update transactions
set currency_code = 'XAF'
where currency_code = 'CDF';

update transaction_fees
set currency_code = 'XAF'
where currency_code = 'CDF';

update wallet_balance_snapshots
set currency_code = 'XAF'
where currency_code = 'CDF';

update refund_requests
set currency_code = 'XAF'
where currency_code = 'CDF';

update settlement_batches
set currency_code = 'XAF'
where currency_code = 'CDF';
