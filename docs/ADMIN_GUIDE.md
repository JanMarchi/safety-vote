# Safety Vote - Administrator Guide

## Administration Overview

Safety Vote Admin Panel provides comprehensive tools to manage elections, candidates, voters, and security.

## Admin Access

### Logging In as Admin

```
1. Visit: https://safety-vote.example.com/admin
2. Enter email (must have admin role)
3. Click "Send Magic Link"
4. Verify via magic link
5. Dashboard opens
```

### Role Requirements

**Admin Can:**
- ✅ Create elections
- ✅ Manage candidates
- ✅ Manage voters
- ✅ View results
- ✅ View audit logs
- ✅ Export reports
- ✅ Reset votes
- ✅ Deactivate elections
- ✅ Manage admin users

**RH Can:**
- ⚠️ Create elections
- ⚠️ Manage candidates (own elections)
- ⚠️ View results
- ⚠️ Export reports

**Eleitor (Voter):**
- 🔒 Can only vote
- 🔒 Can view own vote status

## Dashboard

### Overview
```
Dashboard shows:
- Total elections
- Total votes cast
- Total eligible voters
- System status
- Recent activities
- Security alerts
```

### Quick Stats
```
- Elections: Active | Draft | Finished
- Voters: Registered | Participated | Abstained
- Coverage: % of eligible voters who voted
- Time: Elections ending soon (1 day, 1 week)
```

### Navigation Menu
```
├── Dashboard (Home)
├── Elections
├── Candidates
├── Voters
├── Results
├── Audit Logs
├── Reports
└── Settings
```

## Election Management

### Create Election

#### Step 1: Basic Information
```
1. Go to Elections > Create New
2. Fill in:
   - Title: "Eleição CIPA 2024"
   - Description: Purpose and context
   - Category: Board elections, Committee, etc.
3. Click "Next"
```

#### Step 2: Schedule
```
1. Set Start Date & Time
   - Format: YYYY-MM-DD HH:MM
   - Recommended: During work hours
2. Set End Date & Time
   - Should be 1-3 days after start
   - Consider timezone differences
3. Click "Next"
```

#### Step 3: Voter Registration
```
1. Choose voter source:
   - Upload CSV file
   - Manual entry
   - Import from HR system
2. Specify eligible voters:
   - Required field: Email
   - Optional: Name, CPF, Department
3. Click "Upload & Next"
```

#### Step 4: Election Settings
```
1. Voting method:
   - Single choice (one candidate)
   - Multiple choice (up to N candidates)
2. Allow abstention: Yes | No
3. Public results: Yes | No
4. Live results: Yes | No (during voting)
5. Click "Create Election"
```

### Edit Election

```
Only available if election is DRAFT:

1. Go to Elections > [Election Name]
2. Click "Edit"
3. Change:
   - Title
   - Description
   - Dates
   - Settings
4. Click "Save"
```

### Manage Election Status

#### Activate Election
```
Prerequisites:
- ✅ Election is in DRAFT
- ✅ Has at least 2 candidates
- ✅ Has eligible voters registered

Steps:
1. Go to Elections > [Election Name]
2. Click "Activate"
3. Confirm "Yes, activate"
4. Election status: ACTIVE
5. Voters can now vote
```

#### Pause Election
```
1. Go to Elections > [Election Name]
2. Click "Pause"
3. Voters cannot vote temporarily
4. Can be resumed later
```

#### Finish Election
```
Prerequisites:
- ✅ Election is ACTIVE
- ✅ End time has passed (or manual)

Steps:
1. Go to Elections > [Election Name]
2. Click "Finish"
3. Confirm "Yes, close voting"
4. Election status: FINISHED
5. Final results are locked
```

#### Delete Election
```
⚠️ WARNING: Cannot undo this action

Only if election is DRAFT:
1. Go to Elections > [Election Name]
2. Click "Delete"
3. Enter election title to confirm
4. Click "Permanently Delete"
```

### Clone Election

```
Create election based on existing one:

1. Go to Elections > [Election Name]
2. Click "Clone"
3. New draft election created
4. Edit as needed
5. Modify title, dates, candidates, voters
```

## Candidate Management

### Add Candidates

#### Single Candidate
```
1. Go to Elections > [Election Name] > Candidates
2. Click "Add Candidate"
3. Fill in:
   - Full Name
   - CPF (optional, for verification)
   - Bio/Description
   - Photo (optional, JPG/PNG, max 2MB)
   - Email (optional, for notifications)
4. Click "Save"
```

