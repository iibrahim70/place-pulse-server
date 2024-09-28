# Place Pulse - Backend

Welcome to the backend repository for Place Pulse, a sophisticated and scalable RESTful API developed using TypeScript and Express. This API is designed to deliver critical functionalities for efficient management of user authentication, property listings, bookings, and various other services. With a focus on performance and security, Place Pulse aims to provide a seamless experience for both users and developers.


## Table of Contents

- [Introduction](#introduction)
- [Technologies Used](#technologies-used)
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Running the Server](#running-the-server)
- [Contributing](#contributing)


## Introduction

This backend repository serves as the foundation of Place Pulse, delivering a secure and efficient server that supports a wide range of functionalities, including user management, property management, and booking systems. Built with TypeScript, Node.js, and Express, this architecture ensures robust performance and scalability, enabling seamless interaction between users and the application.


## Technologies Used

- **Node.js**
- **Express**
- **TypeScript**
- **MongoDB**
- **Mongoose**
- **JWT (JSON Web Token)** for authentication
- **bcrypt** for password hashing
- **Stripe** for payment processing
- **Socket.io** for real-time communication
- **CORS** for Cross-Origin Resource Sharing
- **Morgan** for logging HTTP requests


## Project Overview

The Place Pulse backend server is architected to deliver a comprehensive RESTful API that facilitates interaction with client applications. It provides a variety of endpoints for managing users, properties, bookings, and notifications, all while ensuring data integrity and security. This design promotes efficient communication and a smooth user experience, making it an essential component of the Place Pulse ecosystem.


## Key Features

- **User Management**:
  - Secure user registration and authentication.
  - Password hashing for enhanced security.

- **Subscription System**:
  - Allow users to subscribe to services and manage subscription plans.

- **Property Management**:
  - Create, read, update, and delete property listings.

- **Booking System**:
  - Facilitate property bookings and manage transactions.

- **Stripe Integration**:
  - Handle payments securely through Stripe.

- **Messaging**:
  - Enable users to send and receive messages within the application.

- **Real-time Notifications**:
  - Send and receive notifications to users.

- **Analytics Dashboard**:
  - View insights and analytics for better decision-making.

- **Content Management**:
  - Manage blogs, FAQs, and other content.

## API Documentation

For detailed information on the available API endpoints and their usage, please refer to the [Postman API Documentation](https://documenter.getpostman.com/view/28965294/2sAXqzVdYq).

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/iibrahim70/place-pulse-server
   ```

2. Navigate to the project directory:

    ```bash
    cd givers-heaven-server
    ```

### Running the Server

1. Install dependencies:

    ```bash
    pnpm i
    ```

2. Set up environment variables:

    - Create a `.env` file in the root directory.
    - Define the following variables:

    ```bash
   PORT=5000
   IP_ADDRESS=your_ip_address
   NODE_ENV=development
   CORS_ORIGIN=http://your_local_host_url
   DATABASE_URL=mongodb://username:password@host:port/database
   COLLECTION_NAME=myDatabase
   BCRYPT_SALT_ROUNDS=10
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_ACCESS_EXPIRES_IN=1d
   JWT_REFRESH_EXPIRES_IN=30d
   SUPER_ADMIN_FULLNAME=your_super_admin_name
   SUPER_ADMIN_EMAIL=your_super_admin_email
   SUPER_ADMIN_PASSWORD=your_super_admin_password
   SUPER_ADMIN_ROLE=SUPER-ADMIN
   SUPER_ADMIN_IS_VERIFIED=true
   SUPER_ADMIN_STATUS=active
   SMTP_EMAIL_USER=your_smtp_user
   SMTP_EMAIL_PASS=your_smtp_password
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
    ```

3. Run the server:

    ```bash
    pnpm start:dev
    ```

The server will start running at http://your_ip_address:5000

## Contributing

Contributions are welcome! If you have any suggestions, improvements, or new features to add, please fork the repository and submit a pull request.




