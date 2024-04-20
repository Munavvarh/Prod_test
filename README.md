# CS490_Spring24
Code Translation and Conversion Tool:  
Building a code translation tool that converts code between programming languages,
with GPT-3 assisting in the translation process and ensuring code correctness.

## This is our project tech stack :

**Framework and Language:** React (JavaScript)  
**Component Library:** Tailwind CSS  
**API:** GraphQL  
**Backend Language:** JavaScript (Node.js)  
**Database:** SQLite  
**Authentication Model:** dbAuth  
**Unit Test Frameworks:** Jest  

## This is our project repo structure :

This repository contains the following structure, organized for a RedwoodJS project with a focus on simplicity and full-stack JavaScript development:

```plaintext
/cs490-project
├── api/                        # Backend layer using JavaScript (Node.js)
│   ├── src/
│   │   ├── functions/          # Serverless functions for backend logic
│   │   ├── graphql/            # GraphQL schema and resolvers
│   │   │   └── schemas/        # GraphQL SDL schema definitions
│   │   ├── services/           # Business logic interacting with SQLite via Prisma
│   │   └── lib/                # Shared backend utilities, including dbAuth setup
├── prisma/                     # Prisma ORM configuration for SQLite
│   ├── schema.prisma           # Data model definitions for Prisma, configuring SQLite
│   └── migrations/             # Database migration files for SQLite schema changes
├── web/                        # Frontend layer using React (JavaScript)
│   ├── src/
│   │   ├── components/         # Reusable React components, styled with Tailwind CSS
│   │   ├── layouts/            # Layout components for structuring pages
│   │   ├── pages/              # React components representing pages, routed via Redwood Router
│   │   │   └── {RouteName}/    # Folder for each page component, organized by route
│   │   ├── assets/             # Static assets like images and global Tailwind CSS files
│   │   └── Routes.tsx          # Route definitions for SPA navigation with Redwood Router
├── tests/                      # Unit and integration tests with Jest
│   ├── api/                    # Tests for the backend logic and services
│   └── web/                    # Tests for the frontend components and pages
├── .env                        # Environment variables, including database connection strings
├── redwood.toml                # Redwood project configuration file
└── package.json                # Project dependencies and scripts, including Tailwind CSS setup
