 Ubuntu Server Deployment
Prerequisites (run on Ubuntu)

# Update packages

sudo apt update && sudo apt upgrade -y

# Install Node.js 20+

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL

sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PM2 (process manager)

sudo npm install -g pm2


# STEP 1 — BUILD THE FRONTEND (ON YOUR WINDOWS MACHINE)

cd c:\xampp\htdocs\projects\accountsmaster\client
npm install
npm run build
This creates client/dist/ — that's what you'll copy to the server.


# STEP 2 — COPY FILES TO THE SERVER
Copy these two things (via SCP, SFTP, or USB):

What From (Windows) To (Ubuntu)
Built frontend client/dist/ /var/www/accountsmaster/

scp -r "C:\xampp\htdocs\projects\accountsmaster\client\dist\*" root@31.97.199.20:/var/www/html/accountsmaster/


scp -r "C:\xampp\htdocs\projects\accountsmaster\portal\dist\*" root@31.97.199.20:/var/www/html/accountsmasterportal/

Backend server/ (excluding node_modules) /opt/accountsmaster/server/
scp -r "C:\xampp\htdocs\projects\accountsmaster\server\deploy" root@31.97.199.20:/opt/accountsmaster/server/

# On Ubuntu, create the directories first

sudo mkdir -p /var/www/accountsmaster
sudo mkdir -p /opt/accountsmaster/server

# STEP 3 — SET UP MYSQL

sudo mysql -u root -p

# Inside MySQL:

CREATE DATABASE accountsmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'accountsmaster'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON accountsmaster.* TO 'accountsmaster'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema

mysql -u salesmaster -p accountsmaster < /opt/accountsmaster/server/database/schema.sql

# Run migrations


# STEP 4 — CONFIGURE THE BACKEND .ENV

sudo nano /opt/accountsmaster/server/.env

PORT=8000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=accountsmaster
DB_PASSWORD=YourStrongPassword123
DB_NAME=accountsmaster

JWT_SECRET=replace_with_long_random_string_here
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=replace_with_another_long_random_string
JWT_REFRESH_EXPIRES_IN=7d

UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880


# STEP 5 — INSTALL BACKEND DEPENDENCIES & START WITH PM2

cd /opt/accountsmaster/server
npm install --omit=dev

# Create uploads folder

mkdir -p uploads

# Start with PM2

pm2 start src/server.js --name venturebrte

# Auto-start on reboot

pm2 save
pm2 startup

# Run the command that pm2 prints

APACHE

# STEP 1 — ENABLE REQUIRED APACHE MODULES

    sudo a2enmod proxy proxy_http rewrite
    sudo systemctl restart apache2
    
# STEP 2 — CREATE THE VIRTUAL HOST CONFIG

    sudo nano /etc/apache2/sites-available/salesmaster.conf
    Paste this (replace YOUR_SERVER_IP_OR_DOMAIN):


    <VirtualHost *:80>
        ServerName YOUR_SERVER_IP_OR_DOMAIN

        # Serve built React frontend
        DocumentRoot /var/www/accountsmaster

        <Directory /var/www/accountsmaster>
            Options -Indexes
            AllowOverride All
            Require all granted

            # React Router — all routes fall back to index.html
            RewriteEngine On
            RewriteBase /
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule ^ index.html [QSA,L]
        </Directory>

        # Proxy API calls to Express
        ProxyPreserveHost On
        ProxyPass /api/ http://localhost:8000/api/
        ProxyPassReverse /api/ http://localhost:8000/api/

        # Proxy uploads
        ProxyPass /uploads/ http://localhost:8000/uploads/
        ProxyPassReverse /uploads/ http://localhost:8000/uploads/
    </VirtualHost>

    
# STEP 3 — ENABLE THE SITE

    sudo a2ensite salesmaster.conf
    sudo a2dissite 000-default.conf
    sudo systemctl reload apache2

# Do the same for portal
    
# STEP 4 — VERIFY

    sudo systemctl status apache2
    Then open http://YOUR_SERVER_IP in a browser. The React app should load, and API calls will proxy to your Express backend on port 8000.


# STEP 7 — FIX PERMISSIONS

sudo chown -R www-data:www-data /var/www/accountsmaster
sudo chown -R $USER:$USER /opt/accountsmaster/server/uploads

# STEP 8 — FIREWALL

sudo ufw allow OpenSSH
sudo ufw enable
Verify everything works

pm2 status # API should show "online"
curl http://localhost:8000/api/auth # Should return JSON
Then open http://YOUR_SERVER_IP in a browser.

Useful commands later

pm2 logs salesmaster-api # View API logs
pm2 restart salesmaster-api # Restart after config change
pm2 monit # Live monitor

COMMONG FIXES

Forbidden
You don't have permission to access this resource.
https://salesmaster.masterbrainssolutions.com
Two possible causes — check both:

1. Fix directory permissions

sudo chown -R www-data:www-data /var/www/html/accountsmaster
sudo chmod -R 755 /var/www/html/accountsmaster 2. Check if the built files are actually there

ls /var/www/html/accountsmaster
If it's empty, you haven't copied the built frontend yet. Build on Windows first:

cd c:\xampp\htdocs\projects\accountsmaster\client
npm run build
Then copy the contents of client/dist/ into /var/www/html/accountsmaster/ on the server (there should be an index.html at the root).

3. After copying files, reload Apache

sudo systemctl reload apache2

SALESMASTER DEPLOYMENT

scp -P 22 "C:\xampp\htdocs\projects\accountsmaster\client\dist\assets\*" root@31.97.199.20:/var/www/html/accountsmaster\assets

scp -P 22 "C:\xampp\htdocs\projects\accountsmaster\client\dist\*" root@31.97.199.20:/var/www/html/accountsmaster

scp -P 22 "C:\xampp\htdocs\projects\accountsmaster\portal\dist\assets\*" root@31.97.199.20:/var/www/html/accountsmasterportal\assets

scp -P 22 "C:\xampp\htdocs\projects\accountsmaster\portal\dist\*" root@31.97.199.20:/var/www/html/accountsmasterportal

QUICK NEST STORES DEPLOYMENT

scp -P 22 "C:\xampp\htdocs\projects\accountsmaster\client\dist\assets\*" root@31.97.199.20:/var/www/html/quicknest\assets

scp -P 22 "C:\xampp\htdocs\projects\accountsmaster\client\dist\*" root@31.97.199.20:/var/www/html/quicknest

scp -P 22 "C:\xampp\htdocs\projects\accountsmaster\portal\dist\assets\*" root@31.97.199.20:/var/www/html/quicknestportal\assets

scp -P 22 "C:\xampp\htdocs\projects\accountsmaster\portal\dist\*" root@31.97.199.20:/var/www/html/quicknestportal

SERVER DEPLOYMENT

scp -P 22 "C:\xampp\htdocs\projects\accountsmaster\server\src\routes\*" root@31.97.199.20:/opt/accountsmaster/server/src/routes/

scp -P 22 "C:\xampp\htdocs\projects\accountsmaster\server\src\routes\*" root@31.97.199.20:/opt/quicknest/server/src/routes/
