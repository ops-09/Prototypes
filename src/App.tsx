import { Navigate, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { CoverLetterPage } from './pages/CoverLetterPage';
import { Form1BeforeYouBeginPage } from './pages/Form1BeforeYouBeginPage';
import { Form1DraftSummaryPage } from './pages/Form1DraftSummaryPage';
import { Form1Page } from './pages/Form1Page';
import { Form1Step1Page } from './pages/Form1Step1Page';
import { Form1Step2Page } from './pages/Form1Step2Page';
import { Form1Step3Page } from './pages/Form1Step3Page';
import { Form1DirectorSubflowPage } from './pages/Form1DirectorSubflowPage';
import { Form1Step4Page } from './pages/Form1Step4Page';
import { Form1Step5Page } from './pages/Form1Step5Page';
import { Form1Step6Page } from './pages/Form1Step6Page';
import { Form1Step7Page } from './pages/Form1Step7Page';
import { Form1Step8Page } from './pages/Form1Step8Page';
import { Form1IncorporatorSubflowPage } from './pages/Form1IncorporatorSubflowPage';
import { Form2BeforeYouBeginPage } from './pages/Form2BeforeYouBeginPage';
import { Form2DraftSummaryPage } from './pages/Form2DraftSummaryPage';
import { Form2Page } from './pages/Form2Page';
import { Form2Step1Page } from './pages/Form2Step1Page';
import { Form2Step2Page } from './pages/Form2Step2Page';
import { Form2Step3Page } from './pages/Form2Step3Page';
import { Form2DirectorSubflowPage } from './pages/Form2DirectorSubflowPage';
import { Form2Step4Page } from './pages/Form2Step4Page';
import { Form2Step5Page } from './pages/Form2Step5Page';
import { Form2Step6Page } from './pages/Form2Step6Page';
import { Form2Step7Page } from './pages/Form2Step7Page';
import { Form2Step8Page } from './pages/Form2Step8Page';
import { Form2IncorporatorSubflowPage } from './pages/Form2IncorporatorSubflowPage';
import { Form7BeforeYouBeginPage } from './pages/Form7BeforeYouBeginPage';
import { Form7DraftSummaryPage } from './pages/Form7DraftSummaryPage';
import { Form7Page } from './pages/Form7Page';
import { Form7Step1Page } from './pages/Form7Step1Page';
import { Form7Step2Page } from './pages/Form7Step2Page';
import { Form7Step3Page } from './pages/Form7Step3Page';
import { Form7Step4Page } from './pages/Form7Step4Page';
import { Form10BeforeYouBeginPage } from './pages/Form10BeforeYouBeginPage';
import { Form10DraftSummaryPage } from './pages/Form10DraftSummaryPage';
import { Form10Page } from './pages/Form10Page';
import { Form10Step1Page } from './pages/Form10Step1Page';
import { Form10CooperativeSubflowPage } from './pages/Form10CooperativeSubflowPage';
import { Form10Step2Page } from './pages/Form10Step2Page';
import { Form10Step3Page } from './pages/Form10Step3Page';
import { Form10Step4Page } from './pages/Form10Step4Page';
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
        <Route path="/form-1" element={<Form1BeforeYouBeginPage />} />
        {/* Cover letter is step 1; Before you begin has no step number. */}
        <Route path="/form-1/step-1" element={<Form1Page />} />
        <Route path="/form-1/step-2" element={<Form1Step1Page />} />
        <Route path="/form-1/step-3" element={<Form1Step2Page />} />
        <Route path="/form-1/step-4" element={<Form1Step3Page />} />
        <Route path="/form-1/step-5" element={<Form1Step4Page />} />
        <Route
          path="/form-1/step-5/directors/new"
          element={<Form1DirectorSubflowPage />}
        />
        <Route
          path="/form-1/step-5/directors/:directorId"
          element={<Form1DirectorSubflowPage />}
        />
        <Route path="/form-1/step-6" element={<Form1Step5Page />} />
        <Route path="/form-1/step-7" element={<Form1Step6Page />} />
        <Route path="/form-1/step-8" element={<Form1Step7Page />} />
        <Route
          path="/form-1/step-8/incorporators/new"
          element={<Form1IncorporatorSubflowPage />}
        />
        <Route
          path="/form-1/step-8/incorporators/:incorporatorId"
          element={<Form1IncorporatorSubflowPage />}
        />
        <Route path="/form-1/step-9" element={<Form1Step8Page />} />
        <Route path="/form-1/draft-summary" element={<Form1DraftSummaryPage />} />
        <Route path="/form-2" element={<Form2BeforeYouBeginPage />} />
        <Route path="/form-2/step-1" element={<Form2Page />} />
        <Route path="/form-2/step-2" element={<Form2Step1Page />} />
        <Route path="/form-2/step-3" element={<Form2Step2Page />} />
        <Route path="/form-2/step-4" element={<Form2Step3Page />} />
        <Route path="/form-2/step-5" element={<Form2Step4Page />} />
        <Route
          path="/form-2/step-5/directors/new"
          element={<Form2DirectorSubflowPage />}
        />
        <Route
          path="/form-2/step-5/directors/:directorId"
          element={<Form2DirectorSubflowPage />}
        />
        <Route path="/form-2/step-6" element={<Form2Step5Page />} />
        <Route path="/form-2/step-7" element={<Form2Step6Page />} />
        <Route path="/form-2/step-8" element={<Form2Step7Page />} />
        <Route
          path="/form-2/step-8/incorporators/new"
          element={<Form2IncorporatorSubflowPage />}
        />
        <Route
          path="/form-2/step-8/incorporators/:incorporatorId"
          element={<Form2IncorporatorSubflowPage />}
        />
        <Route path="/form-2/step-9" element={<Form2Step8Page />} />
        <Route path="/form-2/draft-summary" element={<Form2DraftSummaryPage />} />
        <Route path="/form-7" element={<Form7BeforeYouBeginPage />} />
        {/* Cover letter is step 1; Before you begin has no step number. */}
        <Route path="/form-7/step-1" element={<Form7Page />} />
        <Route path="/form-7/step-2" element={<Form7Step1Page />} />
        <Route path="/form-7/step-3" element={<Form7Step2Page />} />
        <Route path="/form-7/step-4" element={<Form7Step3Page />} />
        <Route path="/form-7/step-5" element={<Form7Step4Page />} />
        <Route path="/form-7/draft-summary" element={<Form7DraftSummaryPage />} />
        <Route path="/form-10" element={<Form10BeforeYouBeginPage />} />
        {/* Cover letter is step 1; Before you begin has no step number. */}
        <Route path="/form-10/step-1" element={<Form10Page />} />
        <Route path="/form-10/step-2" element={<Form10Step1Page />} />
        <Route path="/form-10/step-3" element={<Form10Step2Page />} />
        <Route
          path="/form-10/step-3/cooperatives/new"
          element={<Form10CooperativeSubflowPage />}
        />
        <Route
          path="/form-10/step-3/cooperatives/:cooperativeId"
          element={<Form10CooperativeSubflowPage />}
        />
        <Route path="/form-10/step-4" element={<Form10Step3Page />} />
        <Route path="/form-10/step-5" element={<Form10Step4Page />} />
        <Route path="/form-10/draft-summary" element={<Form10DraftSummaryPage />} />

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
