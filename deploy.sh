#!/bin/bash
# deploy.sh - Production Deployment Script

set -e

echo "🚀 Starting HayGuard deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="hayguard"
DOMAIN="hayguard-app.com"
DB_NAME="hayguard_production"
BACKUP_DIR="/var/backups/hayguard"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "Don't run this script as root!"
   exit 1
fi

# Check if backend/.env file exists
if [ ! -f backend/.env ]; then
    print_error "Backend .env file not found! Copy backend/b.env.example to backend/.env and configure it."
    exit 1
fi

# Load environment variables
source backend/.env

# Create necessary directories
print_status "Creating directories..."
mkdir -p logs
mkdir -p uploads
sudo mkdir -p $BACKUP_DIR
sudo chown $USER:$USER $BACKUP_DIR

# Backup database (if exists)
backup_database() {
    print_status "Creating database backup..."
    if psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
        pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > "$BACKUP_DIR/backup-$(date +%Y%m%d_%H%M%S).sql"
        print_success "Database backup created"
    else
        print_warning "Database doesn't exist yet, skipping backup"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update package list
    sudo apt update
    
    # Install required packages
    sudo apt install -y \
        nodejs \
        npm \
        postgresql \
        postgresql-contrib \
        nginx \
        certbot \
        python3-certbot-nginx \
        git \
        curl \
        ufw

    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    fi

    print_success "System dependencies installed"
}

# Setup PostgreSQL
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    # Check if database exists
    if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        print_status "Creating database and user..."
        
        # Create database user and database
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
        
        # Run database initialization
        if [ -f backend/schema.sql ]; then
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f backend/schema.sql
            print_success "Database schema imported"
        else
            print_warning "No schema.sql found, tables will be created automatically"
        fi
        
        print_success "Database created and initialized"
    else
        print_success "Database already exists"
    fi
}

# Install Node.js dependencies
install_node_deps() {
    print_status "Installing Node.js dependencies..."
    
    # Backend dependencies
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    cd frontend
    npm install
    cd ..
    
    print_success "Node.js dependencies installed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    print_success "Frontend built successfully"
}

# Setup PM2
setup_pm2() {
    print_status "Setting up PM2..."
    
    # Start the backend application
    cd backend
    pm2 start server.js --name hayguard-api
    cd ..
    
    # Setup PM2 startup script
    pm2 startup
    pm2 save
    
    print_success "PM2 configured and started"
}

# Setup Nginx
setup_nginx() {
    print_status "Setting up Nginx..."
    
    # Backup original config
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup 2>/dev/null || true
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Temporary location for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Frontend static files
    root /var/www/$PROJECT_NAME;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:$PORT/health;
        access_log off;
    }
}
EOF

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Restart Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    print_success "Nginx configured"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Create webroot directory
    sudo mkdir -p /var/www/html
    
    # Obtain SSL certificate
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    
    print_success "SSL certificate configured"
}

# Setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    
    # Check if frontend build exists
    if [ -d "frontend/build" ]; then
        sudo rm -rf /var/www/$PROJECT_NAME
        sudo cp -r frontend/build /var/www/$PROJECT_NAME
        sudo chown -R www-data:www-data /var/www/$PROJECT_NAME
        print_success "Frontend deployed"
    else
        print_error "Frontend build directory not found. Run 'npm run build' in frontend folder first."
        exit 1
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    sleep 5
    
    if curl -f http://localhost:$PORT/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        print_status "Checking PM2 logs..."
        pm2 logs --lines 10
        exit 1
    fi
    
    if curl -f https://$DOMAIN/health > /dev/null 2>&1; then
        print_success "Frontend health check passed"
    else
        print_warning "Frontend health check failed (SSL might still be setting up)"
    fi
}

# Main deployment process
main() {
    print_status "Starting HayGuard deployment process..."
    
    # Check if this is first deployment
    if [ "$1" == "--initial" ]; then
        print_status "Running initial deployment..."
        backup_database
        install_dependencies
        setup_database
        install_node_deps
        build_frontend
        setup_pm2
        setup_nginx
        setup_ssl
        setup_firewall
        deploy_frontend
        health_check
    else
        print_status "Running update deployment..."
        backup_database
        install_node_deps
        build_frontend
        pm2 restart hayguard-api
        deploy_frontend
        health_check
    fi
    
    print_success "🎉 HayGuard deployment completed successfully!"
    print_status "Your application is now available at: https://$DOMAIN"
    print_status "API health check: https://$DOMAIN/health"
    print_status "Admin panel: https://$DOMAIN/register (create your first account)"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    # Add any cleanup tasks here
}

# Trap cleanup function on script exit
trap cleanup EXIT

# Run main function
main "$@"