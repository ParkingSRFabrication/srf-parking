import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { BrandLogo } from '../components/common/BrandLogo.jsx';

describe('Frontend Component Tests', () => {
  it('Renders BrandLogo with SR Fabrication text', () => {
    render(<BrandLogo />);
    expect(screen.getByText('SR FABRICATION')).toBeInTheDocument();
    expect(screen.getByText('RAILWAY PARKING MANAGEMENT SYSTEM')).toBeInTheDocument();
  });

  it('Renders StatusBadge for INSIDE status with pulse dot', () => {
    render(<StatusBadge status="INSIDE" />);
    expect(screen.getByText('INSIDE')).toBeInTheDocument();
  });

  it('Renders StatusBadge for EXITED status', () => {
    render(<StatusBadge status="EXITED" />);
    expect(screen.getByText('EXITED')).toBeInTheDocument();
  });

  it('Renders StatusBadge for ACTIVE monthly pass', () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });
});
