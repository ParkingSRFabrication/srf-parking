# SR FABRICATION — Database Backup & Recovery Guide
## Railway Station Vehicle Parking Management System

---

## 1. Backup Strategy Overview
To ensure zero financial data loss, SR Fabrication employs a **two-tier backup model**:
1. **Tier 1: Cloud Provider Automated Snapshots (MongoDB Atlas)**:
   - Continuous Point-in-Time Restore (PITR) with hourly snapshots.
   - 30-day retention for compliance audits.
2. **Tier 2: Offsite Binary & Application Dumps (`mongodump` & JSON Exports)**:
   - Daily encrypted dump stored in AWS S3 or secondary offsite storage.
   - On-demand admin export via `/api/backup/export`.

---

## 2. Automated Daily Backup via `mongodump`

### Backup Script (`scripts/backup.sh`)
```bash
#!/bin/bash
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/srf_parking"
ARCHIVE_NAME="srf_parking_backup_${TIMESTAMP}.gz"

mkdir -p "$BACKUP_DIR"

echo "Creating binary database archive..."
mongodump --uri="$MONGODB_URI" --archive="$BACKUP_DIR/$ARCHIVE_NAME" --gzip

echo "Encrypting backup archive..."
openssl enc -aes-256-cbc -salt -in "$BACKUP_DIR/$ARCHIVE_NAME" \
  -out "$BACKUP_DIR/${ARCHIVE_NAME}.enc" -pass file:/etc/backup_key.bin

rm "$BACKUP_DIR/$ARCHIVE_NAME"

echo "Pruning local backups older than 14 days..."
find "$BACKUP_DIR" -type f -name "*.enc" -mtime +14 -exec rm {} \;

echo "Backup completed successfully: $ARCHIVE_NAME.enc"
```

---

## 3. Restoration Procedure

### 3.1 Restoring from MongoDB Atlas Cloud Snapshots
1. Log in to MongoDB Atlas Console.
2. Navigate to your cluster $\to$ **Backup** tab.
3. Select the desired restore point and click **Restore**.
4. Choose either **Restore to Cluster** or **Download Backup Archive**.

### 3.2 Restoring from Offsite Encrypted Archive (`mongorestore`)
1. Decrypt the archive:
   ```bash
   openssl enc -d -aes-256-cbc -in /var/backups/srf_parking/srf_parking_backup_20261009_080000.gz.enc \
     -out /var/backups/srf_parking/restore_archive.gz -pass file:/etc/backup_key.bin
   ```
2. Restore to MongoDB instance:
   ```bash
   mongorestore --uri="$MONGODB_URI" --archive=/var/backups/srf_parking/restore_archive.gz --gzip --drop
   ```
3. Remove temporary unencrypted file:
   ```bash
   rm /var/backups/srf_parking/restore_archive.gz
   ```

---

## 4. Disaster Recovery Testing Checklist
- [ ] Run test restoration in a staging sandbox environment quarterly.
- [ ] Verify that collection counts match (`parkingTokens`, `payments`, `monthlyPasses`).
- [ ] Validate that historical tariff snapshots and token exit calculations remain consistent.
