import { Navigate, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { CoverLetterPage } from './pages/CoverLetterPage';
import { Form1DraftSummaryPage } from './pages/Form1DraftSummaryPage';
import { Form1Page } from './pages/Form1Page';
import { Form1Step1Page } from './pages/Form1Step1Page';
import { Form1Step2Page } from './pages/Form1Step2Page';
import { Form1Step3Page } from './pages/Form1Step3Page';
import { Form1Step4Page } from './pages/Form1Step4Page';
import { Form7DraftSummaryPage } from './pages/Form7DraftSummaryPage';
import { Form7Page } from './pages/Form7Page';
import { Form7Step1Page } from './pages/Form7Step1Page';
import { Form7Step2Page } from './pages/Form7Step2Page';
import { Form7Step3Page } from './pages/Form7Step3Page';
import { Form7Step4Page } from './pages/Form7Step4Page';
import { HomePage } from './pages/HomePage';
import { InviteUserPage } from './pages/InviteUserPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { UserManagementPage } from './pages/UserManagementPage';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cover-letter" element={<CoverLetterPage />} />
        <Route path="/form-1" element={<Form1Page />} />
        <Route path="/form-1/step-1" element={<Form1Step1Page />} />
        <Route path="/form-1/step-2" element={<Form1Step2Page />} />
        <Route path="/form-1/step-3" element={<Form1Step3Page />} />
        <Route path="/form-1/step-4" element={<Form1Step4Page />} />
        <Route path="/form-1/draft-summary" element={<Form1DraftSummaryPage />} />
        <Route path="/form-7" element={<Form7Page />} />
        <Route path="/form-7/step-1" element={<Form7Step1Page />} />
        <Route path="/form-7/step-2" element={<Form7Step2Page />} />
        <Route path="/form-7/step-3" element={<Form7Step3Page />} />
        <Route path="/form-7/step-4" element={<Form7Step4Page />} />
        <Route path="/form-7/draft-summary" element={<Form7DraftSummaryPage />} />

        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/user-management/invite" element={<InviteUserPage />} />
        <Route
          path="/dashboard"
          element={
            <PlaceholderPage
              title="Dashboard"
              description="Overview of activity for this business profile."
            />
          }
        />
        <Route
          path="/notifications"
          element={
            <PlaceholderPage
              title="Notifications"
              description="View alerts and updates for this business profile."
            />
          }
        />
        <Route
          path="/services"
          element={
            <PlaceholderPage
              title="Services"
              description="Access ServiceOntario business services."
            />
          }
        />
        <Route
          path="/transactions"
          element={
            <PlaceholderPage
              title="Transactions"
              description="Review transaction history for this business profile."
            />
          }
        />
        <Route
          path="/business-profile"
          element={
            <PlaceholderPage
              title="Business profile"
              description="View and manage registered business information."
            />
          }
        />
        <Route
          path="/your-account"
          element={
            <PlaceholderPage
              title="Your account"
              description="Manage your Ontario Business Account settings."
            />
          }
        />
        <Route
          path="/add-business-profile"
          element={
            <PlaceholderPage
              title="Add business profile"
              description="Register another business to your Ontario Business Account."
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
