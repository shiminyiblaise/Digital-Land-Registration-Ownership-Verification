# Digital Land Registration & Ownership Verification

A full-stack web application designed to manage land registration, marketplace listings, and ownership verification using blockchain and Supabase for backend services. It provides separate dashboards for administrators, land officers, sellers, and buyers, enabling secure and transparent transactions. To add it ensure security because it main objective is to fight against fruad such as selling of land twice, fight land with fake or non valided or proven document etc 
In a modern world like this technologies and skills ease life.

## 🚀 Features

- **User Authentication**: Secure sign-up/login with role-based access (Admin, Officer, Seller, Buyer).
- **Land Registration**: Officers can register new land, upload documents, and verify ownership.
- **Marketplace**: Sellers list lands for sale, buyers can browse and purchase.
- **Verification**: Users can verify land ownership and transaction history.
- **Dashboards**:
  - Admin Dashboard: Overview of users, lands, and transactions.
  - Officer Dashboard: Manage registrations, approvals, and verifications.
  - Seller & Buyer Dashboards: Track listings, purchases, and status.
- **Responsive UI**: Built with React, Tailwind CSS, and Radix UI components for accessibility.
- **Map Integration**: Visualize land locations using interactive maps.
- **Payment Modal**: Stub for processing payments (can be integrated with Stripe or similar).
- **Notifications**: Toast messages for real-time feedback.

## 📁 Project Structure

```
src/
├─ components/           # Reusable UI components
├─ contexts/             # React context providers (Auth, App)
├─ hooks/                # Custom React hooks
├─ lib/                  # Utility functions and Supabase client
├─ pages/                # Page components for routing
└─ ...
```

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI, Headless UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Maps**: Leaflet or other mapping library
- **State Management**: React Context & Hooks
- **Utilities**: Axios/fetch for API calls, clsx for conditional class names

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Digital-Land-Registration-Ownership-Verification.git
   cd Digital-Land-Registration-Ownership-Verification
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 📚 Usage

- Navigate to the homepage to explore the marketplace.
- Register as a new user, then request the appropriate role (Officer/Seller) if needed.
- Use the dashboard links to access role-specific features.
- Land details pages provide comprehensive information and verification options.

## 🧩 Customization & Development

- **Add new components**: Place in `src/components` and export where needed.
- **State & Context**: Update contexts in `src/contexts` for global state.
- **Routing**: Routes are configured in `src/main.tsx` using React Router.
- **Utility functions**: Add helpers in `src/lib/utils.ts`.

## 🧪 Testing

This project currently does not include automated tests. Consider adding tests with Jest and React Testing Library.

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`.
3. Make your changes and commit them: `git commit -m "Add new feature"`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request describing your changes.

## �️ Future Features

- **Blockchain Integration**: Store transactions on a public blockchain for enhanced immutability and transparency.
- **Payment Gateway**: Integrate Stripe or another payment provider for real land purchases.
- **Email Notifications**: Notify users of registration status, approvals, and transactions.
- **Advanced Search**: Filter marketplace listings by location, price, and property attributes.
- **Mobile App**: Develop a React Native or Flutter companion app for on-the-go access.
- **Role Request Workflow**: Allow users to request elevated roles (officer, seller) via an in-app process.
- **Audit Logs**: Track all actions performed by users for compliance and debugging.

## �📄 License

Distributed under the [MIT License](LICENSE). See the linked file for more information.
## 📞 Contact

Project maintained by **[shiminyi blaise G O](mailto:shiminyiblaise650@gmail.com)**.

---

*Happy coding! code with G O Tech 🏡🔗*
