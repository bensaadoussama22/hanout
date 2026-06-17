import { Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import PullToRefresh from './components/layout/PullToRefresh';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingScreen from './components/auth/LoadingScreen';
import { useAuth } from './context/AuthContext';
import { useArticles } from './hooks/useArticles';
import { useFinance } from './hooks/useFinance';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <div className="relative">
      <div className="bg-blobs" />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function MainApp() {
  const { articles, addArticle, updateStatus, removeArticle, markInStore } = useArticles();
  const { transactions, addTransaction, removeTransaction, stats } = useFinance();

  return (
    <>
      <PullToRefresh>
        <div className="relative z-10">
          <Routes>
            <Route
              path="/"
              element={<Dashboard articles={articles} transactions={transactions} stats={stats} />}
            />
            <Route
              path="/articles"
              element={
                <Articles
                  articles={articles}
                  onAdd={addArticle}
                  onStatusChange={updateStatus}
                  onDelete={removeArticle}
                  onMarkInStore={markInStore}
                />
              }
            />
            <Route
              path="/finance"
              element={
                <Finance
                  transactions={transactions}
                  onAdd={addTransaction}
                  onDelete={removeTransaction}
                  stats={stats}
                />
              }
            />
            <Route
              path="/parametres"
              element={<Settings articles={articles} transactions={transactions} />}
            />
          </Routes>
        </div>
      </PullToRefresh>
      <BottomNav />
    </>
  );
}
