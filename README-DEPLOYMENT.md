# Employee Management App Deployment

## Deployment Instructions

To deploy this application to Netlify, follow these steps:

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the `dist` folder from your local machine
3. Wait for the deployment to complete
4. Your application will be available at a Netlify subdomain (e.g., https://your-site-name.netlify.app)

## Configuration

The application is configured to use a public JSON server for the API. You can change the API URL by setting the `VITE_API_URL` environment variable in the Netlify site settings.

## Login Credentials

- Email: admin@example.com
- Password: password123

## Features

- Employee Management
- Document Management
- Visa Expiry Tracking
- Dashboard & Analytics
- Multiple Backend Support

## Notes

- This is a temporary deployment for testing purposes
- The application uses a public JSON server for the API, so data will not persist
- For a production deployment, you should set up a proper backend server
