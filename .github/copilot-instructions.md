# AI Coding Assistant Instructions for PetLog Frontend

## Project Overview
This is a React-based pet care application using a **Hybrid FASD (Feature-App-Shared-Design)** architecture. The app provides features like AI diary generation, pet healthcare tracking, social feeds, shopping, and pet matching.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack) + Context API
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors
- **Package Manager**: pnpm
- **Build Tool**: Vite

## Architecture Patterns

### Folder Structure
```
src/
├── app/              # App-level setup (routing, providers)
├── shared/           # Cross-feature shared code
│   ├── ui/          # shadcn/ui components (button, dialog, etc.)
│   ├── components/  # Common layout components (header, logo)
│   ├── lib/         # Utilities (cn function, http-client)
│   └── hooks/       # Shared hooks (use-mobile, use-toast)
└── features/        # Feature-specific modules
    └── [feature]/   # e.g., auth/, diary/, healthcare/
        ├── api/     # API calls
        ├── components/ # Feature UI components
        ├── pages/   # Route pages
        ├── context/ # Feature state (if needed)
        ├── hooks/   # Feature hooks
        ├── data/    # Mock data/constants
        └── types/   # Feature TypeScript types
```

### Key Conventions

#### Path Aliases
- `@/` → `src/`
- `@/app/*` → `src/app/*`
- `@/shared/*` → `src/shared/*`
- `@/features/*` → `src/features/*`

#### Component Patterns
- Use shadcn/ui components from `@/shared/ui/`
- Apply `cn()` utility for conditional classes: `cn("base-class", condition && "conditional-class")`
- Follow component composition with `asChild` prop for flexible rendering

#### API Communication
- Use `httpClient` from `@/shared/api/http-client.ts`
- Automatic Bearer token injection via interceptors
- Base URL: `/api` (proxied to `http://localhost:8000` in dev)
- Example: `await httpClient.get<Pet[]>('/pets')`

#### State Management
- React Query for server state (API data)
- Context API for client state (auth, cart, etc.)
- Feature-specific contexts in `features/[feature]/context/`

#### TypeScript Types
- Define interfaces in `features/[feature]/types/`
- Use shared types from `@/shared/types/`
- Strict mode enabled with no unused variables

## Development Workflow

### Commands
```bash
# Development server
pnpm run dev

# Build for production
pnpm run build

# TypeScript + ESLint check
pnpm run lint
```

### API Integration
- Backend runs on `http://localhost:8000`
- Vite proxy configured for `/api` requests
- Token stored in `localStorage` as `petlog_token`
- Auth context manages token via `setTokenGetter()` and `setTokenRemover()`

### Feature Development
1. Create feature folder under `src/features/`
2. Add API calls in `api/` using `httpClient`
3. Build UI components in `components/` using shared/ui
4. Create pages in `pages/` for routing
5. Define types in `types/`
6. Update `App.tsx` routes if adding new pages

### UI Component Usage
- Import from `@/shared/ui/`: `import { Button, Card } from "@/shared/ui"`
- Use `cn()` for class merging: `className={cn("text-sm", isActive && "font-bold")}`
- Follow shadcn patterns: variants, sizes, asChild prop

### Common Patterns
- **Forms**: Use `react-hook-form` with shadcn form components
- **Icons**: Lucide React icons
- **Animations**: Framer Motion for complex animations
- **3D**: React Three Fiber for 3D components
- **Charts**: Recharts for data visualization
- **Dates**: date-fns for date manipulation

## Code Examples

### API Call
```typescript
// features/diary/api/diary-api.ts
import { httpClient } from "@/shared/api/http-client";

export const getDiaries = (userId: number) =>
  httpClient.get<Diary[]>(`/diaries?userId=${userId}`);
```

### Component with shadcn/ui
```tsx
// features/diary/components/DiaryCard.tsx
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface DiaryCardProps {
  title: string;
  content: string;
  isPublic: boolean;
}

export const DiaryCard = ({ title, content, isPublic }: DiaryCardProps) => (
  <Card className={cn("p-4", !isPublic && "opacity-75")}>
    <CardHeader>
      <h3 className="text-lg font-semibold">{title}</h3>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{content}</p>
      <Button variant="outline" size="sm" className="mt-2">
        View Details
      </Button>
    </CardContent>
  </Card>
);
```

### Route Page
```tsx
// features/diary/pages/DiaryListPage.tsx
import { useQuery } from "@tanstack/react-query";
import { getDiaries } from "../api/diary-api";
import { DiaryCard } from "../components/DiaryCard";

export const DiaryListPage = () => {
  const { data: diaries, isLoading } = useQuery({
    queryKey: ["diaries"],
    queryFn: () => getDiaries(1), // userId from auth context
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {diaries?.map((diary) => (
        <DiaryCard key={diary.id} {...diary} />
      ))}
    </div>
  );
};
```

## Migration Context
This codebase is migrating from a flat structure to FASD architecture. When working with existing code:
- Prefer new FASD structure for new features
- Gradually migrate old code when modifying
- Update imports to use new path aliases
- Reference `readme.md` for migration details

## Quality Standards
- TypeScript strict mode: no unused vars, strict types
- ESLint: max 0 warnings
- Component naming: PascalCase for components, camelCase for instances
- File naming: PascalCase for components/pages, kebab-case for utilities
- Commit messages: English, imperative mood ("Add feature" not "Added feature")</content>
<parameter name="filePath">/Applications/PJ3_Project/FrontEnd/Frontend/.github/copilot-instructions.md