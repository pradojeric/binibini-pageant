# Graph Report - binibini-pageant  (2026-10-21)

## Corpus Check
- Large corpus: 212 files · ~6,190,749 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 806 nodes · 1844 edges · 89 communities (29 shown, 60 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- React Pages & Form Components
- UI Primitives (Alert, Card, Avatar)
- Realtime Broadcast Events
- Pageant Controller & Results
- Candidate & Round Models
- Profile & Login Request
- Session & Password Auth
- Judge Management & User
- Admin Scoring & Deductions
- Password Reset & Verify Prompt
- Password Confirm & Base Controller
- Criteria CRUD
- Score Records & Score Service
- npm Package Manifest
- npm Dev Dependencies
- Candidate CRUD
- App & Broadcast Providers
- Score Controller & Aggregation
- Database Seeders
- Password & Registration Tests
- Route Service Provider
- User Factory & Core Config
- Role & Unique Score Migrations
- Password Confirmation Tests
- Composer Runtime Deps
- Password Reset Tests
- npm Runtime Deps
- Role & Guest Middleware
- Composer Dev Deps
- Frontend Bootstrap & Tailwind
- Inertia Shared Props
- Event Service Provider
- Composer Metadata
- Composer Plugin Config
- Email Verification Tests
- Console Kernel
- Exception Handler
- Authentication Tests
- PSR-4 Autoload
- Composer Scripts
- Users Table Migration
- Access Tokens Migration
- Round Name Migration
- User Soft Deletes Migration
- Test App Bootstrap
- JS Path Config
- Echo & Pusher Client
- Trust Hosts Middleware
- Auth Service Provider
- Password Reset Tokens Migration
- Failed Jobs Migration
- Pageants Table Migration
- Candidates Table Migration
- Criterias Table Migration
- Judge Pageant Migration
- Candidate Criteria Migration
- Pageant Award Migration
- Pageant Rounds Migration
- Candidate Rounds Migration
- Round Deductions Migration
- Unit Example Test
- HTTP Kernel
- Encrypt Cookies
- Maintenance Middleware
- Trim Strings
- Trust Proxies
- Validate Signature
- CSRF Middleware
- Test Autoload
- Composer Extra
- npm Scripts
- Print Ranking Table

## God Nodes (most connected - your core abstractions)
1. `Pageant` - 56 edges
2. `PrimaryButton()` - 52 edges
3. `User` - 47 edges
4. `@inertiajs/react` - 46 edges
5. `InputLabel()` - 41 edges
6. `InputError()` - 39 edges
7. `cn()` - 36 edges
8. `react` - 32 edges
9. `Controller` - 31 edges
10. `SecondaryButton()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `{closure#1}()` --calls--> `Candidate`  [EXTRACTED]
  database/seeders/MsPageantSeeder.php → app/Models/Candidate.php
- `{closure#1}()` --calls--> `Criteria`  [EXTRACTED]
  database/seeders/MsPageantSeeder.php → app/Models/Criteria.php
- `{closure#1}()` --calls--> `Pageant`  [EXTRACTED]
  database/seeders/MsPageantSeeder.php → app/Models/Pageant.php
- `{closure#1}()` --calls--> `PageantRound`  [EXTRACTED]
  database/seeders/MsPageantSeeder.php → app/Models/PageantRound.php
- `{closure#1}()` --calls--> `Pageant`  [EXTRACTED]
  app/Http/Controllers/PageantController.php → app/Models/Pageant.php

## Import Cycles
- None detected.

## Communities (89 total, 60 thin omitted)

### Community 0 - "React Pages & Form Components"
Cohesion: 0.08
Nodes (57): @heroicons/react, @inertiajs/react, react, react-lazy-load-image-component, ApplicationLogo(), Checkbox(), DangerButton(), InputError() (+49 more)

### Community 1 - "UI Primitives (Alert, Card, Avatar)"
Cohesion: 0.11
Nodes (22): @headlessui/react, Alert(), variants, Avatar(), Card(), CardBody(), Chip(), Content() (+14 more)

### Community 2 - "Realtime Broadcast Events"
Cohesion: 0.11
Nodes (6): GroupChanged, PageantEnded, RoundChanged, ScoresReset, ScoreSubmitted, {closure#1}()

### Community 3 - "Pageant Controller & Results"
Cohesion: 0.12
Nodes (4): {closure#3}(), PageantController, ScoreController, Pageant

### Community 4 - "Candidate & Round Models"
Cohesion: 0.14
Nodes (3): CandidateRound, PageantRound, RoundDeduction

### Community 5 - "Profile & Login Request"
Cohesion: 0.12
Nodes (3): ProfileController, LoginRequest, ProfileUpdateRequest

### Community 6 - "Session & Password Auth"
Cohesion: 0.13
Nodes (5): AuthenticatedSessionController, EmailVerificationNotificationController, PasswordController, PasswordResetLinkController, RegisteredUserController

### Community 7 - "Judge Management & User"
Cohesion: 0.15
Nodes (3): JudgeController, User, ProfileTest

### Community 10 - "Password Confirm & Base Controller"
Cohesion: 0.17
Nodes (5): ConfirmablePasswordController, VerifyEmailController, CandidateRoundController, Controller, PageantRoundController

### Community 11 - "Criteria CRUD"
Cohesion: 0.19
Nodes (3): CriteriaController, Criteria, ScoringTest

### Community 13 - "npm Package Manifest"
Cohesion: 0.14
Nodes (14): private, type, autoprefixer, clsx, flowbite, flowbite-react, laravel-vite-plugin, postcss (+6 more)

### Community 14 - "npm Dev Dependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, axios, @headlessui/react, @inertiajs/react, laravel-echo, laravel-vite-plugin, postcss (+7 more)

### Community 18 - "Database Seeders"
Cohesion: 0.21
Nodes (4): CandidateSeeder, DatabaseSeeder, {closure#1}(), MsPageantSeeder

### Community 20 - "Route Service Provider"
Cohesion: 0.22
Nodes (3): {closure#1}(), RouteServiceProvider, GET /user()

### Community 22 - "Role & Unique Score Migrations"
Cohesion: 0.25
Nodes (4): {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}()

### Community 23 - "Password Confirmation Tests"
Cohesion: 0.24
Nodes (3): PasswordConfirmationTest, ExampleTest, TestCase

### Community 24 - "Composer Runtime Deps"
Cohesion: 0.20
Nodes (10): require, guzzlehttp/guzzle, inertiajs/inertia-laravel, laravel/framework, laravel/reverb, laravel/sanctum, laravel/tinker, php (+2 more)

### Community 26 - "npm Runtime Deps"
Cohesion: 0.20
Nodes (10): dependencies, clsx, flowbite, flowbite-react, @heroicons/react, @material-tailwind/react, react-lazy-load-image-component, react-to-print (+2 more)

### Community 28 - "Composer Dev Deps"
Cohesion: 0.22
Nodes (9): require-dev, fakerphp/faker, laravel/breeze, laravel/pint, laravel/sail, mockery/mockery, nunomaduro/collision, phpunit/phpunit (+1 more)

### Community 29 - "Frontend Bootstrap & Tailwind"
Cohesion: 0.22
Nodes (4): @material-tailwind/react, react-dom, tailwindcss, withMT

### Community 32 - "Composer Metadata"
Cohesion: 0.25
Nodes (7): description, keywords, license, minimum-stability, name, prefer-stable, type

### Community 33 - "Composer Plugin Config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 38 - "PSR-4 Autoload"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 39 - "Composer Scripts"
Cohesion: 0.40
Nodes (5): scripts, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd

### Community 46 - "JS Path Config"
Cohesion: 0.40
Nodes (4): compilerOptions, baseUrl, paths, exclude

### Community 47 - "Echo & Pusher Client"
Cohesion: 0.40
Nodes (3): axios, laravel-echo, pusher-js

### Community 71 - "Test Autoload"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 72 - "Composer Extra"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

### Community 73 - "npm Scripts"
Cohesion: 0.67
Nodes (3): scripts, build, dev

## Knowledge Gaps
- **6 isolated node(s):** `@tailwindcss/forms`, `autoprefixer`, `postcss`, `@types/react`, `flowbite` (+1 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 241 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Pageant` connect `Pageant Controller & Results` to `Realtime Broadcast Events`, `Candidate & Round Models`, `Admin Scoring & Deductions`, `Criteria CRUD`, `Score Records & Score Service`, `Candidate CRUD`, `Score Controller & Aggregation`, `Database Seeders`, `Password & Registration Tests`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `@tailwindcss/forms`, `autoprefixer`, `postcss` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React Pages & Form Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08410794602698651 - nodes in this community are weakly interconnected._
- **Why does `User` connect `Judge Management & User` to `Realtime Broadcast Events`, `Pageant Controller & Results`, `Candidate & Round Models`, `Profile & Login Request`, `Session & Password Auth`, `Authentication Tests`, `Email Verification Tests`, `Password Reset & Verify Prompt`, `Criteria CRUD`, `Password & Registration Tests`, `Password Confirmation Tests`, `Password Reset Tests`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `UI Primitives (Alert, Card, Avatar)` be split into smaller, more focused modules?**
  _Cohesion score 0.10931174089068826 - nodes in this community are weakly interconnected._
- **Why does `Controller` connect `Password Confirm & Base Controller` to `Pageant Controller & Results`, `Profile & Login Request`, `Session & Password Auth`, `Judge Management & User`, `Admin Scoring & Deductions`, `Password Reset & Verify Prompt`, `Criteria CRUD`, `Candidate CRUD`, `Route Service Provider`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `Realtime Broadcast Events` be split into smaller, more focused modules?**
  _Cohesion score 0.1051693404634581 - nodes in this community are weakly interconnected._