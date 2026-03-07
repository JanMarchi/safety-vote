/**
 * Election Card Component
 * Story 3.1: UI Components
 */

import React from 'react';

export interface ElectionCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  candidateCount: number;
  voteCount: number;
  onClick?: () => void;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({
  id,
  title,
  description,
  status,
  startDate,
  endDate,
  candidateCount,
  voteCount,
  onClick,
}) => {
  const statusColors: { [key: string]: string } = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: { [key: string]: string } = {
    draft: 'Rascunho',
    active: 'Ativa',
    completed: 'Finalizada',
    cancelled: 'Cancelada',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[status]
          }`}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Início</p>
          <p className="font-medium">{formatDate(startDate)}</p>
        </div>
        <div>
          <p className="text-gray-600">Término</p>
          <p className="font-medium">{formatDate(endDate)}</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <div>
          <p className="text-gray-600">Candidatos</p>
          <p className="font-bold text-lg">{candidateCount}</p>
        </div>
        <div>
          <p className="text-gray-600">Votos</p>
          <p className="font-bold text-lg">{voteCount}</p>
        </div>
      </div>
    </div>
  );
};
