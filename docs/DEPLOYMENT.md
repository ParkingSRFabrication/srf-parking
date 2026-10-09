# SR FABRICATION — Production Deployment Guide
## Railway Station Vehicle Parking Management System

---

## 1. Production Architecture Overview
- **Frontend**: Single Page Application built with React and Vite. Deployed to Vercel, Cloudflare Pages, or Netlify.
- **Backend**: Express.js REST API on Node.js (v20+ or v24+). Deployed to a Virtual Private Server (Ubuntu/Debian) or managed PaaS (Render, Railway, Fly.io, or AWS EC2).
- **Database**: MongoDB Atlas Dedicated or Shared Cluster (M10+) with Automated Daily Backups and IP Whitelisting.
- **Reverse Proxy & SSL**: Nginx or Caddy with Let's Encrypt TLS certificates.

---

## 2. Environment Variables Checklist

### Backend (`backend/.env`)
```ini
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://srf_admin:<PASSWORD>@cluster0.mongodb.net/srf_parking?retryWrites=true&w=majority
JWT_ACCESS_SECRET=min_32_characters_random_cryptographic_secret_key_1
JWT_REFRESH_SECRET=min_32_characters_random_cryptographic_secret_key_2
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_ORIGIN=https://parking.srfabrication.com
COOKIE_SECRET=min_32_characters_random_cookie_signing_secret_3
BUSINESS_TIMEZONE=Asia/Kolkata
DEFAULT_LOCATION_CODE=SRF-MAIN
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=https://api.srfabrication.com/api
```

---

## 3. Step-by-Step Deployment Instructions

### Step 3.1: Database Setup (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a new Cluster in the `ap-south-1` (Mumbai) region for lowest latency at Indian railway stations.
3. Under **Database Access**, create a user `srf_db_user` with `readWrite` permissions on database `srf_parking`.
4. Under **Network Access**, add the static IP addresses of your backend servers.

### Step 3.2: Backend Deployment (Ubuntu VPS with PM2)
1. SSH into the server:
   ```bash
   ssh ubuntu@<SERVER_IP>
   ```
2. Clone the repository and install Node.js dependencies:
   ```bash
   git clone <REPO_URL> /var/www/srf-parking
   cd /var/www/srf-parking/backend
   npm install --omit=dev
   ```
3. Configure `/var/www/srf-parking/backend/.env` with production secrets.
4. Run the database seed script to initialize the first administrator:
   ```bash
   npm run seed
   ```
5. Install and configure PM2 process manager:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "srf-parking-api"
   pm2 startup
   pm2 save
   ```

### Step 3.3: Frontend Deployment (Vercel)
1. Import repository on [Vercel](https://vercel.com/).
2. Set Root Directory to `frontend`.
3. Configure Build Command: `npm run build` and Output Directory: `dist`.
4. Add environment variable: `VITE_API_BASE_URL=https://api.srfabrication.com/api`.
5. Deploy and attach custom domain `parking.srfabrication.com`.

### Step 3.4: Domain DNS & HTTPS Setup
1. Point `parking.srfabrication.com` CNAME to `cname.vercel-dns.com`.
2. Point `api.srfabrication.com` A Record to backend server IP.
3. Configure SSL on Nginx:
   ```nginx
   server {
       server_name api.srfabrication.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
4. Obtain SSL certificate using Certbot:
   ```bash
   sudo certbot --nginx -d api.srfabrication.com
   ```
