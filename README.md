# 🚨 Self-Service Problem Prevention Portal

[![ServiceNow](https://img.shields.io/badge/ServiceNow-Ready-00a1c9.svg)](https://www.servicenow.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![Now SDK](https://img.shields.io/badge/Now%20SDK-4.0.2-orange.svg)](https://developer.servicenow.com/)
[![License](https://img.shields.io/badge/License-UNLICENSED-red.svg)](#)

A customer-facing portal for known problems, workarounds, proactive notifications, and community-driven solution sharing with voting system. This ServiceNow application empowers users to stay informed about known issues, discover community solutions, and contribute their own workarounds.

## 🌟 Features

- **📋 Known Problems Dashboard**: Real-time view of active problems and their status
- **🔍 Smart Search**: Quickly find problems and solutions by keyword or description
- **💡 Community Solutions**: User-contributed workarounds with voting system
- **🔔 Proactive Notifications**: Automated alerts for new problems and solutions
- **👥 Role-Based Access**: Secure access control for customers and administrators
- **📱 Responsive Design**: Modern React-based UI that works on all devices
- **⚡ Real-Time Updates**: Live problem tracking and status updates

## 🏗️ Architecture

This application is built using the ServiceNow Now SDK with Fluent API and includes:

### Frontend (React)
- **React 18.2.0** for the user interface
- **Modern ES6+** JavaScript with JSX components
- **Responsive CSS** for cross-device compatibility
- **Service layer** for API communication

### Backend (ServiceNow)
- **Fluent API** for metadata definitions
- **Business Rules** for automated notifications  
- **Script Includes** for utility functions
- **UI Pages** for portal integration
- **Role-based security** model

## 📁 Project Structure

```
src/
├── client/                     # React frontend application
│   ├── app.jsx                # Main application component
│   ├── index.html             # HTML entry point
│   ├── main.jsx               # React root initialization
│   ├── components/            # React components
│   │   ├── ProblemDetail.jsx  # Problem detail view
│   │   ├── ProblemList.jsx    # Problems listing component
│   │   └── *.css              # Component styles
│   ├── services/              # API service layer
│   │   └── ProblemService.js  # Problem data service
│   └── utils/                 # Utility functions
│       └── fields.js          # Field utilities
├── fluent/                    # ServiceNow Fluent API definitions
│   ├── index.now.ts           # Main fluent exports
│   ├── business-rules/        # Business rule definitions
│   ├── roles/                 # Security roles
│   ├── script-includes/       # Server-side utilities
│   └── ui-pages/              # UI page definitions
└── server/                    # Server-side JavaScript
    ├── business-rules/        # Business rule implementations
    └── script-includes/       # Script include implementations
```

## 🚀 Getting Started

### Prerequisites

- ServiceNow instance (Paris or later)
- Node.js 16+ and npm
- ServiceNow Now SDK 4.0.2+
- ServiceNow CLI configured with your instance

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd selfservic-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your ServiceNow instance**
   ```bash
   # Update now.config.json with your instance details
   # Ensure proper authentication is configured
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Deploy to ServiceNow**
   ```bash
   npm run deploy
   ```

## 🔧 Available Scripts

- `npm run build` - Build the application for deployment
- `npm run deploy` - Deploy to your ServiceNow instance
- `npm run transform` - Transform code for ServiceNow compatibility
- `npm run types` - Generate TypeScript definitions

## 🔐 Security & Access

### Roles

- **`x_snc_selfservic_1.customer`** - Customer access to the portal
- **`x_snc_selfservic_1.problem_admin`** - Administrative access for problem management

### Access Control

The application implements role-based access control:
- Customers can view problems and contribute solutions
- Administrators can manage problems and moderate content
- Secure API endpoints with proper authentication

## 🎯 Usage

### Accessing the Portal

Navigate to: `https://your-instance.service-now.com/x_snc_selfservic_1_portal.do`

### For Customers
1. **Browse Problems**: View active problems affecting your services
2. **Search Solutions**: Find existing workarounds and solutions
3. **Vote on Solutions**: Help the community by voting on helpful solutions
4. **Get Notifications**: Receive proactive alerts about new problems

### For Administrators  
1. **Moderate Content**: Review and approve community contributions
2. **Manage Problems**: Create and update problem records
3. **Monitor Activity**: Track portal usage and community engagement

## 🔔 Notifications

The application includes automated notification features:
- **New Problem Alerts**: Automatic notifications when new problems are identified
- **Solution Updates**: Alerts when new workarounds are contributed
- **Status Changes**: Updates when problem status changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ServiceNow development best practices
- Use Fluent API for all metadata definitions
- Implement proper error handling
- Add appropriate logging for troubleshooting
- Write clear, self-documenting code

## 📊 Monitoring & Analytics

The portal includes built-in analytics for:
- Problem view counts
- Solution effectiveness ratings
- User engagement metrics
- Search pattern analysis

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Ensure all dependencies are installed: `npm install`
   - Check ServiceNow CLI configuration
   - Verify instance connectivity

2. **Access Denied**
   - Confirm user has appropriate role assigned
   - Check ACL configurations
   - Verify portal endpoint is accessible

3. **Data Not Loading**
   - Check business rule configurations
   - Verify script include permissions
   - Review browser console for errors

## 📚 Documentation

- [ServiceNow Now SDK Documentation](https://developer.servicenow.com/dev.do#!/reference/api/utah/now-sdk)
- [Fluent API Reference](https://developer.servicenow.com/dev.do#!/reference/api/utah/fluent-api)
- [React Documentation](https://reactjs.org/docs)

## 📝 License

This project is UNLICENSED. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact your ServiceNow administrator
- Review ServiceNow community forums

---

**Built with ❤️ using ServiceNow Now SDK and React**

*Empowering users with proactive problem prevention and community-driven solutions*