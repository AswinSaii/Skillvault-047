# SkillVault Setup Instructions

## Database Setup
1. Create a MySQL database named: **skillvault**
2. Import the database schema (if you have a SQL file)
3. Update `config/config.php` with your database credentials

## Apache Configuration for Clean URLs

### Step 1: Enable mod_rewrite
1. Open your Apache configuration file (usually `httpd.conf`)
2. Find this line (it might be commented with #):
   ```
   #LoadModule rewrite_module modules/mod_rewrite.so
   ```
3. Remove the `#` to enable it:
   ```
   LoadModule rewrite_module modules/mod_rewrite.so
   ```

### Step 2: Allow .htaccess Overrides
Find your DocumentRoot or Directory configuration in `httpd.conf`:

```apache
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride None
    Require all granted
</Directory>
```

Change `AllowOverride None` to `AllowOverride All`:

```apache
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Require all granted
</Directory>
```

### Step 3: Restart Apache
- **XAMPP**: Click "Stop" then "Start" on Apache in XAMPP Control Panel
- **Command Line**: `httpd -k restart` or `apachectl restart`

## Verify Clean URLs Work

After restarting Apache, test these URLs (they should work WITHOUT .php):

- ✅ http://localhost/skillvault (homepage)
- ✅ http://localhost/skillvault/auth/login (login page)
- ✅ http://localhost/skillvault/auth/register (registration)
- ✅ http://localhost/skillvault/verify (certificate verification)

## Troubleshooting 404 Errors

### If you still get 404 errors:

1. **Check if .htaccess file exists**
   - Make sure `.htaccess` file is in `d:\Skillvault\` folder
   - Windows might hide files starting with `.` - enable "Show hidden files"

2. **Verify Apache is reading .htaccess**
   - Add this to `.htaccess` at the top: `# Test`
   - If Apache shows an error on restart, it's reading the file
   - If no error, check AllowOverride setting again

3. **Check file permissions**
   - Ensure Apache can read the `.htaccess` file

4. **Verify RewriteBase**
   - In `.htaccess`, the line is: `RewriteBase /skillvault/`
   - This should match your folder structure

5. **Test with simple rewrite**
   - Create a test file: `d:\Skillvault\test.php`
   - Add content: `<?php echo "Test works!"; ?>`
   - Access: http://localhost/skillvault/test (without .php)
   - If this works, your setup is correct!

## Interactive Homepage Features

The new homepage includes:

### 🎨 Visual Enhancements
- Gradient hero section with animated background
- Hover effects on all cards
- Smooth scroll navigation
- Responsive design for all devices

### 📊 Interactive Charts
- **Skills Distribution** - Pie chart showing top skill categories
- **Student Growth** - Bar chart showing monthly growth
- **Certification Trends** - Line chart showing weekly certifications
- **Success Rates** - Area chart showing pass rate improvements

### ⚡ Animations
- Animated counter for statistics (counts up on scroll)
- Fade-in animations on page load
- Card hover effects with scale and shadow
- Floating icon animations

### 📱 Navigation
- Clean URLs without .php extensions
- Smooth scroll to sections
- Added "Analytics" section in navbar
- Updated all links to use clean URLs

## URL Structure

### Old URLs (with .php):
- ❌ http://localhost/skillvault/auth/login.php
- ❌ http://localhost/skillvault/verify.php

### New Clean URLs:
- ✅ http://localhost/skillvault/auth/login
- ✅ http://localhost/skillvault/verify
- ✅ http://localhost/skillvault/auth/register
- ✅ http://localhost/skillvault/auth/college-register

## Next Steps

1. **Restart Apache** after enabling mod_rewrite
2. **Clear browser cache** (Ctrl + F5)
3. **Test the homepage**: http://localhost/skillvault
4. **Verify clean URLs work**: Try accessing /auth/login without .php
5. **Check database connection** in config/config.php

## Need Help?

If you're still experiencing issues:
1. Check Apache error logs: `xampp/apache/logs/error.log`
2. Verify mod_rewrite is loaded: Create `phpinfo.php` with `<?php phpinfo(); ?>` and check for mod_rewrite
3. Make sure you're using the correct base URL in config