#### Bulk Upload
```
1. Go to Elections > [Election Name] > Candidates
2. Click "Bulk Upload"
3. Download CSV template
4. Fill with candidate data:
   - name,cpf,bio,email,photo_url
5. Upload CSV file
6. Review candidates
7. Click "Import All"
```

#### CSV Format
```
name,cpf,bio,email,photo_url
João Silva,12345678901,Candidato experiente,joao@example.com,https://...
Maria Santos,98765432100,Gestora de projetos,maria@example.com,https://...
```

### Edit Candidate
```
Only if election is DRAFT:

1. Go to Elections > [Election Name] > Candidates
2. Click candidate name
3. Edit information
4. Click "Save"
```

### Remove Candidate
```
Only if election is DRAFT:

1. Go to Elections > [Election Name] > Candidates
2. Click candidate name
3. Click "Remove"
4. Confirm deletion
```

### Reorder Candidates
```
Change display order:

1. Go to Elections > [Election Name] > Candidates
2. Drag candidates to reorder
3. Candidates appear in this order to voters
```

## Voter Management

### Register Voters

#### Single Voter
```
1. Go to Elections > [Election Name] > Voters
2. Click "Add Voter"
3. Enter:
   - Email (required)
   - Name (required)
   - CPF (optional)
   - Department (optional)
4. Click "Add Voter"
```

#### Bulk Upload
```
1. Go to Elections > [Election Name] > Voters
2. Click "Bulk Upload"
3. Download CSV template
4. Fill voter data:
   - email,name,cpf,department
5. Upload CSV file
6. Review and confirm
7. Click "Import All"
```

#### CSV Format
```
email,name,cpf,department
joao@example.com,João Silva,12345678901,Engineering
maria@example.com,Maria Santos,98765432100,Sales
```

### View Voter Status

```
See voter participation:

1. Go to Elections > [Election Name] > Voters
2. Table shows:
   - Email
   - Name
   - Registered date
   - Has Voted: ✓ Yes | ✗ No
   - Vote Time (if voted)
3. Filter by: Participated | Not Participated
```

### Reset Vote

```
Allow voter to vote again (if needed):

1. Go to Elections > [Election Name] > Voters
2. Find voter
3. Click "Reset Vote"
4. Confirm "Yes, reset"
5. Voter can vote again
6. Audit log records action
```

### Remove Voter

```
Unregister voter from election:

1. Go to Elections > [Election Name] > Voters
2. Find voter
3. Click "Remove"
4. Confirm removal
5. Voter cannot vote anymore
```

### Resend Magic Link

```
Resend login link to voter:

1. Go to Elections > [Election Name] > Voters
2. Find voter who didn't receive email
3. Click "Resend Link"
4. Email is sent again
5. System tracks resend attempts
```

## Results & Analysis

### View Live Results

```
While election is ACTIVE:

1. Go to Elections > [Election Name] > Results
2. See:
   - Total votes cast
   - Votes per candidate
   - Abstention count
   - Participation percentage
   - Real-time updates
3. Refresh to update
```

### View Final Results

```
After election is FINISHED:

1. Go to Elections > [Election Name] > Results
2. See:
   - Final vote counts
   - Percentages
   - Rankings
   - Elected candidates
   - Total participation
3. Results are locked and cannot change
```

### View Result Details

```
See detailed vote breakdown:

1. Click on candidate name
2. View:
   - Exact vote count
   - Percentage calculation
   - Vote trend (by hour)
   - Ranking position
```

### Export Results

```
Download results in multiple formats:

1. Go to Elections > [Election Name] > Results
2. Click "Export Results"
3. Choose format:
   - CSV (spreadsheet)
   - JSON (data)
   - PDF (report with logo)
4. Click "Download"
5. File saved to computer
```

### Print Results

```
Print report:

1. Go to Elections > [Election Name] > Results
2. Click "Print"
3. Print dialog opens
4. Customize settings
5. Click "Print"
```

## Audit & Security

### View Audit Logs

```
Track all system actions:

1. Go to Audit Logs
2. See all actions:
   - User (email)
   - Action (vote_cast, login, etc.)
   - Resource (election, candidate)
   - IP Address
   - Timestamp
   - Status (success/failure)
3. Filter by:
   - Action type
   - User
   - Election
   - Date range
```

### Generate Audit Report

