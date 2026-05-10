NorthBridge Banking Co

Backend (PHP REST API)

    Architecture: Built a pure PHP REST API using a single api.php entry point with mysqli prepared statements for security.
    Authentication: Implemented JWT-based authentication with access and refresh tokens, and email OTP verification (OTP is logged to backend/mail.log for development).
    Core Banking: Implemented internal transfers with atomic transactions, tiered daily limits (Tier 1: $0, Tier 2: $5,000, Tier 3: $50,000), and transaction PIN verification.
    Savings: Developed a Fixed Deposits engine with interest calculations and KYC Tier 3 gating.
    Admin Panel: Created endpoints for analytics, user management, KYC review, and AML auto-flagging for transfers over $1,000,000.
    Security: Secured state-changing actions to only accept JSON input and implemented secure password/PIN hashing with bcrypt.

Frontend (React)

    Design: Built a professional UI using Tailwind CSS and the Chase Bank color palette (#117ACA, #0A2D5A).
    Dashboard: Implemented a central hub for balance, recent transactions, and quick actions.
    Onboarding: Created a multi-step registration and KYC upload flow.
    Investments: Built the Fixed Deposits interface with a real-time interest calculator.
    Statements: Implemented client-side PDF generation for formal bank statements.
    Admin Interface: Developed a full suite of administrative tools for monitoring the platform.

Next Steps

    Final Validation: I plan to perform a final check of the Admin panel and transfer limit enforcement to ensure everything is working as expected.
    Quality Assurance: I will complete the required testing, review, and reflection.
    Project Completion: I will then provide the finished codebase.
