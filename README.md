

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with TypeORM
- **AI**: OpenAI GPT-4 for medical analysis
- **Storage**: AWS S3 for file storage
- **Deployment**: Render

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- AWS S3 bucket
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clinical-ai-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`

5. Seed the database with sample data:
```bash
npm run seed
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

Start with Docker Compose:
```bash
docker-compose up -d
```

This will start:
- API server on port 3000
- PostgreSQL on port 5432


