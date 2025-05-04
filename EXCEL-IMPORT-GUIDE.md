# Employee Data Excel Import Guide

This guide will help you import employee data from an Excel file into your Employee Management System database.

## Prerequisites

1. Node.js and npm installed
2. Access to your Neon PostgreSQL database
3. Excel file with employee data (see template structure below)

## Excel File Structure

Your Excel file should have the following columns:

| Column Name | Description | Required |
|-------------|-------------|----------|
| EMPLOYEE ID | Unique identifier for the employee | Yes |
| NAME | Full name of the employee | Yes |
| TRADE | Employee's trade or job role | No |
| NATIONALITY | Employee's nationality | No |
| JOINING DATE | Date when employee joined (YYYY-MM-DD) | No |
| DATE OF BIRTH | Employee's date of birth (YYYY-MM-DD) | No |
| MOBILE NUMBER | Employee's mobile phone number | No |
| HOME PHONE NUMBER | Employee's home phone number | No |
| EMAIL ID | Employee's email address | No |
| COMPANY NAME | Name of the company | No |
| VISA EXPIRY DATE | Expiry date of visa (YYYY-MM-DD) | No |

## Step-by-Step Import Process

### 1. Prepare Your Excel File

1. Ensure your Excel file follows the structure described above
2. Save your Excel file (e.g., `employee-data.xlsx`)
3. Note the full path to your Excel file

### 2. Run the Database Setup Script (First Time Only)

If this is your first time importing data, run the database setup script to ensure all necessary tables exist:

```bash
cd employee-management-backend
npm run setup-schema
```

### 3. Run the Import Script

Run the import script with the path to your Excel file:

```bash
cd employee-management-backend
npm run import-excel -- /path/to/your/employee-data.xlsx
```

Replace `/path/to/your/employee-data.xlsx` with the actual path to your Excel file.

If you don't specify a path, the script will look for a file named `employee-data.xlsx` in the project root directory.

### 4. Monitor the Import Process

The script will display progress information:

1. Number of records found in the Excel file
2. Database connection status
3. Number of companies found in the database
4. Updates on each employee being imported or updated
5. Summary of import results (imported, skipped, errors)

### 5. Verify the Import

After the import is complete, you can verify the data was imported correctly by:

1. Checking the employee list in the web application
2. Running a database query to count the employees:
   ```bash
   cd employee-management-backend
   npx ts-node -e "const { Pool } = require('pg'); require('dotenv').config(); const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } }); (async () => { const result = await pool.query('SELECT COUNT(*) FROM employees'); console.log('Employee count:', result.rows[0].count); await pool.end(); })().catch(err => console.error(err));"
   ```

## Troubleshooting

### Common Issues and Solutions

1. **Excel file not found**
   - Ensure the file path is correct
   - Try using an absolute path instead of a relative path

2. **Database connection error**
   - Check your `.env` file has the correct `NEON_DATABASE_URL`
   - Ensure your database is running and accessible

3. **Data format issues**
   - Ensure dates are in YYYY-MM-DD format
   - Check for special characters in text fields

4. **Duplicate employee IDs**
   - The script will update existing employees rather than creating duplicates
   - Check the console output for "Updated employee" messages

### Getting Help

If you encounter issues not covered in this guide:

1. Check the error messages in the console output
2. Review the database logs for more detailed error information
3. Contact your system administrator for assistance

## Advanced Usage

### Importing Multiple Files

You can import multiple Excel files by running the script multiple times with different file paths:

```bash
npm run import-excel -- /path/to/file1.xlsx
npm run import-excel -- /path/to/file2.xlsx
```

### Partial Updates

You can use the import script to update specific fields for existing employees:

1. Create an Excel file with only the employees you want to update
2. Include only the columns you want to update (EMPLOYEE ID is required)
3. Run the import script with this file

## Security Considerations

The import script:

1. Uses parameterized queries to prevent SQL injection
2. Validates required fields before import
3. Runs in a transaction to ensure data consistency
4. Handles errors gracefully without corrupting the database

## Next Steps

After importing your employee data, you may want to:

1. Import employee documents
2. Set up visa expiry notifications
3. Configure user accounts for employees

For more information on these topics, refer to the main application documentation.
