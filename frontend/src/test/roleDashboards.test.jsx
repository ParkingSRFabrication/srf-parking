import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContextModule from '../context/AuthContext.jsx';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';

describe('Role-Based Dashboards and Navigation Rendering', () => {
  it('Sidebar displays Administrator Governance menus for Admin role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { name: 'Admin User', role: 'admin', operatorId: 'ADM-001' },
      isAdmin: true,
      isOperator: false,
      isCustomer: false,
      logout: vi.fn(),
      getDashboardPath: () => '/admin/dashboard'
    });

    render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByText('Railway Administration')).toBeInTheDocument();
    expect(screen.getByText('Tariff & Pricing')).toBeInTheDocument();
    expect(screen.getByText('Booth Operators')).toBeInTheDocument();
    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('Reports & Accounts')).toBeInTheDocument();
  });

  it('Sidebar hides Administrator Governance menus for Parking Operator role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { name: 'Operator User', role: 'operator', operatorId: 'OP-001' },
      isAdmin: false,
      isOperator: true,
      isCustomer: false,
      logout: vi.fn(),
      getDashboardPath: () => '/operator/dashboard'
    });

    render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Railway Administration')).not.toBeInTheDocument();
    expect(screen.queryByText('Tariff & Pricing')).not.toBeInTheDocument();
    expect(screen.queryByText('Booth Operators')).not.toBeInTheDocument();
    expect(screen.getByText('Terminal Operations')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Entry')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Exit')).toBeInTheDocument();
  });

  it('Sidebar renders Vehicle Owner Portal menus exclusively for Customer role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { name: 'Priya Sharma', role: 'customer', operatorId: 'CUST-001' },
      isAdmin: false,
      isOperator: false,
      isCustomer: true,
      logout: vi.fn(),
      getDashboardPath: () => '/customer/dashboard'
    });

    render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByText('Vehicle Owner Portal')).toBeInTheDocument();
    expect(screen.getByText('My Registered Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Monthly Commuter Passes')).toBeInTheDocument();
    expect(screen.getByText('Parking History & Receipts')).toBeInTheDocument();
    // Verify operator/admin menus are completely absent
    expect(screen.queryByText('Railway Administration')).not.toBeInTheDocument();
    expect(screen.queryByText('Terminal Operations')).not.toBeInTheDocument();
  });

  it('BottomNav displays role-appropriate shortcuts for Customer vs Operator', () => {
    // Customer BottomNav
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { role: 'customer' },
      isAdmin: false,
      isOperator: false,
      isCustomer: true
    });

    const { rerender } = render(
      <BrowserRouter>
        <BottomNav onOpenMenu={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Receipts')).toBeInTheDocument();
    expect(screen.queryByText('Entry')).not.toBeInTheDocument();

    // Operator BottomNav
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { role: 'operator' },
      isAdmin: false,
      isOperator: true,
      isCustomer: false
    });

    rerender(
      <BrowserRouter>
        <BottomNav onOpenMenu={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByText('Entry')).toBeInTheDocument();
    expect(screen.getByText('Exit')).toBeInTheDocument();
    expect(screen.getByText('Tokens')).toBeInTheDocument();
  });
});