```
Official audit report:

1. Go to Audit Logs
2. Click "Generate Report"
3. Select date range:
   - Election dates
   - Custom dates
4. Choose format:
   - PDF (for printing)
   - CSV (for analysis)
5. Click "Generate"
6. Download report
```

### Security Alerts

```
Monitor suspicious activity:

1. Dashboard shows alerts:
   - Multiple login attempts
   - Unusual voting patterns
   - Access denied attempts
2. Review alert details
3. Take action if needed:
   - Block IP
   - Reset voter
   - Disable user
```

### IP Address Management

```
View IPs used for voting:

1. Go to Security > IP Log
2. See:
   - IP address
   - Location (approximate)
   - Number of votes from IP
   - Last activity time
3. Flag suspicious IPs
```

## Reports

### Generate Reports

```
Multiple report types:

1. Go to Reports
2. Select report:
   - Election Summary
   - Voter Participation
   - Security Audit
   - Results Analysis
3. Select date range
4. Click "Generate"
5. Choose export format
6. Download report
```

### Schedule Reports

```
Auto-generate reports:

1. Go to Reports > Scheduled
2. Click "Create Schedule"
3. Select report type
4. Set frequency: Daily, Weekly, Monthly
5. Set recipients (emails)
6. Click "Create"
7. Reports sent automatically
```

### Export to External Systems

```
Send results to HR or other systems:

1. Go to Results
2. Click "Export To"
3. Choose destination:
   - Email
   - Google Sheets
   - Microsoft Excel
   - Custom API
4. Configure credentials
5. Click "Export"
```

## Settings

### General Settings

```
Go to Settings > General:

- Company name
- Logo upload
- Support email
- Support phone
- Email domain
- Timezone
```

### Email Settings

```
Go to Settings > Email:

- SMTP server
- Email address (from)
- Email password
- Email templates
- Reply-to address
```

### Security Settings

```
Go to Settings > Security:

- Session timeout: 4 hours
- Force HTTPS: On
- Rate limiting: 100/minute
- IP whitelist (optional)
- 2FA (two-factor authentication)
```

### User Management

```
Go to Settings > Users:

- Add admin user
- Remove admin user
- Reset admin password
- View admin activity
```

## Troubleshooting

### Election Won't Activate

```
Check:
1. ✅ At least 2 candidates exist
2. ✅ At least 1 voter registered
3. ✅ Election title is set
4. ✅ Dates are valid
5. ✅ Current time is before end time

If all checked, contact support.
```

### Voters Can't Vote

```
Check:
1. Election is ACTIVE (not DRAFT or FINISHED)
2. Voter is registered
3. Voter has not already voted
4. Current time is within voting window
5. No IP blocking

Solution:
- Extend end date if needed
- Reset voter vote if accidental
- Check network/firewall
```

### Results Are Wrong

```
Check:
1. Election is FINISHED
2. Votes are encrypted (not visible directly)
3. System is calculating correctly
4. No votes are lost

Note:
- Votes are encrypted and cannot be tampered
- Results are calculated from encrypted votes
- Each vote counted equally
- Mathematical verification available in audit log
```

### Can't Download Export

```
Solutions:
1. Check browser allows downloads
2. Check disk space
3. Try different format
4. Try different browser
5. Contact IT support
```

## Best Practices

### Before Election
- [ ] Test with sample voters
- [ ] Verify all candidates listed
- [ ] Check voter registration
- [ ] Test voting process
- [ ] Notify voters of election

### During Election
- [ ] Monitor participation rate
- [ ] Watch for alerts
- [ ] Check system performance
- [ ] Be available for support
- [ ] Document any issues

### After Election
- [ ] Export and backup results
- [ ] Generate audit report
- [ ] Publish results (if allowed)
- [ ] Archive election data
- [ ] Send thank you message

### Security Best Practices
- Change admin password regularly
- Monitor audit logs
- Use strong email password
- Enable 2FA if available
- Report suspicious activity
- Keep software updated

## Support

### Contact Support
```
Email: admin-support@example.com
Hours: Monday-Friday, 9 AM - 5 PM (Brazil Time)
Phone: +55 (XX) XXXX-XXXX
Slack: #voting-support
```

### Report Issues
```
1. Document the problem
2. Note when it occurred
3. Include screenshots
4. Provide exact steps to reproduce
5. Send to admin-support@example.com
```

### Training
```
- Video tutorials available
- Live training sessions (monthly)
- Documentation wiki
- FAQ section
- Online chat support
```

---

**Version**: 1.0
**Last Updated**: 2026-03-08
**Contact**: admin-support@example.com
