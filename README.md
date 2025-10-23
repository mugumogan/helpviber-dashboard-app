# VibePulse: Admin Analytics Dashboard

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mugumogan/helpviber-dashboard-app)

VibePulse is a sophisticated, information-dense administration dashboard for the HelpViber platform. It provides administrators with a comprehensive, real-time, and historical overview of the ticketing system's health and performance. The UI is designed to be visually stunning, intuitively interactive, and exceptionally clear, leveraging modern data visualization techniques to make complex data easily digestible.

## ✨ Key Features

*   **Real-time & Historical Analytics:** Instantly switch between live data and historical trends with a dynamic date-range filter.
*   **Interactive KPI Dashboard:** At-a-glance view of key performance indicators like tickets resolved, average resolution time, and user satisfaction.
*   **Trend Analysis:** Visualize trending platforms and top issue types with interactive bar charts to identify patterns.
*   **Performance Over Time:** Track metrics like tickets created vs. resolved over selected time periods using elegant line charts.
*   **Comprehensive Ticket Management:** A detailed, filterable, and sortable table of all support tickets.
*   **Built on Cloudflare:** High-performance backend running on Cloudflare Workers with state managed by a single, powerful Durable Object.

## 🚀 Technology Stack

*   **Frontend:** [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Recharts](https://recharts.org/), [Zustand](https://zustand-demo.pmnd.rs/), [Framer Motion](https://www.framer.com/motion/)
*   **Backend:** [Cloudflare Workers](https://workers.cloudflare.com/), [Hono](https://hono.dev/)
*   **Storage:** [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Icons:** [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [Bun](https://bun.sh/)
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

```bash
# Install Wrangler globally if you haven't already
bun install -g wrangler
```

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd vibepulse_dashboard
    ```

2.  **Install dependencies:**
    This project uses Bun for package management.
    ```bash
    bun install
    ```

3.  **Authenticate with Cloudflare:**
    Log in to your Cloudflare account to be able to run the project locally and deploy it.
    ```bash
    wrangler login
    ```

### Running the Development Server

To start the development server, which includes both the Vite frontend and the Hono backend worker, run:

```bash
bun dev
```

This will start the application, typically on `http://localhost:3000`. The frontend will hot-reload on changes, and the worker will restart automatically.

## 🏗️ Project Structure

The project is organized into three main directories:

*   `src/`: Contains the React frontend application, including pages, components, hooks, and styles.
*   `worker/`: Contains the Cloudflare Worker backend code, built with Hono. This is where API routes and Durable Object logic reside.
*   `shared/`: Contains TypeScript types and mock data shared between the frontend and the backend to ensure type safety.

## 🔧 Development

### Frontend

*   All React components are located in `src/components`.
*   Pages are located in `src/pages`. The main dashboard is `src/pages/HomePage.tsx`.
*   Reusable UI elements are built using `shadcn/ui` and can be found in `src/components/ui`.
*   Global state is managed with Zustand.

### Backend

*   API endpoints are defined in `worker/user-routes.ts` using Hono's routing syntax.
*   Data models (Entities) for Durable Objects are defined in `worker/entities.ts`.
*   The core Durable Object logic is abstracted in `worker/core-utils.ts`. **Do not modify this file.**

To add a new API endpoint, open `worker/user-routes.ts` and add a new route handler.

## ☁️ Deployment

This project is configured for easy deployment to Cloudflare's global network.

1.  **Build the application:**
    This command bundles the frontend and prepares the worker for deployment.
    ```bash
    bun build
    ```

2.  **Deploy to Cloudflare:**
    Run the deploy command. Wrangler will handle the process of uploading your assets and worker script.
    ```bash
    bun deploy
    ```

Alternatively, deploy directly from your GitHub repository with a single click:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mugumogan/helpviber-dashboard-app)