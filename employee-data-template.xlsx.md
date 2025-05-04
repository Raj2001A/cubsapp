# Employee Data Excel Template

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
| COMPANY ID | ID of the company (if known) | No |
| COMPANY NAME | Name of the company | No |
| VISA EXPIRY DATE | Expiry date of visa (YYYY-MM-DD) | No |

## Example Data

Here's an example of how your data should look:

| EMPLOYEE ID | NAME | TRADE | NATIONALITY | JOINING DATE | DATE OF BIRTH | MOBILE NUMBER | HOME PHONE NUMBER | EMAIL ID | COMPANY NAME | VISA EXPIRY DATE |
|-------------|------|-------|------------|--------------|--------------|---------------|-------------------|----------|--------------|------------------|
| EMP001 | John Smith | Engineer | UK | 2023-01-15 | 1985-05-20 | +971501234567 | +97142345678 | john.smith@example.com | Cub Technical Services | 2025-01-14 |
| EMP002 | Sara Ahmed | Technician | UAE | 2022-11-10 | 1990-08-12 | +971502345678 | +97142456789 | sara.ahmed@example.com | Cub Technical Contracting | 2024-11-09 |
| EMP003 | Michael Wong | Supervisor | Philippines | 2023-03-22 | 1988-12-05 | +971503456789 | +97142567890 | michael.wong@example.com | Cub Technical Maintenance | 2025-03-21 |

## Notes

1. The column names should match exactly as shown above (case-sensitive)
2. Dates should be in YYYY-MM-DD format
3. If a company doesn't exist in the database, it will be created automatically
4. If an employee with the same EMPLOYEE ID already exists, their information will be updated
