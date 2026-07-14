import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import OwnerLedger from './OwnerLedger';
import OwnerTickets from './OwnerTickets';
import './Owner.css';

interface OwnerDashboardProps {
  ownerId: string;
}

export default function OwnerDashboard({ ownerId }: OwnerDashboardProps) {
  const { logout, userEmail } = useAuth();
  const [activeTab, setActiveTab] = useState<'tickets' | 'ledger'>('tickets');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="owner-dashboard">
      <div className="owner-header">
        <h1 className="owner-title">The Counter</h1>
        <div className="owner-user">
          <div className="owner-email">{userEmail}</div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="owner-tabs">
        <button
          className={`owner-tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Incoming Tickets
        </button>
        <button
          className={`owner-tab ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          Stock Ledger
        </button>
      </div>

      <div className="owner-content">
        {activeTab === 'tickets' && <OwnerTickets ownerId={ownerId} />}
        {activeTab === 'ledger' && <OwnerLedger ownerId={ownerId} />}
      </div>
    </div>
  );
}
