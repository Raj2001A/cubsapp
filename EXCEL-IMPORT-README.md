# Employee Data Excel Import

This package contains everything you need to import employee data from an Excel file into your Employee Management System.

## Files Included

1. `EXCEL-IMPORT-GUIDE.md` - Comprehensive guide on how to import employee data
2. `employee-data-template.xlsx.md` - Template structure for your Excel file
3. `import-excel-data.bat` - Windows batch script to run the import
4. `import-excel-data.ps1` - PowerShell script to run the import

## Quick Start

### Option 1: Using the Batch Script (Windows Command Prompt)

1. Place your Excel file in the project root directory
2. Run the batch script:
   ```
   import-excel-data.bat path\to\your\excel\file.xlsx
   ```

### Option 2: Using the PowerShell Script (Windows PowerShell)

1. Place your Excel file in the project root directory
2. Run the PowerShell script:
   ```
   .\import-excel-data.ps1 path\to\your\excel\file.xlsx
   ```

### Option 3: Using npm Directly

1. Place your Excel file in the project root directory
2. Run the npm script:
   ```
   cd employee-management-backend
   npm run import-excel -- path/to/your/excel/file.xlsx
   ```

## Default File

If you name your Excel file `employee-data.xlsx` and place it in the project root directory, you can run the scripts without specifying a file path:

```
import-excel-data.bat
```

or

```
.\import-excel-data.ps1
```

## For More Information

Please refer to the `EXCEL-IMPORT-GUIDE.md` file for detailed instructions on how to prepare your Excel file and troubleshoot common issues.
