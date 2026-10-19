require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/business',      require('./routes/business'));
app.use('/api/menus',         require('./routes/menus'));
app.use('/api/roles',         require('./routes/roles'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/process-types', require('./routes/processTypes'));
app.use('/api/ref-numbers',   require('./routes/refNumbers'));
app.use('/api/advertisers',   require('./routes/advertisers'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/parameters',    require('./routes/parameters'));
app.use('/api/expenditure',   require('./routes/expenditure'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/brand-ambassadors', require('./routes/brandAmbassadors'));
app.use('/api/campaigns',     require('./routes/campaigns'));
app.use('/api/campaign-proofs', require('./routes/campaignProofs'));
app.use('/api/salaries',        require('./routes/salaries'));
app.use('/api/dashboard',        require('./routes/dashboard'));
app.use('/api/dashboard-config', require('./routes/dashboardConfig'));
app.use('/api/workflows',        require('./routes/workflows'));
app.use('/api/loyalty-config',   require('./routes/loyaltyConfig'));
app.use('/api/brand-ambassador-config', require('./routes/brandAmbassadorConfig'));
app.use('/api/receipts',         require('./routes/receipts'));
app.use('/api/receipt-config',   require('./routes/receiptConfig'));
app.use('/api/advertiser-portal', require('./routes/advertiserPortal'));
app.use('/api/brand-ambassador-portal', require('./routes/brandAmbassadorPortal'));
app.use('/api/reports',          require('./routes/reports'));
app.use('/api',                  require('./routes/notifications'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Accounts Master API running on port ${PORT}`));
