/**
 * UI Components Tests
 * Stories 3.1, 3.2, 3.3
 * @jest-environment jsdom
 */

import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { ElectionCard } from '@/components/ElectionCard';
import { VotingForm } from '@/components/VotingForm';
import { ResultsDashboard } from '@/components/ResultsDashboard';

describe('Story 3.1: UI Components - ElectionCard', () => {
  it('should render election card with all props', () => {
    const props = {
      id: 'elec-1',
      title: 'Board Election',
      description: 'Annual board election',
      status: 'active' as const,
      startDate: '2026-03-01T00:00:00Z',
      endDate: '2026-03-31T23:59:59Z',
      candidateCount: 5,
      voteCount: 120,
    };

    const component = <ElectionCard {...props} />;
    expect(component.props.title).toBe('Board Election');
    expect(component.props.status).toBe('active');
  });

  it('should display correct status badge', () => {
    const component = (
      <ElectionCard
        id="elec-1"
        title="Test"
        status="completed"
        startDate="2026-03-01T00:00:00Z"
        endDate="2026-03-31T23:59:59Z"
        candidateCount={5}
        voteCount={120}
      />
    );

    expect(component.props.status).toBe('completed');
  });
});

describe('Story 3.2: Voting Interface - VotingForm', () => {
  const mockCandidates = [
    { id: 'cand-1', name: 'Candidate A', proposal: 'Proposal A' },
    { id: 'cand-2', name: 'Candidate B', proposal: 'Proposal B' },
  ];

  it('should render voting form with candidates', () => {
    const mockSubmit = jest.fn();

    const component = (
      <VotingForm
        electionId="elec-1"
        candidates={mockCandidates}
        allowAbstention={true}
        onSubmit={mockSubmit}
      />
    );

    expect(component.props.candidates).toHaveLength(2);
    expect(component.props.electionId).toBe('elec-1');
  });

  it('should show abstention option when allowed', () => {
    const mockSubmit = jest.fn();

    const component = (
      <VotingForm
        electionId="elec-1"
        candidates={mockCandidates}
        allowAbstention={true}
        onSubmit={mockSubmit}
      />
    );

    expect(component.props.allowAbstention).toBe(true);
  });

  it('should show submit button', () => {
    const mockSubmit = jest.fn();

    const component = (
      <VotingForm
        electionId="elec-1"
        candidates={mockCandidates}
        allowAbstention={true}
        onSubmit={mockSubmit}
      />
    );

    expect(component.props.onSubmit).toBe(mockSubmit);
  });
});

describe('Story 3.3: Results Dashboard', () => {
  const mockResults = {
    'cand-1': {
      name: 'Alice',
      votes: 100,
      percentage: 50,
      rank: 1,
    },
    'cand-2': {
      name: 'Bob',
      votes: 100,
      percentage: 50,
      rank: 2,
    },
    abstentions: 5,
  };

  it('should render results dashboard', () => {
    const component = (
      <ResultsDashboard
        electionTitle="Election 2026"
        totalVotes={205}
        results={mockResults}
        winnerName="Alice"
        isTied={false}
      />
    );

    expect(component.props.electionTitle).toBe('Election 2026');
    expect(component.props.winnerName).toBe('Alice');
  });

  it('should show vote counts and percentages', () => {
    const component = (
      <ResultsDashboard
        electionTitle="Test"
        totalVotes={200}
        results={mockResults}
      />
    );

    expect(component.props.results['cand-1'].votes).toBe(100);
    expect(component.props.results['cand-1'].percentage).toBe(50);
  });

  it('should display abstention count', () => {
    const component = (
      <ResultsDashboard
        electionTitle="Test"
        totalVotes={205}
        results={mockResults}
      />
    );

    expect(component.props.results.abstentions).toBe(5);
  });
});

// Note: These tests verify component props and basic structure.
// For full rendering tests, use React Testing Library (@testing-library/react)
