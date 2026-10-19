/* Deposit vs Withdraw are told apart by the Transaction Types parameter
   value name (parameter text_id 'transaction-types'), so renaming the
   values keeps working as long as they still start with "Deposit" /
   "Withdraw" (e.g. "Withdrawal"). `typeAlias` is the alias of the joined
   parameter_values row; `amountCol` the amount column. */
const depositSum = (typeAlias = 'tt', amountCol = 't.amount') =>
  `COALESCE(SUM(CASE WHEN ${typeAlias}.paramater_value LIKE 'deposit%' THEN ${amountCol} END), 0)`;

const withdrawalSum = (typeAlias = 'tt', amountCol = 't.amount') =>
  `COALESCE(SUM(CASE WHEN ${typeAlias}.paramater_value LIKE 'withdraw%' THEN ${amountCol} END), 0)`;

module.exports = { depositSum, withdrawalSum };
